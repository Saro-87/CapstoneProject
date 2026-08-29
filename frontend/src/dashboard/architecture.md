# DevOps Dashboard - Architecture & Team Blueprint

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DEVOPS DASHBOARD                                  │
│  Centralized resource + cost monitoring for AWS | Azure | GCP               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## System Architecture

```
                         ┌──────────────────────┐
                         │    React.js / Grafana │  <--- Frontend (Person 3)
                         │    Dashboard UI      │
                         │    (Filters, Charts,  │
                         │     Tables, Alerts)   │
                         └──────────┬───────────┘
                                    │ HTTP / REST
                         ┌──────────▼───────────┐
                         │   FastAPI Backend     │  <--- API Layer (Person 2)
                         │   (REST Endpoints)    │
                         │   /api/costs          │
                         │   /api/resources      │
                         │   /api/alerts         │
                         │   /api/trends         │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
   ┌──────────▼──────────┐ ┌───────▼──────────┐ ┌───────▼──────────┐
   │  Data Aggregator    │ │ Historical Data   │ │ Alert Manager    │  <--- Logic Layer
   │  (AWS/Azure/GCP     │ │ Analyzer          │ │ (Threshold       │
   │   Connectors)       │ │ (Trends, ML)      │ │  Evaluation)     │
   └──────────┬──────────┘ └────────┬──────────┘ └────────┬─────────┘
              │                     │                     │
              └─────────────────────┼─────────────────────┘
                                    │
                         ┌──────────▼───────────┐
                         │  PostgreSQL / MongoDB │  <--- Data Layer
                         │  (Costs, Resources,   │
                         │   Alerts, History)    │
                         └──────────────────────┘
```

## Data Flow

```
Cloud APIs  ──►  Python Connectors  ──►  Standardize  ──►  Database
(AWS CE,        (boto3, azure-sdk,       (Unified JSON     (Write)
 Azure CM,      google-cloud)             schema)
 GCP Billing)                                                    │
                                                                 ▼
Dashboard  ◄──  FastAPI Endpoints  ◄──  Read from DB  ◄────────┘
(React.js)      (REST / JSON)
                                                              ┌─────┐
                                                              │Prompt│
  AlertManager ◄──  Schedule Check  ◄──  Write Alert ───────►│Email │
                                                              │Slack │
                                                              │Teams │
                                                              └─────┘
```

## 4-Person Team Breakdown

### Person 1 - Cloud Integration Lead
**Focus: Sprints 1-2 — Cloud Connectors & Data Collection**

| Deliverable | Files |
|-------------|-------|
| AWS Connector | `src/backend/cloud_connectors/aws_connector.py` |
| Azure Connector | `src/backend/cloud_connectors/azure_connector.py` |
| GCP Connector | `src/backend/cloud_connectors/gcp_connector.py` |
| Sample Data Fetcher | `src/backend/sample_data_fetcher.py` |
| Config Loader | `src/backend/config_loader.py` |

**Tasks:**
- Implement authentication & API calls for all 3 clouds
- Normalize raw API responses into unified format
- Handle pagination, rate limits, and errors
- Write mock data fallbacks for development
- Document each provider's API structure

---

### Person 2 - Backend & Database Lead
**Focus: Sprints 2-3 — Database, API, Scheduled Jobs**

| Deliverable | Files |
|-------------|-------|
| Database Schema | `src/backend/models/` (to be created) |
| FastAPI Endpoints | `src/backend/api/` (to be created) |
| Scheduler | `src/backend/scheduler.py` (to be created) |
| Data Aggregation Pipeline | `src/backend/pipeline.py` (to be created) |

**Tasks:**
- Design and implement PostgreSQL/MongoDB schema
- Build REST API endpoints (`/costs`, `/resources`, `/trends`, `/alerts`)
- Implement APscheduler to run daily data fetches
- Create data standardization & aggregation pipeline
- Write unit tests for API and DB operations

---

### Person 3 - Frontend & Visualization Lead
**Focus: Sprints 3-4 — Dashboard UI & Charts**

| Deliverable | Files |
|-------------|-------|
| React Dashboard | `src/frontend/` (to be created) |
| Cost Charts | Custom line/bar/pie chart components |
| Resource Tables | Interactive data tables with sorting |
| Filters | Provider, environment, date range, resource type |
| Historical Views | Month-over-month, trend lines |

**Tasks:**
- Build React.js dashboard with real-time data fetching
- Implement Chart.js or Recharts for visualizations
- Create filter components (provider, env, date range, resource type)
- Add drill-down capability (click resource → detail view)
- Responsive layout for desktop and tablet

---

### Person 4 - Alerting, DevOps & Deployment Lead
**Focus: Sprints 5-6 — Alerts, Testing, Containerization, Docs**

| Deliverable | Files |
|-------------|-------|
| Alert Manager | `src/backend/alert_manager.py` (to be created) |
| Slack/Teams Integration | `src/backend/notifiers/` (to be created) |
| Docker Setup | `Dockerfile`, `docker/docker-compose.yml` |
| Tests | `tests/` — integration + E2E |
| Documentation | `docs/` — setup, usage, API reference |

