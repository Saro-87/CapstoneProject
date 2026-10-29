from fastapi import APIRouter
from sqlalchemy import text

from app.database import engine

router = APIRouter()


@router.get("/recommendations")
def get_recommendations():

    with engine.connect() as conn:

        result = conn.execute(text("""
            SELECT
                id,
                provider,
                recommendation,
                estimated_savings
            FROM recommendations
            ORDER BY estimated_savings DESC
        """))

        rows = result.fetchall()

    return [
        {
            "id": row.id,
            "provider": row.provider,
            "recommendation": row.recommendation,
            "estimated_savings": float(row.estimated_savings),
        }
        for row in rows
    ]