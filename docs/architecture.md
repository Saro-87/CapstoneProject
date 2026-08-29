# System Architecture

## Overview

The Multi-Cloud FinOps Dashboard is a web-based application that provides centralized cloud cost monitoring, budget tracking, resource inventory, cost optimization, and reporting across multiple cloud providers.

The current implementation supports **Amazon Web Services (AWS)**, with Azure and Google Cloud planned for future releases.

---

# Architecture Diagram

```
                    +----------------------+
                    |      Web Browser     |
                    +----------+-----------+
                               |
                               | HTTP / REST
                               |
                    +----------v-----------+
                    | React + Vite Frontend|
                    +----------+-----------+
                               |
                         Axios API Calls
                               |
                    +----------v-----------+
                    | FastAPI Backend      |
                    +----------+-----------+
                               |
                      AWS SDK (Boto3)
                               |
        ------------------------------------------------
        |          |          |          |             |
        v          v          v          v             v
  Cost Explorer  Budgets  CloudWatch   EC2/S3/RDS   Lambda
```

---

# Frontend

- React
- Vite
- Material UI
- Axios
- Recharts

Responsibilities

- Dashboard UI
- Charts
- Reports
- Resource Monitoring
- Budget Visualization

---

# Backend

Developed using FastAPI.

Responsibilities

- REST APIs
- AWS Authentication
- Business Logic
- Report Generation
- Cost Analysis
- Resource Discovery

---

# AWS Services Used

- Cost Explorer
- AWS Budgets
- CloudWatch
- EC2
- S3
- RDS
- Lambda

---

# Data Flow

1. User opens the dashboard.
2. React sends API requests to FastAPI.
3. FastAPI retrieves AWS data using Boto3.
4. AWS returns billing and resource information.
5. FastAPI formats the response.
6. React displays charts, cards, and reports.

---

# Future Enhancements

## Azure

- Azure Cost Management
- Azure Monitor
- Azure Advisor
- Resource Graph

## Google Cloud

- Billing API
- Cloud Monitoring
- Asset Inventory

## Additional Features

- Authentication (JWT)
- Role-Based Access Control
- Docker Deployment
- Kubernetes Deployment
- Email Reports
- AI Cost Forecasting