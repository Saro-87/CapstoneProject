"""Fetch and persist real provider cost rows into cloud_costs."""
from datetime import date, datetime
from importlib import import_module
from typing import Any

from fastapi import HTTPException
from sqlalchemy import text

from app.database import engine

PROVIDERS = {"aws": "connectors.aws", "azure": "connectors.azure", "gcp": "connectors.gcp"}


def _parse_date(value: Any) -> date:
    if isinstance(value, date) and not isinstance(value, datetime):
        return value
    raw = str(value or "")
    for fmt in ("%Y-%m-%d", "%Y%m%d", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(raw[:19], fmt).date()
        except ValueError:
            continue
    raise ValueError(f"Unsupported billing date returned by provider: {raw!r}")


def sync_provider(provider: str, start_date: date, end_date: date) -> dict:
    """Replace the selected provider/date window with successfully fetched USD rows.

    end_date is inclusive for this API. The provider connectors use an exclusive
    end date, so pass end_date + one day to them. No database writes occur until
    the entire provider response has been validated.
    """
    key = provider.strip().lower()
    if key not in PROVIDERS:
        raise HTTPException(status_code=422, detail="provider must be aws, azure, or gcp")
    if end_date < start_date:
        raise HTTPException(status_code=422, detail="end_date must be on or after start_date")

    try:
        connector = import_module(PROVIDERS[key])
        result = connector.fetch_cost_and_usage(
            start_date=start_date.isoformat(),
            end_date=(end_date.fromordinal(end_date.toordinal() + 1)).isoformat(),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"{key.upper()} billing fetch failed. Check credentials, API permissions, and billing access.",
        ) from exc

    source_rows = result.get("rows", [])
    if key == "gcp" or any(row.get("cost_usd") is None for row in source_rows):
        raise HTTPException(
            status_code=501,
            detail="GCP cost ingestion requires a configured Cloud Billing BigQuery export; no costs were written.",
        )

    validated = []
    for row in source_rows:
        currency = str(row.get("currency") or "").upper()
        if currency != "USD":
            raise HTTPException(
                status_code=422,
                detail=f"{key.upper()} returned {currency or 'unknown'} currency. Only USD records can be stored until currency conversion is configured.",
            )
        amount = float(row["cost_usd"])
        if amount < 0:
            # Credits/refunds may legitimately be negative, so preserve them.
            pass
        validated.append({
            "provider": key.upper(),
            "service": str(row.get("service") or "Unknown"),
            "region": str(row.get("region") or "Unknown"),
            "cost": amount,
            "usage": row.get("usage_quantity"),
            "billing_date": _parse_date(row.get("date")).isoformat(),
        })

    # Delete only after fetch and validation have succeeded. If the API returns
    # no rows, do not erase the existing window: it may be an access/config issue.
    if not validated:
        return {
            "status": "success", "provider": key.upper(), "rows_written": 0,
            "start_date": start_date.isoformat(), "end_date": end_date.isoformat(),
            "message": "Provider returned no cost rows; existing data was preserved.",
        }

    with engine.begin() as connection:
        connection.execute(text("""
            DELETE FROM cloud_costs
            WHERE UPPER(provider) = :provider
              AND billing_date >= :start_date AND billing_date <= :end_date
        """), {
            "provider": key.upper(),
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
        })
        connection.execute(text("""
            INSERT INTO cloud_costs (provider, service, region, cost, usage, billing_date)
            VALUES (:provider, :service, :region, :cost, :usage, :billing_date)
        """), validated)

    return {
        "status": "success", "provider": key.upper(), "rows_written": len(validated),
        "start_date": start_date.isoformat(), "end_date": end_date.isoformat(),
        "currency": "USD",
    }

