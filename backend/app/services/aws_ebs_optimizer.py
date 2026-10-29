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


def get_ebs_recommendations():
    recommendations = []

    try:
        response = ec2.describe_volumes(
            Filters=[
                {
                    "Name": "status",
                    "Values": ["available"]   # Unattached volumes
                }
            ]
        )

        for volume in response["Volumes"]:
            size = volume["Size"]  # GB

            # Simple estimated monthly savings (gp3 approx. $0.08/GB-month)
            estimated = round(size * 0.08, 2)

            recommendations.append({
                "resource": "EBS",
                "resource_id": volume["VolumeId"],
                "size_gb": size,
                "volume_type": volume["VolumeType"],
                "recommendation": "Delete unattached EBS volume",
                "priority": "High",
                "estimated_savings": estimated
            })

        return recommendations

    except Exception as e:
        print(e)
        return []