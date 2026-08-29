# API Documentation

## Base URL

```
http://localhost:8000
```

---

# AWS APIs

## 1. Monthly Cost

**Endpoint**

```
GET /api/aws/monthly-cost
```

**Description**

Returns the current month's total AWS cost.

**Response**

```json
{
  "status": "success",
  "monthly_cost": 245.78
}
```

---

## 2. Daily Cost

**Endpoint**

```
GET /api/aws/daily-cost
```

**Description**

Returns today's AWS spending.

---

## 3. Monthly History

**Endpoint**

```
GET /api/aws/monthly-history
```

**Description**

Returns monthly cost history for trend charts.

---

## 4. Cost by Service

**Endpoint**

```
GET /api/aws/service-cost
```

**Description**

Returns AWS spending grouped by service.

Example:

```json
[
  {
    "service": "Amazon EC2",
    "cost": 125.30
  },
  {
    "service": "Amazon S3",
    "cost": 42.18
  }
]
```

---

## 5. Cost by Region

**Endpoint**

```
GET /api/aws/region-cost
```

**Description**

Returns AWS costs grouped by region.

---

## 6. Resource Summary

**Endpoint**

```
GET /api/aws/resources
```

**Description**

Returns discovered AWS resources.

Includes:

- EC2
- S3
- RDS
- Lambda

---

## 7. Budget

**Endpoint**

```
GET /api/aws/budget
```

**Description**

Returns AWS Budget information.

---

## 8. CloudWatch

**Endpoint**

```
GET /api/aws/cloudwatch
```

**Description**

Returns EC2 CloudWatch metrics.

---

## 9. Cost Optimization

**Endpoint**

```
GET /api/aws/optimization
```

**Description**

Returns cost-saving recommendations.

Checks:

- Idle EC2
- Unattached EBS
- Idle RDS
- Missing S3 Lifecycle
- Large Lambda Packages

---

## 10. Cost Anomaly

**Endpoint**

```
GET /api/aws/anomaly
```

**Description**

Detects unusual spending patterns.

---

# Reports

## Report Summary

```
GET /api/reports/summary
```

Returns dashboard summary.

---

## Export PDF

```
GET /api/reports/pdf
```

Downloads the AWS Cost Report in PDF format.