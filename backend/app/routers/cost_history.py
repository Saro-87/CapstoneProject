from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import text

from app.database import engine

router = APIRouter()


@router.get("/cost-history")
def get_cost_history(
    provider: str = Query(default="all", description="AWS, Azure, GCP, or all"),
):
    """Return monthly totals from persisted billing records; never fabricate costs."""
    normalized_provider = provider.strip().upper()
    if normalized_provider not in {"ALL", "AWS", "AZURE", "GCP"}:
        raise HTTPException(status_code=422, detail="provider must be all, AWS, Azure, or GCP")

    # Use a month expression supported by the configured database engine.
    month_expression = (
        "strftime('%Y-%m', billing_date)"
        if engine.dialect.name == "sqlite"
        else "TO_CHAR(billing_date, 'YYYY-MM')"
    )
    filters = ""
    params = {}
    if normalized_provider != "ALL":
        filters = "WHERE UPPER(provider) = :provider"
        params["provider"] = normalized_provider

    query = text(f"""
        SELECT {month_expression} AS month, SUM(cost) AS cost
        FROM cloud_costs
        {filters}
        GROUP BY {month_expression}
        ORDER BY month
    """)

    try:
        with engine.connect() as connection:
            rows = connection.execute(query, params).mappings().all()
    except Exception as exc:
        # Do not silently fall back to demo values if the schema is missing.
        raise HTTPException(
            status_code=503,
            detail="Cost history is unavailable. Verify database connectivity and the cloud_costs schema.",
        ) from exc

    return [
        {"month": row["month"], "cost": float(row["cost"] or 0)}
        for row in rows
    ]
