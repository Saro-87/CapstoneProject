from fastapi import APIRouter
from sqlalchemy import text

from app.database import engine

router = APIRouter()


@router.get("/dashboard")
def dashboard(
    cloud: str = "all",
    region: str = "all",
    service: str = "all",
    dateRange: int = 30,
):
    """
    Dashboard API with filters
    """

    where = []

    params = {}

    if cloud != "all":
        where.append("provider = :provider")
        params["provider"] = cloud.upper()

    if region != "all":
        where.append("region = :region")
        params["region"] = region

    if service != "all":
        where.append("service = :service")
        params["service"] = service

    where_clause = ""

    if where:
        where_clause = "WHERE " + " AND ".join(where)

    with engine.connect() as conn:

        query = text(f"""
            SELECT
                provider,
                COALESCE(SUM(cost),0) AS total
            FROM cloud_costs
            {where_clause}
            GROUP BY provider
        """)

        rows = conn.execute(query, params).fetchall()

    aws = 0
    azure = 0
    gcp = 0

    for provider, total in rows:

        if provider.upper() == "AWS":
            aws = total

        elif provider.upper() == "AZURE":
            azure = total

        elif provider.upper() == "GCP":
            gcp = total

    return {
        "filters": {
            "cloud": cloud,
            "region": region,
            "service": service,
            "dateRange": dateRange,
        },
        "total_cost": aws + azure + gcp,
        "aws": aws,
        "azure": azure,
        "gcp": gcp,
    }


@router.get("/dashboard/monthly-history")
def monthly_history(
    cloud: str = "all",
):
    params = {}

    where = []

    if cloud != "all":
        where.append("provider = :provider")
        params["provider"] = cloud.upper()

    where_clause = ""

    if where:
        where_clause = "WHERE " + " AND ".join(where)

    with engine.connect() as conn:

        query = text(f"""
            SELECT
                TO_CHAR(billing_date,'YYYY-MM') AS month,
                SUM(cost) AS cost
            FROM cloud_costs
            {where_clause}
            GROUP BY TO_CHAR(billing_date,'YYYY-MM')
            ORDER BY month
        """)

        rows = conn.execute(query, params).fetchall()

    history = [
        {
            "month": row.month,
            "cost": float(row.cost),
        }
        for row in rows
    ]

    return {
        "status": "success",
        "history": history,
    }