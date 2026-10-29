import boto3

s3 = boto3.client("s3")

def get_s3_buckets():
    response = s3.list_buckets()

    buckets = []

    for bucket in response["Buckets"]:
        buckets.append({
            "name": bucket["Name"],
            "created": bucket["CreationDate"].strftime("%Y-%m-%d"),
        })

    return buckets