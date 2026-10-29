from fastapi import APIRouter
from sqlalchemy import text

from app.database import engine

router = APIRouter()


@router.get("/alerts")
def get_alerts():

    with engine.connect() as conn:

        result = conn.execute(text("""
            SELECT
                id,
                provider,
                severity,
                message,
                created_at
            FROM alerts
            ORDER BY created_at DESC
        """))

        rows = result.fetchall()

    return [
        {
            "id": row.id,
            "provider": row.provider,
            "severity": row.severity,
            "message": row.message,
            "created_at": row.created_at,
        }
        for row in rows
    ]