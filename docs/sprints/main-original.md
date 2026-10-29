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
## SPRINT - 2
### Data Collection — Collector Microservices (ECS Fargate)
Three separate collector services — one per cloud provider — run as Docker containers on ECS Fargate. These are the Python connectors you built in Sprint 1, now containerised.

2.1  Dockerise Each Connector
```
•	Create a Dockerfile in each connector folder (connectors/aws/, connectors/azure/, connectors/gcp/).
•	Base image: python:3.12-slim. Install only what that connector needs from requirements.txt.
•	ENTRYPOINT should run the fetch script on a schedule (use a simple cron wrapper or EventBridge trigger).
•	Build and test locally: docker build -t aws-collector . && docker run --env-file .env aws-collector
```

2.2  Push Images to Amazon ECR
```
•	Create three ECR repositories: devops-dashboard/aws-collector, /azure-collector, /gcp-collector.
•	Authenticate Docker to ECR: aws ecr get-login-password | docker login --username AWS ...
•	Tag and push each image: docker tag aws-collector:latest <account>.dkr.ecr.us-east-1.amazonaws.com/...
```

2.3  Create ECS Fargate Task Definitions
```
•	In ECS, create a Cluster (Fargate). Then create one Task Definition per collector.
•	Assign the ECS Task Role from Step 1.2 to each task.
•	Set environment variables by referencing Secrets Manager ARNs — not plaintext values.
•	Allocate 256 CPU / 512 MB memory per collector (adjust after profiling).
```

2.4  Schedule Collection with EventBridge
```
•	Create EventBridge Scheduled Rules: rate(1 day) for daily cost data, rate(1 hour) for resource metrics.
•	Set the target to an ECS Run Task action for each collector task definition.
•	This replaces the manual python scripts/fetch_sample_data.py from Sprint 1 with fully automated pulls.
```

### Data Ingestion Layer
The ingestion layer is how data gets from the collector services into the central data platform. The blueprint shows two paths: batch (for historical cost data) and streaming (for real-time resource metrics).

3.1  Batch Ingestion — AWS AppFlow & DMS
```
•	AWS AppFlow: use for pulling SaaS billing data or CSV files from external sources into S3.
  –	Create a Flow: Source = custom connector or S3, Destination = S3 Data Lake bucket.
  –	Set trigger: on-demand or scheduled (daily, aligned with your collector schedule).
•	AWS DMS: use if you have an on-premise or third-party database as a source.
  –	Create a Replication Instance (t3.medium is sufficient for this project).
  –	Define source and target endpoints; run a full-load task initially, then CDC for ongoing changes.
```

3.2  File-Based Ingestion — AWS DataSync
```
•	Use DataSync to move files (billing exports, CSV logs) from on-premises or another S3 bucket.
•	Create a DataSync Task: source location → destination S3 bucket → schedule.
•	Enable data verification and transfer logging to CloudWatch.
```

3.3  Real-Time Ingestion — Kinesis Data Streams & Firehose
```
•	Create a Kinesis Data Stream (2 shards) for live resource metric events from CloudWatch.
•	Create a Kinesis Data Firehose Delivery Stream: source = Kinesis Stream, destination = S3 bucket.
  –	Enable data transformation via a Lambda function (to normalise schema before landing).
  –	Set buffer: 5 MB or 300 seconds, whichever comes first.
•	In EventBridge, create a rule matching CloudWatch alarm state changes → target = Kinesis Stream.
•	Your ECS collectors can also write metric events directly to the Kinesis Stream using boto3.
```

<img width="989" height="269" alt="image" src="https://github.com/user-attachments/assets/e009e587-a037-4b0a-aa33-4952d96676f0" />












