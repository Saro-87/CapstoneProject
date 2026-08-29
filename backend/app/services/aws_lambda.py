import boto3

client = boto3.client("lambda")

def get_lambda_functions():
    response = client.list_functions()

    functions = []

    for fn in response["Functions"]:
        functions.append({
            "name": fn["FunctionName"],
            "runtime": fn["Runtime"],
        })

    return functions