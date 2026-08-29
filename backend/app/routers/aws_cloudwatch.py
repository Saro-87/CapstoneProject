from fastapi import APIRouter
from app.services.aws_cloudwatch import get_cloudwatch_metrics

router = APIRouter(
    prefix="/api/aws",
    tags=["CloudWatch"]
)


@router.get("/cloudwatch")
def cloudwatch():
    return get_cloudwatch_metrics()