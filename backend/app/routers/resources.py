from fastapi import APIRouter
from sqlalchemy import text

from app.database import engine

router = APIRouter()


@router.get("/resources")
def get_resources():

    with engine.connect() as conn:

        result = conn.execute(text("""
            SELECT
                provider,
                resource_name,
                resource_type,
                region,
                status,
                monthly_cost
            FROM resources
        """))

        rows = result.fetchall()

    return [
        {
            "provider": row.provider,
            "resource_name": row.resource_name,
            "resource_type": row.resource_type,
            "region": row.region,
            "status": row.status,
            "monthly_cost": float(row.monthly_cost) if row.monthly_cost is not None else None,
        }
        for row in rows
    ]