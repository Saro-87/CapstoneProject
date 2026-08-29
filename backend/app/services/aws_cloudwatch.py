import boto3
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

cloudwatch = boto3.client(
    "cloudwatch",
    region_name=os.getenv("AWS_DEFAULT_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

ec2 = boto3.client(
    "ec2",
    region_name=os.getenv("AWS_DEFAULT_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)


def get_cloudwatch_metrics():
    try:

        instances = ec2.describe_instances()

        instance_ids = []

        for reservation in instances["Reservations"]:
            for instance in reservation["Instances"]:
                if instance["State"]["Name"] == "running":
                    instance_ids.append(instance["InstanceId"])

        if not instance_ids:
            return {
                "status": "success",
                "message": "No running EC2 instances.",
                "metrics": []
            }

        end = datetime.utcnow()
        start = end - timedelta(hours=1)

        metrics = []

        for instance_id in instance_ids:

            cpu = cloudwatch.get_metric_statistics(
                Namespace="AWS/EC2",
                MetricName="CPUUtilization",
                Dimensions=[
                    {
                        "Name": "InstanceId",
                        "Value": instance_id
                    }
                ],
                StartTime=start,
                EndTime=end,
                Period=300,
                Statistics=["Average"]
            )

            cpu_value = 0

            if cpu["Datapoints"]:
                cpu_value = round(
                    cpu["Datapoints"][-1]["Average"],
                    2
                )

            metrics.append({
                "instance_id": instance_id,
                "cpu": cpu_value
            })

        return {
            "status": "success",
            "metrics": metrics
        }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }