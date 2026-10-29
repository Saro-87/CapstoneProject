# Deployment Guide

## Overview

This guide explains how to deploy the Multi-Cloud FinOps Dashboard in a local development environment and prepare it for production.

---

# Prerequisites

Install the following software before deployment:

- Python 3.10 or later
- Node.js 18+
- npm
- Git
- AWS Account
- AWS IAM User with Cost Explorer permissions

---

# Clone Repository

```bash
git clone https://github.com/<username>/MultiCloud-FinOps-Dashboard.git

cd MultiCloud-FinOps-Dashboard
```

---

# Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the environment.

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file:

```env
AWS_ACCESS_KEY_ID=xxxxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxx
AWS_DEFAULT_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012
```

Run the backend:

```bash
uvicorn app.main:app --reload
```

Backend URL:

```
http://127.0.0.1:8000
```

---

# Frontend Setup

Navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend URL:

```
http://localhost:5173
```

---

# Verify the Application

Open the browser:

```
http://localhost:5173
```

Verify that:

- Dashboard loads successfully
- AWS costs are displayed
- Charts are populated
- Budget information is available
- CloudWatch metrics are displayed
- Reports can be generated

---

# Production Deployment (Future)

The project can be deployed using:

- Docker
- Docker Compose
- AWS EC2
- AWS Elastic Beanstalk
- Amazon ECS
- Kubernetes
- Nginx Reverse Proxy

---

# Security Recommendations

- Never commit the `.env` file.
- Use IAM users with least-privilege permissions.
- Rotate AWS access keys regularly.
- Enable HTTPS in production.
- Restrict CORS to trusted domains.