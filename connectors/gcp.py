"""
connectors/gcp.py
Fetches cost and usage data from GCP Cloud Billing API.
"""

import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
from google.oauth2 import service_account
from google.cloud import billing_v1

load_dotenv()


def get_client():
    """Create and return an authenticated GCP Cloud Billing client."""
    key_path = os.getenv("GCP_SERVICE_ACCOUNT_JSON", "./config/gcp-service-account.json")
    credentials = service_account.Credentials.from_service_account_file(
        key_path,
        scopes=["https://www.googleapis.com/auth/cloud-billing.readonly"],
    )
    return billing_v1.CloudBillingClient(credentials=credentials)


def fetch_cost_and_usage(start_date: str = None, end_date: str = None) -> dict:
    """
    Fetch billing account info and project costs from GCP Cloud Billing.

    Note: Detailed per-service breakdown requires BigQuery billing export.
    This connector returns billing account summary data directly from the API.

    Args:
        start_date: 'YYYY-MM-DD' — used for metadata only at this API level
        end_date:   'YYYY-MM-DD' — used for metadata only at this API level

    Returns:
        Standardised dict with provider, period, and billing account rows.
    """
    if not start_date:
        start_date = (datetime.today() - timedelta(days=30)).strftime("%Y-%m-%d")
    if not end_date:
        end_date = datetime.today().strftime("%Y-%m-%d")

    billing_account_id = os.getenv("GCP_BILLING_ACCOUNT_ID")
    client = get_client()

    # List projects associated with this billing account
    request = billing_v1.ListProjectBillingInfoRequest(
        name=f"billingAccounts/{billing_account_id}"
    )
    projects = list(client.list_project_billing_info(request=request))

    rows = []
    for project in projects:
        rows.append({
            "provider": "GCP",
            "date": start_date,
            "service": project.project_id,
            "cost_usd": None,     # Detailed cost needs BigQuery export (see README)
            "usage_quantity": None,
            "currency": "USD",
            "billing_enabled": project.billing_enabled,
        })

    return {
        "provider": "GCP",
        "start_date": start_date,
        "end_date": end_date,
        "rows": rows,
        "note": (
            "For per-service cost breakdown, enable GCP Billing Export to BigQuery. "
            "See docs/gcp_bigquery_setup.md for instructions."
        ),
    }


def verify_connection() -> bool:
    """Quick connectivity check — returns True if credentials are valid."""
    try:
        billing_account_id = os.getenv("GCP_BILLING_ACCOUNT_ID")
        client = get_client()
        request = billing_v1.GetBillingAccountRequest(
            name=f"billingAccounts/{billing_account_id}"
        )
        account = client.get_billing_account(request=request)
        print(f"[GCP] ✓ Connection successful — account: {account.display_name}")
        return True
    except Exception as e:
        print(f"[GCP] ✗ Connection failed: {e}")
        return False


if __name__ == "__main__":
    if verify_connection():
        data = fetch_cost_and_usage()
        out_path = "data/raw/gcp_sample.json"
        with open(out_path, "w") as f:
            json.dump(data, f, indent=2)
        print(f"[GCP] Saved {len(data['rows'])} rows → {out_path}")
