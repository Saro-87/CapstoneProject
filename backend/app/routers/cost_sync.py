"""Cost ingestion endpoints for AWS, Azure and GCP billing integrations."""
from datetime import date

from fastapi import APIRouter, HTTPException

from app.services.cost_sync import sync_provider

router = APIRouter(prefix="/api/sync", tags=["Cloud cost synchronization"])


def _date_window(start_date: date | None, end_date: date | None) -> tuple[date, date]:
    today = date.today()
    start = start_date or today.replace(day=1)
    end = end_date or today
    if end < start:
        raise HTTPException(status_code=422, detail="end_date must be on or after start_date")
    return start, end


@router.post("/all")
def sync_all_cloud_costs(start_date: date | None = None, end_date: date | None = None):
    """Attempt each cloud independently and return per-provider results."""
    start, end = _date_window(start_date, end_date)
    results = {}
    for provider in ("aws", "azure", "gcp"):
        try:
            results[provider] = sync_provider(provider, start, end)
        except Exception as exc:
            results[provider] = {
                "status": "error",
                "status_code": getattr(exc, "status_code", 500),
                "message": getattr(exc, "detail", "Unexpected synchronization failure"),
            }
    failed = any(value.get("status") != "success" for value in results.values())
    succeeded = any(value.get("status") == "success" for value in results.values())
    return {
        "status": "partial" if failed and succeeded else ("error" if failed else "success"),
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "providers": results,
    }


@router.post("/{provider}")
def sync_cloud_costs(provider: str, start_date: date | None = None, end_date: date | None = None):
    """Fetch one provider date range and store validated USD billing rows.

    Dates are inclusive for callers. GCP remains blocked until BigQuery billing
    export ingestion is implemented, so it never inserts placeholder costs.
    """
    start, end = _date_window(start_date, end_date)
    return sync_provider(provider, start, end)

