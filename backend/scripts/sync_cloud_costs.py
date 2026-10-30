"""Run provider billing ingestion from Task Scheduler or a terminal.

Example from repository root:
    backend\.venv\Scripts\python.exe backend\scripts\sync_cloud_costs.py --days 7
"""
import argparse
import json
import sys
from datetime import date, timedelta
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
REPOSITORY_ROOT = BACKEND_ROOT.parent
sys.path.insert(0, str(BACKEND_ROOT))
sys.path.insert(0, str(REPOSITORY_ROOT))

from fastapi import HTTPException
from app.services.cost_sync import sync_provider


def main() -> int:
    parser = argparse.ArgumentParser(description="Fetch and persist cloud billing costs.")
    parser.add_argument("--start-date", help="Inclusive start date (YYYY-MM-DD).")
    parser.add_argument("--end-date", help="Inclusive end date (YYYY-MM-DD).")
    parser.add_argument("--days", type=int, default=7, help="Look-back window when dates are omitted (default: 7).")
    parser.add_argument("--providers", nargs="+", choices=["aws", "azure", "gcp"], default=["aws", "azure", "gcp"])
    args = parser.parse_args()

    if args.days < 1 or args.days > 3650:
        parser.error("--days must be between 1 and 3650")

    today = date.today()
    end = date.fromisoformat(args.end_date) if args.end_date else today - timedelta(days=1)
    start = date.fromisoformat(args.start_date) if args.start_date else end - timedelta(days=args.days - 1)
    if end < start:
        parser.error("--end-date must be on or after --start-date")

    results = {}
    for provider in args.providers:
        try:
            results[provider] = sync_provider(provider, start, end)
        except HTTPException as exc:
            results[provider] = {
                "status": "error",
                "status_code": exc.status_code,
                "message": exc.detail,
            }
        except Exception as exc:
            results[provider] = {"status": "error", "message": str(exc)}

    print(json.dumps({
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "providers": results,
    }, indent=2, default=str))
    return 0 if all(item.get("status") == "success" for item in results.values()) else 1


if __name__ == "__main__":
    raise SystemExit(main())
