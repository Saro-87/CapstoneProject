from fastapi import APIRouter
from app.services.aws_anomaly import get_cost_anomaly

router = APIRouter(
    prefix="/api/aws",
    tags=["AWS Anomaly Detection"]
)

@router.get("/anomaly")
def anomaly():
    return get_cost_anomaly()