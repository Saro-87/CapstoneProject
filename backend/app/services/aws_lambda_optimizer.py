import boto3
import os
from dotenv import load_dotenv

load_dotenv()

lambda_client = boto3.client(
    "lambda",
    region_name=os.getenv("AWS_DEFAULT_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)


def get_lambda_recommendations():
    recommendations = []

    try:

        response = lambda_client.list_functions()

        for function in response["Functions"]:

            if function["CodeSize"] > 50000000:

                recommendations.append({
                    "resource": "Lambda",
                    "resource_id": function["FunctionName"],
                    "recommendation": "Reduce deployment package size.",
                    "priority": "Low",
                    "estimated_savings": 2.00
                })

        return recommendations

    except Exception as e:
        print(e)
        return []