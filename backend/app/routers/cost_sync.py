"""Cost ingestion endpoints for AWS, Azure and GCP billing integrations."""
from datetime import date, timedelta

from fastapi import APIRouter, Query

from app.services.cost_sync import sync_provider

router = APIRouter(prefix="/api/sync", tags=["Cloud cost synchronization"])


@router.post("/{provider}")
def sync_cloud_costs(
    provider: str,
    start_date: date = Query(default_factory=lambda: date.today().replace(day=1)),
    end_date: date = Query(default_factory=date.today),
):
    """Fetch a provider date range and store validated USD billing rows.

    Dates are inclusive for callers. AWS/Azure connector calls use their
    respective APIs; GCP remains blocked until BigQuery billing export is wired.
    """
    return sync_provider(provider, start_date, end_date)


@router.post("/all")
def sync_all_cloud_costs(
    start_date: date = Query(default_factory=lambda: date.today().replace(day=1)),
    end_date: date = Query(default_factory=date.today),
):
    """Attempt each cloud independently and return per-provider results."""
    results = {}
    for provider in ("aws", "azure", "gcp"):
        try:
            results[provider] = sync_provider(provider, start_date, end_date)
        except Exception as exc:
            status_code = getattr(exc, "status_code", 500)
            detail = getattr(exc, "detail", "Unexpected synchronization failure")
            results[provider] = {"status": "error", "status_code": status_code, "message": detail}
    failed = any(value.get("status") != "success" for value in results.values())
    return {
        "status": "partial" if failed and any(v.get("status") == "success" for v in results.values()) else ("error" if failed else "success"),
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "providers": results,
    }

