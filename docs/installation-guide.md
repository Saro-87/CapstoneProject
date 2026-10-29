# Installation Guide

## Overview

This guide explains how to install and configure the Multi-Cloud FinOps Dashboard for local development.

---

# System Requirements

## Operating System

- Windows 10/11
- Ubuntu 22.04+
- macOS Ventura+

## Software Requirements

- Python 3.10+
- Node.js 18+
- npm
- Git
- Visual Studio Code (Recommended)

---

# Clone the Repository

```bash
git clone https://github.com/<your-username>/MultiCloud-FinOps-Dashboard.git

cd MultiCloud-FinOps-Dashboard
```

---

# Backend Installation

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the environment:

### Windows

```bash
venv\Scripts\activate
```

### Linux/macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

# Configure Environment Variables

Create a `.env` file in the backend directory:

```env
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
AWS_DEFAULT_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012
```

---

# Start Backend

```bash
uvicorn app.main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

---

# Frontend Installation

Navigate to the frontend directory:

```bash
cd frontend
```

Install packages:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# Verify Installation

Check that:

- Dashboard loads successfully
- Backend APIs respond
- AWS Cost Explorer data is visible
- Budget information is displayed
- Charts render correctly
- Reports can be generated

---

# Troubleshooting

### Backend does not start

- Verify Python version
- Install all requirements
- Check `.env` configuration

### Frontend does not start

- Run `npm install`
- Ensure Node.js 18+ is installed

### AWS data is missing

- Verify IAM permissions
- Enable AWS Cost Explorer
- Confirm AWS credentials in `.env`