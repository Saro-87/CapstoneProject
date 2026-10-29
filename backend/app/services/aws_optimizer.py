import boto3
import os
from dotenv import load_dotenv

load_dotenv()

ec2 = boto3.client(
    "ec2",
    region_name=os.getenv("AWS_DEFAULT_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)


def get_optimization_recommendations():
    recommendations = []

    try:
        # Find stopped EC2 instances
        response = ec2.describe_instances(
            Filters=[
                {
                    "Name": "instance-state-name",
                    "Values": ["stopped"]
                }
            ]
        )

        for reservation in response["Reservations"]:
            for instance in reservation["Instances"]:
                recommendations.append({
                    "resource": "EC2",
                    "resource_id": instance["InstanceId"],
                    "recommendation": "Delete or start this stopped EC2 instance if it is no longer needed.",
                    "priority": "Medium",
                    "estimated_savings": 10.0
                })

        return {
            "status": "success",
            "estimated_savings": sum(r["estimated_savings"] for r in recommendations),
            "recommendations": recommendations
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }