# Run the integrated Midnight dashboard

Work from `E:\Capstone\integrated-repo`, the existing Git checkout. The `designs/` folder preserves the static design previews. The application uses `frontend/src/pages/Midnight.jsx`; its CSS reuses the selected design.

## One local server

```powershell
cd E:\Capstone\integrated-repo\frontend
npm ci
npm run build
cd ..\backend
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python -m uvicorn app.dashboard_main:app --host 127.0.0.1 --port 8000
```

Open http://127.0.0.1:8000. Build the frontend before starting the backend so the static files are mounted. No AWS credentials are needed to view stored database data. This entry point serves costs, resources, alerts and recommendations. The older `app.main:app` entry point and its direct AWS routes remain separate.

## Randomized dry run

From the repository root, run:

```powershell
backend\.venv\Scripts\python scripts/dry_run_midnight.py --port 8001
```

Open http://127.0.0.1:8001. This creates a new, ignored database under `backend/.demo/`, sets the demo indicator, and generates 900 billing records across 90 days plus resources, alerts and recommendations. The generator uses a fixed random seed so results are reproducible for the same date. It refuses to seed any database except its own new SQLite file. No production database, credentials or cloud services are used. Each run saves a `manifest.json` with the expected totals.

Use `--check-only` to generate and validate the fixture without starting a server. The app must already be built. Keep the demo on localhost; do not publish it as a production dataset.

## Production database

By default, the dashboard creates an empty `backend/dashboard.db` SQLite database. It inserts no sample records. Zero records and unavailable endpoints are shown explicitly in the UI.

To use the existing PostgreSQL database, set `DATABASE_URL` in the repository `.env` or environment, for example `postgresql+psycopg2://USER:PASSWORD@localhost:5432/cloud_cost_dashboard`. Install `psycopg2-binary` in the same environment. URL-encode special characters in the connection credentials. Do not commit the real value. Existing PostgreSQL tables must already exist; the dashboard does not migrate them.

The existing backend table contracts are preserved:

- `cloud_costs`: provider, service, region, cost, usage, billing_date (USD costs).
- `resources`: provider, resource_name, resource_type, region, status, monthly_cost.
- `alerts`: id, provider, severity, message, created_at.
- `recommendations`: id, provider, recommendation, estimated_savings.

`GET /api/dashboard/costs?start=YYYY-MM-DD&end=YYYY-MM-DD` uses an inclusive start and exclusive end. Costs are filtered by date and provider; inventory, alerts and recommendations use the latest stored records filtered by provider. The frontend does not invoke cloud sync automatically or import JSON files from the Sprint 1 collectors. Existing ingestion must populate these tables.

## Development and verification

Run the backend as above, then `npm run dev` inside `frontend/`. Vite proxies `/api` to port 8000. The browser uses the same-origin API in both development and the built application.

```powershell
cd E:\Capstone\integrated-repo\frontend
npm run test:midnight
npm run build
cd ..
backend\.venv\Scripts\python -m pip install httpx
$env:PYTHONPATH = "$PWD\backend"
backend\.venv\Scripts\python -m unittest discover -s backend/tests -v
```

Backend tests use their own temporary fixture database, never the configured cloud database.

## Fields the backend does not provide

Utilization, environment, provider connection health and forecasts remain unavailable. The UI does not substitute sample values. The budget setting is a local planning figure for the selected period; it is not an AWS/Azure/GCP budget. Alert acknowledgements are browser-session preferences because the existing API is read-only. Neither setting persists after reload. The app binds to localhost; shared deployment and authentication are outside this integration.
