import os
import boto3
from dotenv import load_dotenv

load_dotenv()

budgets = boto3.client(
    "budgets",
    region_name="us-east-1",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

ACCOUNT_ID = os.getenv("AWS_ACCOUNT_ID")


def get_budgets():
    try:
        response = budgets.describe_budgets(
            AccountId=ACCOUNT_ID,
            MaxResults=10,
        )

        data = []

        for budget in response["Budgets"]:
            limit = float(budget["BudgetLimit"]["Amount"])
            actual = float(
                budget["CalculatedSpend"]["ActualSpend"]["Amount"]
            )

            remaining = limit - actual
            percentage = (
                (actual / limit) * 100 if limit else 0
            )

            data.append({
                "name": budget["BudgetName"],
                "budget": limit,
                "spent": actual,
                "remaining": round(remaining, 2),
                "percentage": round(percentage, 2),
            })
        print({
            "status": "success",
            "budgets": data,
        })
        return {
            "status": "success",
            "budgets": data,
        }

    except Exception as e:
        print({
            "status": "error",
            "message": str(e),
        })
        return {
            "status": "error",
            "message": str(e),
        }