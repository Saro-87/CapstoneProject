from fastapi import APIRouter
from app.services.aws_optimizer import get_optimization_recommendations
from app.services.aws_ebs_optimizer import get_ebs_recommendations
from app.services.aws_s3_optimizer import get_s3_recommendations
from app.services.aws_rds_optimizer import get_rds_recommendations
from app.services.aws_lambda_optimizer import get_lambda_recommendations

router = APIRouter(
    prefix="/api/aws",
    tags=["AWS Optimization"]
)


@router.get("/optimization")
def get_optimization():
    """
    Returns AWS cost optimization recommendations.
    Includes EC2 and EBS optimization suggestions.
    """
    return get_optimization_recommendations()

def get_optimization_recommendations():

    recommendations = []

    # Existing EC2 recommendations
    # (keep your existing EC2 code here)

    recommendations.extend(get_ebs_recommendations())
    recommendations.extend(get_s3_recommendations())
    recommendations.extend(get_rds_recommendations())
    recommendations.extend(get_lambda_recommendations())

    total = sum(
        item["estimated_savings"]
        for item in recommendations
    )

    return {
        "status": "success",
        "estimated_savings": round(total, 2),
        "recommendations": recommendations
    }