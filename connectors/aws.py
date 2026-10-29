"""
connectors/aws.py
Fetches cost and usage data from AWS Cost Explorer.
"""

import os
import json
import boto3
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()


def get_client():
    """Create and return an authenticated AWS Cost Explorer client."""
    return boto3.client(
        "ce",
        region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )


def fetch_cost_and_usage(start_date: str = None, end_date: str = None) -> dict:
    """
    Fetch daily cost data grouped by service from AWS Cost Explorer.

    Args:
        start_date: 'YYYY-MM-DD' — defaults to 30 days ago
        end_date:   'YYYY-MM-DD' — defaults to today

    Returns:
        Standardised dict with provider, period, and cost rows.
    """
    if not start_date:
        start_date = (datetime.today() - timedelta(days=30)).strftime("%Y-%m-%d")
    if not end_date:
        end_date = datetime.today().strftime("%Y-%m-%d")

    client = get_client()

    response = client.get_cost_and_usage(
        TimePeriod={"Start": start_date, "End": end_date},
        Granularity="DAILY",
        Metrics=["BlendedCost", "UsageQuantity"],
        GroupBy=[{"Type": "DIMENSION", "Key": "SERVICE"}],
    )

    # Normalise into a standard format shared across all connectors
    rows = []
    for result in response.get("ResultsByTime", []):
        period_start = result["TimePeriod"]["Start"]
        for group in result.get("Groups", []):
            rows.append({
                "provider": "AWS",
                "date": period_start,
                "service": group["Keys"][0],
                "cost_usd": float(group["Metrics"]["BlendedCost"]["Amount"]),
                "usage_quantity": float(group["Metrics"]["UsageQuantity"]["Amount"]),
                "currency": group["Metrics"]["BlendedCost"]["Unit"],
            })

    return {
        "provider": "AWS",
        "start_date": start_date,
        "end_date": end_date,
        "rows": rows,
    }


def verify_connection() -> bool:
    """Quick connectivity check — returns True if credentials are valid."""
    try:
        client = get_client()
        # Lightweight call: list cost allocation tags
        client.list_cost_allocation_tags(Status="Active", MaxResults=1)
        print("[AWS] ✓ Connection successful")
        return True
    except Exception as e:
        print(f"[AWS] ✗ Connection failed: {e}")
        return False


if __name__ == "__main__":
    if verify_connection():
        data = fetch_cost_and_usage()
        out_path = "data/raw/aws_sample.json"
        with open(out_path, "w") as f:
            json.dump(data, f, indent=2)
        print(f"[AWS] Saved {len(data['rows'])} rows → {out_path}")
