# Manual and scheduled cloud cost synchronization

The API supports manual sync and the same ingestion service can be run as a scheduled command. Run sync only on a trusted workstation/server because authentication is not yet implemented on these endpoints. Do not expose the API to the internet.

## Manual API calls

Start the dashboard backend, then run in PowerShell:

~~~powershell
# AWS: October billing history (end date inclusive)
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/api/sync/aws?start_date=2026-10-01&end_date=2026-10-29" | ConvertTo-Json -Depth 6

# Azure
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/api/sync/azure?start_date=2026-10-01&end_date=2026-10-29" | ConvertTo-Json -Depth 6

# GCP (requires configured BigQuery billing export)
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/api/sync/gcp?start_date=2026-10-01&end_date=2026-10-29" | ConvertTo-Json -Depth 6

# Attempt all three providers; inspect each provider's result
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/api/sync/all?start_date=2026-10-01&end_date=2026-10-29" | ConvertTo-Json -Depth 8
~~~

The end date is inclusive for the dashboard API. Provider-specific adapters handle each API's date-boundary convention. Ingestion only stores rows with a USD currency marker; it refuses to relabel other currencies as USD.

## Run a one-time sync from PowerShell

From the repository root, after configuring .env, installing backend requirements, and initializing the database:

~~~powershell
backend\.venv\Scripts\python.exe backend\scripts\sync_cloud_costs.py --days 7
~~~

The default scheduled window is the previous seven complete days to reduce problems caused by billing data arriving with a delay. You can specify a fixed period:

~~~powershell
backend\.venv\Scripts\python.exe backend\scripts\sync_cloud_costs.py --start-date 2026-10-01 --end-date 2026-10-29 --providers aws azure
~~~

Exit code 0 means every requested provider succeeded; nonzero means at least one provider failed. GCP will fail clearly if the BigQuery export is not configured.

## Windows Task Scheduler

1. Open Task Scheduler and choose **Create Task**.
2. Give it a name such as Cloud Cost Dashboard Sync.
3. Add a daily trigger at a time suitable for your environment.
4. Set the action to **Start a program**.
5. Program/script: the full path to backend\.venv\Scripts\python.exe.
6. Add arguments: the full path to backend\scripts\sync_cloud_costs.py --days 7.
7. Start in: the repository root folder (the folder containing .env, backend, and connectors).
8. Configure the task to run under a Windows account that can read the local .env, the GCP service-account file, and the configured database.
9. Run it once manually and inspect Last Run Result and task history.

Protect the task account and log files. Do not put secrets in Task Scheduler arguments. Use a dedicated database account with only the permissions required by the application.

## Operational cautions

- The sync replaces stored rows for a provider/date window only after the connector returns and validates a non-empty result. Empty or failed provider responses do not erase the old window.
- Currency must be USD. Currency conversion is not implemented.
- AWS Cost Explorer, Azure Cost Management, and BigQuery billing export may have delays or incomplete history.
- The current sync endpoints are unauthenticated. Keep them bound to localhost or behind a trusted private network until API authentication and authorization are implemented.
