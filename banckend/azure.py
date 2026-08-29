"""
connectors/azure.py
Fetches cost and usage data from Azure Cost Management API.
"""

import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
from azure.identity import ClientSecretCredential
from azure.mgmt.costmanagement import CostManagementClient
from azure.mgmt.costmanagement.models import (
    QueryDefinition,
    QueryTimePeriod,
    QueryDataset,
    QueryAggregation,
    QueryGrouping,
    TimeframeType,
)

load_dotenv()


def get_client():
    """Create and return an authenticated Azure Cost Management client."""
    credential = ClientSecretCredential(
        tenant_id=os.getenv("AZURE_TENANT_ID"),
        client_id=os.getenv("AZURE_CLIENT_ID"),
        client_secret=os.getenv("AZURE_CLIENT_SECRET"),
    )
    return CostManagementClient(credential)


def fetch_cost_and_usage(start_date: str = None, end_date: str = None) -> dict:
    """
    Fetch daily cost data grouped by service from Azure Cost Management.

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

    subscription_id = os.getenv("AZURE_SUBSCRIPTION_ID")
    scope = f"/subscriptions/{subscription_id}"

    client = get_client()

    query = QueryDefinition(
        type="ActualCost",
        timeframe=TimeframeType.CUSTOM,
        time_period=QueryTimePeriod(
            from_property=datetime.strptime(start_date, "%Y-%m-%d"),
            to=datetime.strptime(end_date, "%Y-%m-%d"),
        ),
        dataset=QueryDataset(
            granularity="Daily",
            aggregation={
                "totalCost": QueryAggregation(name="PreTaxCost", function="Sum")
            },
            grouping=[
                QueryGrouping(type="Dimension", name="ServiceName")
            ],
        ),
    )

    response = client.query.usage(scope=scope, parameters=query)

    # Response columns: [Cost, UsageDate, ServiceName, Currency]
    col_names = [col.name for col in response.columns]
    rows = []
    for row in response.rows:
        record = dict(zip(col_names, row))
        rows.append({
            "provider": "Azure",
            "date": str(record.get("UsageDate", "")),
            "service": record.get("ServiceName", "Unknown"),
            "cost_usd": float(record.get("PreTaxCost", 0)),
            "usage_quantity": None,   # Azure query above doesn't return usage qty
            "currency": record.get("Currency", "USD"),
        })

    return {
        "provider": "Azure",
        "start_date": start_date,
        "end_date": end_date,
        "rows": rows,
    }


def verify_connection() -> bool:
    """Quick connectivity check — returns True if credentials are valid."""
    try:
        client = get_client()
        subscription_id = os.getenv("AZURE_SUBSCRIPTION_ID")
        scope = f"/subscriptions/{subscription_id}"
        # Lightweight: fetch just 1 day to confirm auth works
        query = QueryDefinition(
            type="ActualCost",
            timeframe=TimeframeType.MONTH_TO_DATE,
            dataset=QueryDataset(
                granularity="Monthly",
                aggregation={"totalCost": QueryAggregation(name="PreTaxCost", function="Sum")},
            ),
        )
        client.query.usage(scope=scope, parameters=query)
        print("[Azure] ✓ Connection successful")
        return True
    except Exception as e:
        print(f"[Azure] ✗ Connection failed: {e}")
        return False


if __name__ == "__main__":
    if verify_connection():
        data = fetch_cost_and_usage()
        out_path = "data/raw/azure_sample.json"
        with open(out_path, "w") as f:
            json.dump(data, f, indent=2)
        print(f"[Azure] Saved {len(data['rows'])} rows → {out_path}")
