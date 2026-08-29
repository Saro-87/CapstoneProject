import boto3

rds = boto3.client("rds")

def get_rds_instances():
    response = rds.describe_db_instances()

    databases = []

    for db in response["DBInstances"]:
        databases.append({
            "name": db["DBInstanceIdentifier"],
            "engine": db["Engine"],
            "status": db["DBInstanceStatus"],
        })

    return databases