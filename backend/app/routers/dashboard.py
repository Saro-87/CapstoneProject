from datetime import date, timedelta

from fastapi import APIRouter, Query
from sqlalchemy import text

from app.database import engine

router = APIRouter()


def _month_expression() -> str:
    """Return a month grouping expression supported by the configured DB."""
    if engine.dialect.name == "sqlite":
        return "strftime('%Y-%m', billing_date)"
    return "TO_CHAR(billing_date, 'YYYY-MM')"


@router.get("/dashboard")
def dashboard(
    cloud: str = "all",
    region: str = "all",
    service: str = "all",
    dateRange: int = Query(default=30, ge=1, le=3650),
):
    """Return persisted costs filtered by provider, region, service and date."""
    where = []
    params = {}

    if cloud.lower() != "all":
        where.append("UPPER(provider) = :provider")
        params["provider"] = cloud.strip().upper()

    if region.lower() != "all":
        where.append("region = :region")
        params["region"] = region.strip()

    if service.lower() != "all":
        where.append("service = :service")
        params["service"] = service.strip()

    start_date = date.today() - timedelta(days=dateRange - 1)
    where.append("billing_date >= :start_date")
    params["start_date"] = start_date.isoformat()
    where_clause = "WHERE " + " AND ".join(where)

    with engine.connect() as conn:
        rows = conn.execute(
            text(f"""
                SELECT UPPER(provider) AS provider, COALESCE(SUM(cost), 0) AS total
                FROM cloud_costs
                {where_clause}
                GROUP BY UPPER(provider)
            """),
            params,
        ).mappings().all()

    totals = {"AWS": 0.0, "AZURE": 0.0, "GCP": 0.0}
    for row in rows:
        provider = row["provider"]
        if provider in totals:
            totals[provider] = float(row["total"] or 0)

    return {
        "filters": {
            "cloud": cloud,
            "region": region,
            "service": service,
            "dateRange": dateRange,
            "startDate": start_date.isoformat(),
            "endDate": date.today().isoformat(),
        },
        "total_cost": sum(totals.values()),
        "aws": totals["AWS"],
        "azure": totals["AZURE"],
        "gcp": totals["GCP"],
    }


@router.get("/dashboard/monthly-history")
def monthly_history(cloud: str = "all"):
    """Return monthly totals from the stored cloud_costs table."""
    params = {}
    where = []
    if cloud.lower() != "all":
        where.append("UPPER(provider) = :provider")
        params["provider"] = cloud.strip().upper()

    where_clause = "WHERE " + " AND ".join(where) if where else ""
    month_expr = _month_expression()

    with engine.connect() as conn:
        rows = conn.execute(
            text(f"""
                SELECT {month_expr} AS month, COALESCE(SUM(cost), 0) AS cost
                FROM cloud_costs
                {where_clause}
                GROUP BY {month_expr}
                ORDER BY month
            """),
            params,
        ).mappings().all()

    return {
        "status": "success",
        "history": [
            {"month": row["month"], "cost": float(row["cost"] or 0)}
            for row in rows
        ],
    }
