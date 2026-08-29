"""
scripts/fetch_sample_data.py

Pulls 30 days of cost data from all three providers and saves
raw JSON to data/raw/ for Sprint 1 analysis.

Usage:
    python scripts/fetch_sample_data.py
    python scripts/fetch_sample_data.py --start 2024-11-01 --end 2024-11-30
"""

import sys
import os
import json
import argparse
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from connectors import aws, azure, gcp


def save(data: dict, path: str):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2, default=str)
    print(f"  → Saved {len(data.get('rows', []))} rows to {path}")


def main():
    parser = argparse.ArgumentParser(description="Fetch sample cloud cost data")
    parser.add_argument("--start", default=None, help="Start date YYYY-MM-DD")
    parser.add_argument("--end",   default=None, help="End date   YYYY-MM-DD")
    args = parser.parse_args()

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    print(f"\nFetching data for period: {args.start or 'last 30 days'} → {args.end or 'today'}\n")

    # ── AWS ──────────────────────────────────────────
    print("[1/3] AWS Cost Explorer...")
    try:
        data = aws.fetch_cost_and_usage(args.start, args.end)
        save(data, f"data/raw/aws_{ts}.json")
    except Exception as e:
        print(f"  ✗ AWS fetch failed: {e}")

    # ── Azure ────────────────────────────────────────
    print("[2/3] Azure Cost Management...")
    try:
        data = azure.fetch_cost_and_usage(args.start, args.end)
        save(data, f"data/raw/azure_{ts}.json")
    except Exception as e:
        print(f"  ✗ Azure fetch failed: {e}")

    # ── GCP ──────────────────────────────────────────
    print("[3/3] GCP Cloud Billing...")
    try:
        data = gcp.fetch_cost_and_usage(args.start, args.end)
        save(data, f"data/raw/gcp_{ts}.json")
    except Exception as e:
        print(f"  ✗ GCP fetch failed: {e}")

    print("\nDone. Check data/raw/ for output files.")
    print("These JSON files are the input to Sprint 2's aggregation scripts.\n")


if __name__ == "__main__":
    main()