**Tasks:**
- Implement threshold-based alerting engine
- Integrate Slack/Teams webhooks for notifications
- Write all tests (unit, integration, end-to-end)
- Dockerize the full application
- Create comprehensive documentation
- CI/CD pipeline setup (GitHub Actions)

---

## Sprint Assignment Matrix

| Sprint | Person 1 | Person 2 | Person 3 | Person 4 |
|--------|----------|----------|----------|----------|
| **S1**: Setup & Cloud Integration | AWS/Azure/GCP connectors | Project structure, config | - | Docker, CI, .gitignore |
| **S2**: Data Aggregation & Storage | Normalize data format | DB schema, FastAPI setup | - | Pipeline tests |
| **S3**: Real-Time Dashboard | - | REST API endpoints | React scaffold, KPI cards | Monitoring setup |
| **S4**: Historical Analysis | - | Trend calculation APIs | Charts, filters, drill-down | Data validation tests |
| **S5**: Alerting | - | Alert API | Alert UI panel | Alertmanager, Slack/Teams |
| **S6**: Final Testing & Deploy | Bug fixes | API polish | UI polish | Full E2E tests, docs, deploy |

---

## Database Schema (PostgreSQL)

```sql
-- Cost records (daily aggregated)
CREATE TABLE cost_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider        VARCHAR(10) NOT NULL,  -- 'aws', 'azure', 'gcp'
    service         VARCHAR(100) NOT NULL,
    region          VARCHAR(50),
    environment     VARCHAR(20),           -- production, development, staging
    amount          DECIMAL(12,4) NOT NULL,
    currency        VARCHAR(3) DEFAULT 'USD',
    recorded_date   DATE NOT NULL,
    tags            JSONB,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Resource inventory
CREATE TABLE resources (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider        VARCHAR(10) NOT NULL,
    resource_id     VARCHAR(255) NOT NULL,
    resource_type   VARCHAR(50) NOT NULL,  -- EC2, VM, Compute Instance, etc.
    name            VARCHAR(255),
    region          VARCHAR(50),
    environment     VARCHAR(20),
    state           VARCHAR(20),
    tags            JSONB,
    meta            JSONB,
    last_seen       TIMESTAMP DEFAULT NOW(),
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Alert configurations
CREATE TABLE alert_configs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    metric          VARCHAR(50) NOT NULL,  -- cost, cpu, memory, storage
    provider        VARCHAR(10),
    environment     VARCHAR(20),
    threshold       DECIMAL(12,4) NOT NULL,
    direction       VARCHAR(10) DEFAULT 'above',  -- above, below
    enabled         BOOLEAN DEFAULT TRUE,
    notify_channels JSONB,                -- ["slack", "teams", "email"]
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Alert history
CREATE TABLE alert_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id       UUID REFERENCES alert_configs(id),
    metric_value    DECIMAL(12,4),
    message         TEXT,
    severity        VARCHAR(20),          -- critical, warning, info
    acknowledged    BOOLEAN DEFAULT FALSE,
    triggered_at    TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_cost_provider ON cost_records(provider);
CREATE INDEX idx_cost_date ON cost_records(recorded_date);
CREATE INDEX idx_cost_env ON cost_records(environment);
CREATE INDEX idx_resources_provider ON resources(provider);
CREATE INDEX idx_resources_env ON resources(environment);
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/costs/summary` | Overall cost summary (current period) |
| GET | `/api/v1/costs/trends` | Cost over time with date range filter |
| GET | `/api/v1/costs/by-provider` | Cost breakdown by cloud provider |
| GET | `/api/v1/costs/top-resources` | Top cost-incurring resources |
| GET | `/api/v1/resources` | List all tracked resources |
| GET | `/api/v1/resources/:id` | Resource detail view |
| GET | `/api/v1/resources/underutilized` | Resources with low utilization |
| GET | `/api/v1/alerts` | Active/recent alerts |
| POST | `/api/v1/alerts/config` | Create alert threshold config |
| PUT | `/api/v1/alerts/config/:id` | Update alert config |
| DELETE | `/api/v1/alerts/config/:id` | Delete alert config |

---

## Technology Stack

```
Layer       Technology
──────────  ───────────────────────────
Frontend    React.js + Recharts + Tailwind CSS
Backend     Python 3.11+ / FastAPI
Database    PostgreSQL (primary) + MongoDB (optional for logs)
Cloud SDKs  boto3, azure-sdk, google-cloud-billing
Scheduler   APScheduler
Alerting    Custom engine + Slack/MSTeams webhooks
Container   Docker + docker-compose
CI/CD       GitHub Actions
Testing     pytest + pytest-cov
```

---

## Key Architectural Decisions

1. **FastAPI over Flask** — async support, auto OpenAPI docs, better performance
2. **PostgreSQL as primary DB** — structured cost/resource data fits relational model; JSONB columns for flexible tags
3. **APscheduler over cron** — keeps scheduling inside Python, easier to deploy in containers
4. **Unified data schema** — all clouds normalized into same table structure for simplified queries
5. **Mock data fallback** — enables frontend development without live cloud credentials
6. **Alert engine separate from API** — runs as background task, not blocking API requests
