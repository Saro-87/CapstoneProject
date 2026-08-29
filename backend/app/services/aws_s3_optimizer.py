import boto3
import os
from dotenv import load_dotenv

load_dotenv()

s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)


def get_s3_recommendations():
    recommendations = []

    try:
        buckets = s3.list_buckets()["Buckets"]

        for bucket in buckets:
            bucket_name = bucket["Name"]

            try:
                s3.get_bucket_lifecycle_configuration(Bucket=bucket_name)
            except Exception:
                recommendations.append({
                    "resource": "S3",
                    "resource_id": bucket_name,
                    "recommendation": "Add Lifecycle Policy to reduce storage cost.",
                    "priority": "Medium",
                    "estimated_savings": 5.00
                })

        return recommendations

    except Exception as e:
        print(e)
        return []