# Midnight randomized dry run — 29 October 2026

What this change does: Midnight now displays database-backed cloud costs, inventory, alerts and recommendations. This run exercised it against an isolated, generated dataset and assessed public production readiness. Real data and cloud accounts were not touched.

**Verdict: suitable for local demonstration; not approved for public production.**

## Results

| Check | Result |
|---|---|
| Synthetic dataset | 900 cost records over 90 days; 83 resources; 9 alerts; 6 recommendations |
| Last 30 days | 300 cost records, total $24,135.10 |
| AWS / Azure / GCP | $12,216.10 / $7,418.56 / $4,500.44 |
| Potential savings | $4,177.99 from six stored recommendations |
| Last 7 days | $5,862.21 displayed after changing the period |
| Automated checks | Six frontend data checks and five backend API checks passed |
| Production frontend build | Passed; approximately 706 KB JavaScript before compression, 215 KB gzip; size warning remains |
| Small local concurrency check | 80 successful read requests, eight workers, no errors; median 15.14 ms and p95 54.93 ms |
| Browser interactions | Provider filtering, period selection, service search, budget subtraction, resource dialog, expanded inventory, and alert acknowledgement exercised |
| Export | Downloaded CSV contained ten services totaling $24,135.10 |
| Partial failure | Temporarily made only the demo alerts table unavailable; UI displayed HTTP 500 for alerts while retaining $24,135.10 in costs. All nine demo alerts were restored afterward |
| Visual QA | Desktop and 390-pixel mobile viewport inspected; no horizontal page overflow observed on mobile |
| Backend dependency advisory check | No known advisories reported for the 19 installed environment packages |
| Frontend production dependency audit | Four high-rated package entries reported; see npm-audit.json |

Two corrections were made during testing: unmatched searches now show an explanation; CSV formatting now protects formula-like service names, including leading whitespace, while keeping negative refund amounts numeric. A regression check covers CSV quoting and refunds.

The concurrent test is a small localhost smoke test, not a production capacity benchmark. Advisory results are a point-in-time dependency check, not proof that every runtime path is secure. The frontend audit omits development dependencies. Backend auditing covered the installed dashboard environment, not every legacy cloud SDK in other environments.

## Must fix or resolve before public production

1. **The database APIs have no sign-in or access checks** (`backend/app/dashboard_main.py`).
   - What this is: the browser requests costs, resources, alerts and recommendations directly.
   - Problem: the same requests return data without a token or session. If the server is exposed publicly, anyone who can reach it can read the stored cloud information.
   - Fix: authenticate users and enforce access at every data endpoint, or put the app behind an authenticated gateway with direct backend access blocked. Verify anonymous requests are rejected.
   - If skipped: public deployment exposes cloud inventory and spending information.

2. **Frontend dependency advisories need upgrading or a documented applicability decision** (`frontend/package-lock.json`).
   - What this is: npm reported high-rated entries for axios, follow-redirects, react-router and react-router-dom.
   - Problem: the installed dependency tree is not clear of known advisories. The reported React Router issue concerns RSC mode, while Midnight runs as a client-side SPA; several Axios issues concern Node adapters. This run did not establish exploitability in the shipped dashboard.
   - Fix: apply compatible patched versions and rerun the build, functional checks and advisory audit; document any confirmed unreachable advisory paths.
   - If skipped: release acceptance has unresolved dependency risks. Do not treat audit severity alone as a validated application vulnerability.

3. **The real data path is unverified** (`docs/midnight-integration.md`).
   - What this is: the app reads stored data; it does not automatically ingest cloud exports. SQLite fixtures were used here.
   - Problem: this run cannot establish that PostgreSQL schema compatibility, ingestion, provider permissions, data freshness, billing date boundaries or USD normalization are correct for the real accounts.
   - Fix: configure a staging database, run the actual ingestion process, and reconcile sample daily and service totals with each provider. Verify missing credentials and ingestion failures are visible.
   - If skipped: a production dashboard can be empty, stale or financially incorrect despite a successful synthetic demonstration.

4. **The intended hosted deployment has not been exercised** (`docs/deployment-guide.md`).
   - What this is: the verified server is a single localhost process; the existing deployment guide describes development startup.
   - Problem: no target hosting environment, HTTPS/access boundary, production database migration/backup process, restart monitoring or rollback has been validated in this run.
   - Fix: choose the deployment target, configure those operational requirements, and perform a staging deployment before exposing real data.
   - If skipped: the local test does not establish safe access, recovery or availability on the production host.

## Known product limits

Utilization and forecasts remain explicitly unavailable because their data sources are not connected. Budget and alert acknowledgement controls are intentionally local session preferences, not persisted provider settings. APIs return complete inventories and alerts without pagination, so the 83-resource fixture does not establish behavior with very large datasets.

## Reproduce and inspect

Run `backend/.venv/Scripts/python scripts/dry_run_midnight.py --port 8001` from the repository root after building the frontend. The live preview is http://127.0.0.1:8001. Generated databases and manifests are ignored by Git.

Evidence: [API measurements](dry-run-api.json), [frontend audit](npm-audit.json), [backend audit](python-audit.json), [desktop screenshot](midnight-charts.jpg), [mobile screenshot](midnight-mobile.jpg).

Not checked: real AWS/Azure/GCP accounts, PostgreSQL, large-scale load, exhaustive security testing, or a hosted production environment. No code was pushed or deployed publicly.
