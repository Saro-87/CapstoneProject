"""Synchronize AWS inventory across enabled regions.

Inventory monthly cost is intentionally null because resource-level cost
allocation is not available unless it is separately enabled/configured.
"""
import os

import boto3
from dotenv import load_dotenv
from sqlalchemy import text

from app.database import engine

load_dotenv()


def _session():
    return boto3.Session(region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"))


def sync_ec2():
    """Collect EC2 instances from every enabled AWS region before replacing rows."""
    session = _session()
    home_region = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
    ec2_home = session.client("ec2", region_name=home_region)
    regions = [
        item["RegionName"]
        for item in ec2_home.describe_regions(AllRegions=False).get("Regions", [])
    ]
    if home_region not in regions:
        regions.append(home_region)

    records = []
    for region in sorted(set(regions)):
        client = session.client("ec2", region_name=region)
        paginator = client.get_paginator("describe_instances")
        for page in paginator.paginate():
            for reservation in page.get("Reservations", []):
                for instance in reservation.get("Instances", []):
                    name = next(
                        (tag["Value"] for tag in instance.get("Tags", []) if tag.get("Key") == "Name"),
                        instance["InstanceId"],
                    )
                    records.append({
                        "provider": "AWS",
                        "name": name,
                        "type": "EC2",
                        "region": region,
                        "status": instance.get("State", {}).get("Name", "unknown"),
                        "cost": None,
                    })

    with engine.begin() as connection:
        connection.execute(text("""
            DELETE FROM resources
            WHERE UPPER(provider) = 'AWS' AND UPPER(resource_type) = 'EC2'
        """))
        if records:
            connection.execute(text("""
                INSERT INTO resources
                (provider, resource_name, resource_type, region, status, monthly_cost)
                VALUES (:provider, :name, :type, :region, :status, :cost)
            """), records)

    return {"resource_type": "EC2", "regions_checked": len(set(regions)), "resources_synced": len(records)}


def sync_s3():
    """Collect global S3 buckets and their regions before replacing rows."""
    session = _session()
    client = session.client("s3")
    records = []
    for bucket in client.list_buckets().get("Buckets", []):
        name = bucket["Name"]
        location = client.get_bucket_location(Bucket=name).get("LocationConstraint")
        records.append({
            "provider": "AWS",
            "name": name,
            "type": "S3",
            "region": location or "us-east-1",
            "status": "Available",
            "cost": None,
        })

    with engine.begin() as connection:
        connection.execute(text("""
            DELETE FROM resources
            WHERE UPPER(provider) = 'AWS' AND UPPER(resource_type) = 'S3'
        """))
        if records:
            connection.execute(text("""
                INSERT INTO resources
                (provider, resource_name, resource_type, region, status, monthly_cost)
                VALUES (:provider, :name, :type, :region, :status, :cost)
            """), records)

    return {"resource_type": "S3", "resources_synced": len(records)}


def sync_aws():
    """Synchronize AWS EC2 and S3 inventory."""
    ec2_result = sync_ec2()
    s3_result = sync_s3()
    return {
        "status": "success",
        "provider": "AWS",
        "ec2": ec2_result,
        "s3": s3_result,
        "message": "AWS EC2 inventory across enabled regions and global S3 buckets synchronized.",
    }


if __name__ == "__main__":
    print(sync_aws())
