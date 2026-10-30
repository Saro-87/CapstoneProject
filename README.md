# DevOps Dashboard for Resource and Cost Monitoring

Centralized AWS, Azure, and GCP resource and cost monitoring.

## Project structure

- `backend/`: Python API, cloud services, database models, and reporting.
- `frontend/`: React dashboard with the selected Midnight theme connected to database APIs.
- `connectors/`: standalone AWS, Azure, and GCP collection scripts.
- `scripts/`: connection verification and sample collection.
- `designs/`: supplied static frontend designs and mockups.
- `docs/`: setup, architecture, deployment, API notes, and supplied project scope.
- `docs/sprints/`: original branch READMEs preserved for reference.
- `config/`: local provider configuration; credentials are ignored.

## Scope and remaining work

The authoritative six-sprint scope is in [docs/project-scope.txt](docs/project-scope.txt). The development branch adds validated billing ingestion endpoints, an explicit PostgreSQL initializer, AWS Cost Explorer pagination and regional grouping, Azure multi-subscription collection, GCP BigQuery billing-export queries, manual dashboard sync, scheduled-sync tooling, and CI checks. Live cloud credentials, billing permissions, currencies, and totals still require validation in your environment. API authentication, full resource inventory for Azure/GCP, and deployment remain outstanding.

See [installation guide](docs/installation-guide.md) and [cloud setup](docs/cloud-setup.md). The standalone scripts run from the root with `python scripts/verify_connections.py` and `python scripts/fetch_sample_data.py` after installing root requirements and configuring `.env`. The original setup notes reference tests and a BigQuery guide that were not supplied locally.

## Branch history

`main` contains the integrated project. The existing `sprint1` and `sprint2` branches remain as historical work snapshots. This consolidation retains their commit ancestry. Continue future work on branches and merge completed work into `main` without deleting the sprint branches.

Generated dependencies, Python caches, and OS metadata are excluded from the integrated tree; they remain in historical commits. No live cloud calls or application runtime tests were performed during consolidation.

## Midnight dashboard integration

The selected Midnight theme is connected to the stored-data backend in this checkout. See [local startup and database setup](docs/midnight-integration.md). Run `app.dashboard_main:app` for the integrated dashboard; static design previews remain in `designs/`.

For a reproducible random-data preview, build the frontend and run `backend/.venv/Scripts/python scripts/dry_run_midnight.py --port 8001` from the repository root. This creates a separate demo database; it does not change real cloud data.

GitHub Actions now runs backend unit tests, Python compilation, frontend data tests, and a frontend production build. Review the latest [Project checks workflow](https://github.com/Saro-87/CapstoneProject/actions). A green CI run validates code and test fixtures, not access to your live cloud accounts. Keep the pull request in draft until live billing totals and database behavior have been verified. Public production still requires authentication/authorization, dependency advisory review, and staging validation.

