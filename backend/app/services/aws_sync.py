import boto3
from sqlalchemy import text
from app.database import engine

ec2 = boto3.client("ec2")
s3 = boto3.client("s3")

def sync_ec2():
    response = ec2.describe_instances()

    with engine.begin() as conn:

        # Remove old AWS EC2 records
        conn.execute(text("""
            DELETE FROM resources
            WHERE provider='AWS'
            AND resource_type='EC2'
        """))

        for reservation in response["Reservations"]:
            for instance in reservation["Instances"]:

                name = ""

                for tag in instance.get("Tags", []):
                    if tag["Key"] == "Name":
                        name = tag["Value"]

                conn.execute(
                    text("""
                        INSERT INTO resources
                        (
                            provider,
                            resource_name,
                            resource_type,
                            region,
                            status,
                            monthly_cost
                        )
                        VALUES
                        (
                            :provider,
                            :name,
                            :type,
                            :region,
                            :status,
                            :cost
                        )
                    """),
                    {
                        "provider": "AWS",
                        "name": name or instance["InstanceId"],
                        "type": "EC2",
                        "region": ec2.meta.region_name,
                        "status": instance["State"]["Name"],
                        "cost": 0
                    }
                )
def sync_s3():
    response = s3.list_buckets()

    with engine.begin() as conn:

        # Remove old AWS S3 records
        conn.execute(text("""
            DELETE FROM resources
            WHERE provider='AWS'
            AND resource_type='S3'
        """))

        for bucket in response["Buckets"]:

            # Get bucket region
            location = s3.get_bucket_location(Bucket=bucket["Name"])
            region = location["LocationConstraint"] or "us-east-1"

            conn.execute(
                text("""
                    INSERT INTO resources
                    (
                        provider,
                        resource_name,
                        resource_type,
                        region,
                        status,
                        monthly_cost
                    )
                    VALUES
                    (
                        :provider,
                        :name,
                        :type,
                        :region,
                        :status,
                        :cost
                    )
                """),
                {
                    "provider": "AWS",
                    "name": bucket["Name"],
                    "type": "S3",
                    "region": region,
                    "status": "Available",
                    "cost": 0,
                },
            )
def sync_aws():
    """Sync AWS resources (EC2 and S3)."""
    sync_ec2()
    sync_s3()
    return {"message": "AWS resources synchronized successfully"}


if __name__ == "__main__":
    # When run as a script, perform sync and print the result
    print(sync_aws())
    