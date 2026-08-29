import boto3

ec2 = boto3.client("ec2")


def get_ec2_instances():
    response = ec2.describe_instances()

    instances = []

    for reservation in response["Reservations"]:
        for instance in reservation["Instances"]:

            name = ""

            if "Tags" in instance:
                for tag in instance["Tags"]:
                    if tag["Key"] == "Name":
                        name = tag["Value"]

            instances.append({
                "id": instance["InstanceId"],
                "name": name,
                "type": instance["InstanceType"],
                "state": instance["State"]["Name"],
                "region": ec2.meta.region_name,
            })

    return {
        "status": "success",
        "instances": instances,
    }