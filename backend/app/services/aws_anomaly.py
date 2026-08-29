import boto3
import os
from datetime import date, timedelta
from dotenv import load_dotenv

load_dotenv()

client = boto3.client(
    "ce",
    region_name="us-east-1",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)


def get_cost_anomaly():
    today = date.today()

    try:
        response = client.get_cost_and_usage(
            TimePeriod={
                "Start": (today - timedelta(days=2)).strftime("%Y-%m-%d"),
                "End": today.strftime("%Y-%m-%d")  # End date is exclusive
            },
            Granularity="DAILY",
            Metrics=["UnblendedCost"]
        )

        results = response.get("ResultsByTime", [])

        if len(results) < 2:
            return {
                "status": "success",
                "message": "Not enough billing data.",
                "anomaly": False
            }

        # Cost from two days ago
        yesterday_cost = float(
            results[0]["Total"]["UnblendedCost"]["Amount"]
        )

        # Cost from yesterday
        today_cost = float(
            results[1]["Total"]["UnblendedCost"]["Amount"]
        )

        # Remove floating-point noise
        EPSILON = 1e-6

        if abs(yesterday_cost) < EPSILON:
            yesterday_cost = 0.0

        if abs(today_cost) < EPSILON:
            today_cost = 0.0

        difference = today_cost - yesterday_cost

        if abs(difference) < EPSILON:
            difference = 0.0

        if yesterday_cost > 0:
            percentage = round((difference / yesterday_cost) * 100, 2)
        else:
            percentage = 0

        anomaly = percentage > 20

        return {
            "status": "success",
            "yesterday": round(yesterday_cost, 2),
            "today": round(today_cost, 2),
            "difference": round(difference, 2),
            "percentage": percentage,
            "anomaly": anomaly
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


if __name__ == "__main__":
    print(get_cost_anomaly())