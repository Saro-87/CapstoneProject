# DevOps Dashboard — Sprint 1

Centralized cloud cost and resource monitoring across AWS, Azure, and GCP.

---

## Quick start

```bash
# 1. Clone and enter the repo
git clone <your-repo-url>
cd devops-dashboard

# 2. Create a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up credentials
cp .env.example .env
# Edit .env with your real keys (see Credentials section below)

# 5. Verify all three providers connect
python scripts/verify_connections.py

# 6. Pull sample data
python scripts/fetch_sample_data.py
```

---

## Project structure

```
devops-dashboard/
├── connectors/
│   ├── aws.py          # AWS Cost Explorer
│   ├── azure.py        # Azure Cost Management
│   └── gcp.py          # GCP Cloud Billing
├── scripts/
│   ├── verify_connections.py   # Sprint 1 check
│   └── fetch_sample_data.py    # Pull raw data
├── data/
│   └── raw/            # JSON output (git-ignored)
├── config/
│   └── gcp-service-account.json   # GCP key (git-ignored)
├── tests/
│   └── test_connectors.py
├── .env.example
├── .gitignore
└── requirements.txt
```

---

## Credentials setup

### AWS
1. Go to IAM → Users → Create user
2. Attach policy: `AWSCostExplorerReadOnlyAccess`
3. Create Access Key → copy into `.env`
4. Enable Cost Explorer: Billing → Cost Explorer → Enable

### Azure
1. Azure AD → App Registrations → New registration
2. Certificates & secrets → New client secret → copy value
3. Go to your Subscription → IAM → Add role: `Cost Management Reader`
4. Copy Tenant ID, Client ID, Secret, Subscription ID into `.env`

### GCP
1. IAM → Service Accounts → Create
2. Grant role: `Billing Account Viewer`
3. Keys → Add Key → JSON → download to `config/gcp-service-account.json`
4. Enable API: Cloud Billing API in API Library
5. Copy Project ID and Billing Account ID into `.env`

---

## Running tests

```bash
pytest tests/ -v
```

Tests use mocks — no real credentials needed.

---

## Standardised data format

All three connectors return data in the same shape for Sprint 2:

```json
{
  "provider": "AWS",
  "start_date": "2024-11-01",
  "end_date": "2024-11-30",
  "rows": [
    {
      "provider": "AWS",
      "date": "2024-11-01",
      "service": "Amazon EC2",
      "cost_usd": 12.34,
      "usage_quantity": 100.0,
      "currency": "USD"
    }
  ]
}
```

> **GCP note:** The Cloud Billing API returns project-level data only.
> For per-service breakdown, enable Billing Export to BigQuery (see docs/gcp_bigquery_setup.md).

---

## Sprint 1 done criteria

- [ ] All three `verify_connection()` calls return `True`
- [ ] `data/raw/` contains at least one JSON file per provider
- [ ] `pytest tests/` passes with no failures
- [ ] `.env` is in `.gitignore` and not committed
- [ ] README documents your setup steps

