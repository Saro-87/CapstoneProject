import boto3
import os
from dotenv import load_dotenv

load_dotenv()

rds = boto3.client(
    "rds",
    region_name=os.getenv("AWS_DEFAULT_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)


def get_rds_recommendations():
    recommendations = []

    try:
        response = rds.describe_db_instances()

        for db in response["DBInstances"]:

            if db["DBInstanceStatus"] == "stopped":

                recommendations.append({
                    "resource": "RDS",
                    "resource_id": db["DBInstanceIdentifier"],
                    "recommendation": "Delete unused stopped database.",
                    "priority": "High",
                    "estimated_savings": 20.00
                })

        return recommendations

    except Exception as e:
        print(e)
        return []