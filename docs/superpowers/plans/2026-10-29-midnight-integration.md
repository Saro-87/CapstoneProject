# Midnight integration plan

Goal: make the selected Midnight design the React application's default dashboard, backed by stored backend data.

Architecture: reuse the existing resources, alerts and recommendations routers. Add a date-bounded cost query, an environment-configured database, and a dashboard entry point that does not initialize AWS clients. Keep the original cloud collector entry point and static designs available.

1. Write and run failing checks for cost date bounds, provider totals, empty results, malformed data and request failures.
2. Configure the database without embedded credentials; initialize an empty local SQLite database by default. Never seed sample data automatically.
3. Connect Midnight to database APIs, preserve navigation, charts, filters, resource details, budget preview and CSV export. Show unavailable fields explicitly.
4. Build, run API integration checks against a temporary fixture database, and inspect the running dashboard in a browser when available.

Scope limits: no automatic cloud sync, deployment, authentication system, or cloud credential changes. Alerts can be acknowledged for this browser session only; the backend has no acknowledgement endpoint. Budget is a local planning value, not a provider budget. Environment and utilization fields are absent from the stored resource schema.
