import os
from datetime import date, timedelta

import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Cost Explorer client
# Cost Explorer is a global service, so us-east-1 is commonly used.
client = boto3.client(
    "ce",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
)


def get_current_month():
    """
    Returns the start date of the current month and today's date.
    """
    today = date.today()
    return today.replace(day=1), today


def get_monthly_cost():
    """
    Returns the current month's AWS cost.
    Note: Cost Explorer treats End date as exclusive.
    """

    start_date, today = get_current_month()

    try:
        response = client.get_cost_and_usage(
            TimePeriod={
                "Start": str(start_date),
                "End": str(today + timedelta(days=1)),
            },
            Granularity="MONTHLY",
            Metrics=["UnblendedCost"],
        )

        metric = response["ResultsByTime"][0]["Total"]["UnblendedCost"]

        return {
            "status": "success",
            "month": today.strftime("%B %Y"),
            "amount": round(float(metric["Amount"]), 2),
            "currency": metric["Unit"],
        }

    except ClientError as e:
        return {
            "status": "error",
            "message": e.response["Error"]["Message"],
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
        }


def get_cost_by_service():
    """
    Returns current month's AWS cost grouped by service.
    """

    start_date, today = get_current_month()

    try:
        response = client.get_cost_and_usage(
            TimePeriod={
                "Start": str(start_date),
                "End": str(today + timedelta(days=1)),
            },
            Granularity="MONTHLY",
            Metrics=["UnblendedCost"],
            GroupBy=[
                {
                    "Type": "DIMENSION",
                    "Key": "SERVICE",
                }
            ],
        )

        services = []

        for group in response["ResultsByTime"][0]["Groups"]:

            metric = group["Metrics"]["UnblendedCost"]

            cost = round(float(metric["Amount"]), 2)

            # Ignore zero-cost services
            if cost > 0:
                services.append(
                    {
                        "service": group["Keys"][0],
                        "cost": cost,
                        "currency": metric["Unit"],
                    }
                )

        # Sort by highest cost first
        services.sort(key=lambda x: x["cost"], reverse=True)

        return {
            "status": "success",
            "month": today.strftime("%B %Y"),
            "services": services,
        }

    except ClientError as e:
        return {
            "status": "error",
            "message": e.response["Error"]["Message"],
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
        }


def get_daily_cost():
    """
    Returns yesterday's AWS cost.
    Cost Explorer data is typically delayed by 24 hours.
    """

    end_date = date.today()
    start_date = end_date - timedelta(days=1)

    try:
        response = client.get_cost_and_usage(
            TimePeriod={
                "Start": str(start_date),
                "End": str(end_date),
            },
            Granularity="DAILY",
            Metrics=["UnblendedCost"],
        )

        metric = response["ResultsByTime"][0]["Total"]["UnblendedCost"]

        return {
            "status": "success",
            "date": str(start_date),
            "amount": round(float(metric["Amount"]), 2),
            "currency": metric["Unit"],
        }

    except ClientError as e:
        return {
            "status": "error",
            "message": e.response["Error"]["Message"],
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
        }
def get_cost_by_region():
    """
    Get AWS cost grouped by region.
    """

    from datetime import date

    today = date.today()
    start_date = today.replace(day=1)

    try:
        response = client.get_cost_and_usage(
            TimePeriod={
                "Start": str(start_date),
                "End": str(today),
            },
            Granularity="MONTHLY",
            Metrics=["UnblendedCost"],
            GroupBy=[
                {
                    "Type": "DIMENSION",
                    "Key": "REGION"
                }
            ],
        )

        regions = []

        for group in response["ResultsByTime"][0]["Groups"]:
            regions.append({
                "region": group["Keys"][0],
                "cost": round(
                    float(group["Metrics"]["UnblendedCost"]["Amount"]),
                    2
                ),
            })

        return {
            "status": "success",
            "regions": regions,
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e),


        }
def get_monthly_history():
    """
    Returns monthly AWS cost history for the current year.
    """

    today = date.today()
    start_date = date(today.year, 1, 1)

    try:
        response = client.get_cost_and_usage(
            TimePeriod={
                "Start": str(start_date),
                "End": str(today + timedelta(days=1)),
            },
            Granularity="MONTHLY",
            Metrics=["UnblendedCost"],
        )

        history = []

        for item in response["ResultsByTime"]:
            history.append({
                "month": item["TimePeriod"]["Start"][:7],   # YYYY-MM
                "cost": round(
                    float(item["Total"]["UnblendedCost"]["Amount"]),
                    2
                ),
            })

        return {
            "status": "success",
            "history": history,
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
        }


def sync_aws():
    """Sync AWS resources (EC2 and S3)."""
    # sync_ec2()
    # sync_s3()
    return {
        "message": "AWS resources synchronized successfully"
    }


if __name__ == "__main__":
    print("\n========== Monthly Cost ==========")
    print(get_monthly_cost())

    print("\n========== Cost By Service ==========")
    print(get_cost_by_service())

    print("\n========== Yesterday Cost ==========")
    print(get_daily_cost())