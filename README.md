# Multi-Cloud Resource Monitoring & Cost Optimization Dashboard

Centralized cloud cost and resource monitoring across AWS, Azure, and GCP.

## AWS Architecture Blueprint (Step-by-Step Build Guide)
Covers: Data Ingestion → Storage → Processing → Dashboard → Alerting → Security
<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/1649df73-381f-4dc6-821b-9d72312e270f" />

## Architecture Overview
The blueprint is organised into five horizontal layers, each building on the one below. Read the diagram bottom-up to understand the data flow, or top-down to understand what you are delivering to users.

```
Layer / Area - What It Does
Layer 1 — Data Sources	AWS, Azure, and GCP environments (Cost Explorer, CloudWatch, Billing API)
Layer 2 — Data Collection	ECS Fargate collector microservices pull data from each cloud provider
Layer 3 — Data Ingestion	AppFlow, DMS, DataSync, Kinesis Streams & Firehose route data in
Layer 4 — Central Platform	Amazon RDS + S3 Data Lake + Glue Data Catalog store and catalogue all data
Layer 5 — Data Processing	Lambda batch jobs, Glue ETL, EventBridge, SQS transform & normalise data
Layer 6 — Data Consumption	React / Grafana dashboards, QuickSight BI, SageMaker forecasting
Cross-cutting: Auth	- Cognito + IAM roles for every service-to-service call
Cross-cutting: Alerting	- Prometheus + Alertmanager + SNS → Slack / Microsoft Teams
Cross-cutting: CI/CD	- GitHub → CodePipeline → CodeBuild → ECR → ECS deployment
Cross-cutting: Security	- VPC, Security Groups, KMS encryption, CloudTrail audit logs
```
## SPRINT - 1 (Authentication, IAM & Security Foundations)
Blueprint reference: Authentication & Access panel (top-right) - Security & Governance panel

Everything else in the architecture depends on correct IAM setup. Do this first so you never hard-code credentials.

1.1  Amazon Cognito — User Authentication
```
•	Go to AWS Console → Cognito → Create User Pool.
•	Enable email sign-in, set password policy, configure MFA (optional but recommended).
•	Create an App Client (no client secret for React SPA); note the User Pool ID and Client ID.
•	Attach the Cognito User Pool as an Authorizer in API Gateway later (Step 6).
```

1.2  IAM Roles & Policies
```
•	ECS Task Role Create a dedicated IAM role per service:
  –	Allow read-only access to: Cost Explorer, CloudWatch, RDS, S3, SQS, Secrets Manager.
  –	Deny all write actions to billing data.
•	Create a CI/CD role for CodePipeline/CodeBuild with ECR push and ECS deploy permissions.
•	Use least-privilege: start with AWS managed read-only policies, then narrow.
```

1.3  AWS Secrets Manager
```
•	Store all credentials (Azure Service Principal, GCP Service Account JSON, DB passwords) as secrets.
•	Name them with a clear path: /devops-dashboard/azure/client-secret, /devops-dashboard/gcp/sa-key.
•	Update your ECS task definitions to inject secrets at runtime — no .env files in containers.
```

1.4  VPC, Security Groups & KMS
```
•	Create a dedicated VPC with public and private subnets across two AZs.
•	Place RDS, ElastiCache, and ECS tasks in private subnets; only the ALB in public.
•	Security Groups: ECS tasks accept traffic only from the ALB; RDS accepts only from ECS tasks.
•	Create a KMS Customer Managed Key; enable it on S3, RDS, and Secrets Manager.
•	Enable AWS CloudTrail in all regions and AWS Config for compliance rules.
```

