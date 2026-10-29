# DevOps Dashboard for Resource and Cost Monitoring

Centralized AWS, Azure, and GCP resource and cost monitoring.

## Project structure

- `backend/`: Python API, cloud services, database models, and reporting.
- `frontend/`: React dashboard from sprint2.
- `connectors/`: standalone AWS, Azure, and GCP collection scripts.
- `scripts/`: connection verification and sample collection.
- `designs/`: supplied static frontend designs and mockups.
- `docs/`: setup, architecture, deployment, API notes, and supplied project scope.
- `docs/sprints/`: original branch READMEs preserved for reference.
- `config/`: local provider configuration; credentials are ignored.

## Scope and remaining work

The authoritative six-sprint scope is in [docs/project-scope.txt](docs/project-scope.txt). Available code spans cloud collection, storage/API scaffolding, dashboard views, historical views, and alert-related components. Presence of a file does not establish completion: cloud connectivity, persistence, filters, calculations, notifications, and deployment still require validation. Azure/GCP backend placeholders and missing implementation should be completed as remaining files arrive. Docker, scheduled collection, and Prometheus Alertmanager integration must be checked against the final deliverables.

See [installation guide](docs/installation-guide.md) and [cloud setup](docs/cloud-setup.md). The standalone scripts run from the root with `python scripts/verify_connections.py` and `python scripts/fetch_sample_data.py` after installing root requirements and configuring `.env`. The original setup notes reference tests and a BigQuery guide that were not supplied locally.

## Branch history

`main` contains the integrated project. The existing `sprint1` and `sprint2` branches remain as historical work snapshots. This consolidation retains their commit ancestry. Continue future work on branches and merge completed work into `main` without deleting the sprint branches.

Generated dependencies, Python caches, and OS metadata are excluded from the integrated tree; they remain in historical commits. No live cloud calls or application runtime tests were performed during consolidation.

