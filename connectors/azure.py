"""
Azure Cost Management connector.
Fetches daily cost by service and resource location across configured subscriptions.
"""
import os
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
    """Create an authenticated Azure Cost Management client."""
    credential = ClientSecretCredential(
        tenant_id=os.getenv("AZURE_TENANT_ID"),
        client_id=os.getenv("AZURE_CLIENT_ID"),
        client_secret=os.getenv("AZURE_CLIENT_SECRET"),
    )
    return CostManagementClient(credential)


def get_subscription_ids():
    """Support multiple subscriptions; fall back to the legacy single ID."""
    raw = os.getenv("AZURE_SUBSCRIPTION_IDS") or os.getenv("AZURE_SUBSCRIPTION_ID", "")
    ids = [value.strip() for value in raw.split(",") if value.strip()]
    if not ids:
        raise RuntimeError("Set AZURE_SUBSCRIPTION_IDS or AZURE_SUBSCRIPTION_ID.")
    return ids


def _query_definition(start_date: str, end_date: str):
    return QueryDefinition(
        type="ActualCost",
        timeframe=TimeframeType.CUSTOM,
        time_period=QueryTimePeriod(
            from_property=datetime.strptime(start_date, "%Y-%m-%d"),
            to=datetime.strptime(end_date, "%Y-%m-%d"),
        ),
        dataset=QueryDataset(
            granularity="Daily",
            aggregation={"totalCost": QueryAggregation(name="PreTaxCost", function="Sum")},
            grouping=[
                QueryGrouping(type="Dimension", name="ServiceName"),
                QueryGrouping(type="Dimension", name="ResourceLocation"),
            ],
        ),
    )


def fetch_cost_and_usage(start_date: str = None, end_date: str = None) -> dict:
    """Fetch daily actual costs. Azure's custom period uses the supplied end date."""
    if not start_date:
        start_date = (datetime.today() - timedelta(days=30)).strftime("%Y-%m-%d")
    if not end_date:
        end_date = datetime.today().strftime("%Y-%m-%d")

    client = get_client()
    query = _query_definition(start_date, end_date)
    rows = []
    for subscription_id in get_subscription_ids():
        scope = f"/subscriptions/{subscription_id}"
        response = client.query.usage(scope=scope, parameters=query)
        col_names = [col.name for col in response.columns]
        for values in response.rows:
            record = dict(zip(col_names, values))
            rows.append({
                "provider": "Azure",
                "date": str(record.get("UsageDate", "")),
                "service": record.get("ServiceName", "Unknown"),
                "region": record.get("ResourceLocation", "Unknown"),
                "cost_usd": float(record.get("PreTaxCost", record.get("totalCost", 0))),
                "usage_quantity": None,
                "currency": record.get("Currency", "USD"),
            })

    return {
        "provider": "Azure",
        "start_date": start_date,
        "end_date": end_date,
        "subscriptions_queried": len(get_subscription_ids()),
        "rows": rows,
    }


def verify_connection() -> bool:
    """Check Cost Management access for every configured subscription."""
    try:
        client = get_client()
        query = QueryDefinition(
            type="ActualCost",
            timeframe=TimeframeType.MONTH_TO_DATE,
            dataset=QueryDataset(
                granularity="Monthly",
                aggregation={"totalCost": QueryAggregation(name="PreTaxCost", function="Sum")},
            ),
        )
        for subscription_id in get_subscription_ids():
            client.query.usage(scope=f"/subscriptions/{subscription_id}", parameters=query)
        print("[Azure] Cost Management connection successful for all configured subscriptions")
        return True
    except Exception as exc:
        print(f"[Azure] Cost Management connection failed: {exc}")
        return False


if __name__ == "__main__":
    result = fetch_cost_and_usage()
    print(f"[Azure] Retrieved {len(result['rows'])} rows across {result['subscriptions_queried']} subscriptions")
