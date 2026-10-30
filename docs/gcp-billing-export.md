# GCP historical cost integration

This project uses the Cloud Billing export to BigQuery for actual historical costs. The Cloud Billing API can list billing-account and project metadata, but it does not provide the historical service-cost rows the dashboard needs.

## Configure the export in Google Cloud

1. In the Google Cloud Console, open **Billing** and select the billing account used by the projects you want to monitor.
2. Open **Billing export** and configure a **Detailed usage cost** export to BigQuery. Select the billing export project, dataset, and destination table.
3. Wait for export data to appear. Exports are not retroactive for all historical periods; data availability depends on when the export was enabled and provider processing.
4. Ensure the service account JSON configured by the GCP_SERVICE_ACCOUNT_JSON setting can run BigQuery jobs and read the export dataset/table. It needs BigQuery job creation permission in the query project and read access to the export table.
5. Add the following values to the local repository-root .env file:

~~~dotenv
GCP_SERVICE_ACCOUNT_JSON=./config/gcp-service-account.json
GCP_PROJECT_ID=YOUR_GCP_PROJECT_ID
GCP_BILLING_EXPORT_PROJECT_ID=YOUR_BIGQUERY_PROJECT_ID
GCP_BILLING_EXPORT_DATASET=YOUR_BILLING_EXPORT_DATASET
GCP_BILLING_EXPORT_TABLE=gcp_billing_export_v1_BILLING_ACCOUNT_ID
~~~

Use the exact table name shown in BigQuery. Keep the service-account JSON file and all secrets out of Git.

## Trigger a cost sync

From the repository root, after installing backend/requirements.txt and setting DATABASE_URL:

~~~powershell
$start = "2026-10-01"
$end = "2026-10-29"
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/api/sync/gcp?start_date=$start&end_date=$end" | ConvertTo-Json -Depth 6
~~~

The API's end_date is inclusive. The connector translates it to an exclusive BigQuery end boundary. Costs are only stored when the billing export currency is USD; other currencies are rejected rather than mislabeled as USD.

## Limitations

- Newly enabled exports may not contain the entire historical period requested.
- This implementation expects the standard detailed usage export schema with usage_start_time, service.description, location.region, currency, cost, and usage.amount.
- Validate query permissions and table schema in the user's GCP project before relying on dashboard totals.
- Do not share service-account keys or .env values in chat or commit them to GitHub.
