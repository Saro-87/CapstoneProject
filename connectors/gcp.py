"""
GCP billing connector.

Detailed cost history is queried from the standard Cloud Billing export in
BigQuery. The Cloud Billing API itself does not expose historical cost rows.
"""
import os
import re
from datetime import datetime, timedelta

from dotenv import load_dotenv
from google.cloud import bigquery
from google.oauth2 import service_account

load_dotenv()


def _credentials():
    key_path = os.getenv("GCP_SERVICE_ACCOUNT_JSON", "./config/gcp-service-account.json")
    return service_account.Credentials.from_service_account_file(
        key_path,
        scopes=["https://www.googleapis.com/auth/cloud-platform"],
    )


def fetch_cost_and_usage(start_date: str = None, end_date: str = None) -> dict:
    """Read daily service costs from a configured BigQuery billing export.

    end_date follows the provider connector convention and is exclusive.
    The export table must use the standard detailed usage cost export schema.
    """
    if not start_date:
        start_date = (datetime.today() - timedelta(days=30)).strftime("%Y-%m-%d")
    if not end_date:
        end_date = datetime.today().strftime("%Y-%m-%d")

    project_id = os.getenv("GCP_BILLING_EXPORT_PROJECT_ID") or os.getenv("GCP_PROJECT_ID")
    dataset_id = os.getenv("GCP_BILLING_EXPORT_DATASET")
    table_id = os.getenv("GCP_BILLING_EXPORT_TABLE")
    if not project_id or not dataset_id or not table_id:
        raise RuntimeError(
            "Configure GCP_BILLING_EXPORT_PROJECT_ID, GCP_BILLING_EXPORT_DATASET, "
            "and GCP_BILLING_EXPORT_TABLE for actual cost history."
        )

    # Validate identifiers before using them in SQL; identifiers cannot be query parameters.
    identifier = re.compile(r"^[A-Za-z0-9_-]+$")
    if not all(identifier.fullmatch(value) for value in (project_id, dataset_id, table_id)):
        raise ValueError("GCP BigQuery project, dataset, or table identifier is invalid.")

    client = bigquery.Client(project=project_id, credentials=_credentials())
    table = chr(96) + f"{project_id}.{dataset_id}.{table_id}" + chr(96)
    query = f"""
        SELECT
          FORMAT_DATE('%Y-%m-%d', DATE(usage_start_time)) AS usage_date,
          COALESCE(service.description, 'Unknown') AS service_name,
          COALESCE(location.region, 'Unknown') AS region_name,
          currency,
          SUM(cost + COALESCE((SELECT SUM(credit.amount) FROM UNNEST(credits) AS credit), 0)) AS total_cost
        FROM {table}
        WHERE DATE(usage_start_time) >= @start_date
          AND DATE(usage_start_time) < @end_date
        GROUP BY usage_date, service_name, region_name, currency
        ORDER BY usage_date, service_name
    """
    job_config = bigquery.QueryJobConfig(query_parameters=[
        bigquery.ScalarQueryParameter("start_date", "DATE", start_date),
        bigquery.ScalarQueryParameter("end_date", "DATE", end_date),
    ])
    result = client.query(query, job_config=job_config).result()

    rows = [{
        "provider": "GCP",
        "date": row.usage_date,
        "service": row.service_name,
        "region": row.region_name,
        "cost_usd": float(row.total_cost),
        "usage_quantity": None,
        "currency": row.currency,
    } for row in result]

    return {
        "provider": "GCP",
        "start_date": start_date,
        "end_date": end_date,
        "rows": rows,
        "source": "bigquery_billing_export",
    }


def verify_connection() -> bool:
    """Check whether the configured BigQuery billing export can be queried."""
    try:
        project_id = os.getenv("GCP_BILLING_EXPORT_PROJECT_ID") or os.getenv("GCP_PROJECT_ID")
        dataset_id = os.getenv("GCP_BILLING_EXPORT_DATASET")
        table_id = os.getenv("GCP_BILLING_EXPORT_TABLE")
        if not all((project_id, dataset_id, table_id)):
            raise RuntimeError("BigQuery billing export environment variables are not configured.")
        client = bigquery.Client(project=project_id, credentials=_credentials())
        table = chr(96) + f"{project_id}.{dataset_id}.{table_id}" + chr(96)
        client.query(f"SELECT 1 FROM {table} LIMIT 1").result()
        print("[GCP] BigQuery billing export connection successful")
        return True
    except Exception as exc:
        print(f"[GCP] BigQuery billing export connection failed: {exc}")
        return False


if __name__ == "__main__":
    data = fetch_cost_and_usage()
    print(f"[GCP] Retrieved {len(data['rows'])} billing rows")
