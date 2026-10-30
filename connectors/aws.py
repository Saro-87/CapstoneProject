"""
AWS Cost Explorer connector.
Fetches daily service/region costs using real Cost Explorer billing data.
"""
import os
from datetime import datetime, timedelta

import boto3
from dotenv import load_dotenv

load_dotenv()


def get_client():
    """Create an authenticated AWS Cost Explorer client."""
    return boto3.client(
        "ce",
        region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID") or None,
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY") or None,
    )


def fetch_cost_and_usage(start_date: str = None, end_date: str = None) -> dict:
    """Fetch daily cost by service and region. end_date is exclusive."""
    if not start_date:
        start_date = (datetime.today() - timedelta(days=30)).strftime("%Y-%m-%d")
    if not end_date:
        end_date = datetime.today().strftime("%Y-%m-%d")
    if end_date <= start_date:
        raise ValueError("end_date must be later than start_date (exclusive)")

    client = get_client()
    rows = []
    next_token = None
    while True:
        request = {
            "TimePeriod": {"Start": start_date, "End": end_date},
            "Granularity": "DAILY",
            "Metrics": ["BlendedCost", "UsageQuantity"],
            "GroupBy": [
                {"Type": "DIMENSION", "Key": "SERVICE"},
                {"Type": "DIMENSION", "Key": "REGION"},
            ],
        }
        if next_token:
            request["NextPageToken"] = next_token
        response = client.get_cost_and_usage(**request)

        for period in response.get("ResultsByTime", []):
            period_start = period.get("TimePeriod", {}).get("Start")
            for group in period.get("Groups", []):
                metrics = group.get("Metrics", {})
                cost_metric = metrics.get("BlendedCost", {})
                usage_metric = metrics.get("UsageQuantity", {})
                rows.append({
                    "provider": "AWS",
                    "date": period_start,
                    "service": group.get("Keys", ["Unknown", "Unknown"])[0],
                    "region": group.get("Keys", ["Unknown", "Unknown"])[1],
                    "cost_usd": float(cost_metric.get("Amount", 0)),
                    "usage_quantity": float(usage_metric.get("Amount", 0)),
                    "currency": cost_metric.get("Unit", ""),
                })

        next_token = response.get("NextPageToken")
        if not next_token:
            break

    return {
        "provider": "AWS",
        "start_date": start_date,
        "end_date": end_date,
        "rows": rows,
    }


def verify_connection() -> bool:
    """Check credentials and Cost Explorer access with a small request."""
    try:
        client = get_client()
        today = datetime.today().date()
        start = (today - timedelta(days=2)).isoformat()
        end = today.isoformat()
        client.get_cost_and_usage(
            TimePeriod={"Start": start, "End": end},
            Granularity="DAILY",
            Metrics=["UnblendedCost"],
        )
        print("[AWS] Cost Explorer connection successful")
        return True
    except Exception as exc:
        print(f"[AWS] Cost Explorer connection failed: {exc}")
        return False


if __name__ == "__main__":
    result = fetch_cost_and_usage()
    print(f"[AWS] Retrieved {len(result['rows'])} billing rows")
