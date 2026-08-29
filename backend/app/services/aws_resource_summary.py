from app.services.aws_ec2 import get_ec2_instances
from app.services.aws_s3 import get_s3_buckets
from app.services.aws_rds import get_rds_instances
from app.services.aws_lambda import get_lambda_functions

def get_resource_summary():
    ec2 = get_ec2_instances()
    s3 = get_s3_buckets()
    rds = get_rds_instances()
    lambdas = get_lambda_functions()

    return {
        "status": "success",
        "summary": {
            "ec2": len(ec2["instances"]),
            "s3": len(s3),
            "rds": len(rds),
            "lambda": len(lambdas),
        },
        "resources": {
            "ec2": ec2["instances"],
            "s3": s3,
            "rds": rds,
            "lambda": lambdas,
        },
    }