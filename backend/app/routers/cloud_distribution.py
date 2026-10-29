from fastapi import APIRouter
from sqlalchemy import text

from app.database import engine

router = APIRouter()


@router.get("/cloud-distribution")
def cloud_distribution():

    with engine.connect() as conn:

        result = conn.execute(text("""
            SELECT
                provider,
                SUM(cost) AS total_cost
            FROM cloud_costs
            GROUP BY provider
            ORDER BY provider
        """))

        rows = result.fetchall()

    return [
        {
            "name": row.provider,
            "value": float(row.total_cost),
        }
        for row in rows
    ]