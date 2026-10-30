# PostgreSQL setup for the cost dashboard

The dashboard can use PostgreSQL for persistent cloud billing, resource, alert and recommendation records. Keep the real connection string in a local .env file or an environment variable; never commit credentials.

## 1. Install the backend dependencies

From the repository root in PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
cd ..
```

## 2. Create the database

In PostgreSQL, create a database named cloud_cost_dashboard and a dedicated application user. Grant that user access to the database and schema. Use a strong password.

Example connection string (replace the placeholders locally):

```dotenv
DATABASE_URL=postgresql+psycopg2://DB_USER:URL_ENCODED_PASSWORD@localhost:5432/cloud_cost_dashboard
```

Place this setting in the repository-root .env. URL-encode reserved characters in the password. Do not put the real connection string in GitHub, screenshots, or chat.

## 3. Create missing dashboard tables

Run from the repository root after setting DATABASE_URL:

```powershell
$env:PYTHONPATH = "$PWD\backend"
backend\.venv\Scripts\python.exe backend\init_db.py
```

The initializer registers the dashboard table definitions and calls SQLAlchemy create_all. It creates missing tables only; it does not insert sample data or delete existing records. It is not a versioned migration system and does not alter an existing table's columns. Back up any database before schema changes.

## 4. Verify the database connection

```powershell
$env:PYTHONPATH = "$PWD\backend"
backend\.venv\Scripts\python.exe -c "from app.database import engine; from sqlalchemy import text; c=engine.connect(); print(c.execute(text('SELECT 1')).scalar()); c.close()"
```

Expected output is 1. If the command fails, verify PostgreSQL is running, the database and user exist, and DATABASE_URL is set in the same PowerShell session or in the repository-root .env.

## Important notes

- The default remains local SQLite when DATABASE_URL is not set, so local demo/testing workflows are not unexpectedly redirected.
- Creating tables does not fetch cloud billing data. The provider ingestion work must populate cloud_costs and the inventory tables before the dashboard can show live records.
- The GCP connector in the current project does not retrieve historical costs from the Cloud Billing API; detailed billing rows require Cloud Billing export to BigQuery and a configured dataset/table.
- Do not deploy the API publicly until authentication and authorization are implemented and tested.
