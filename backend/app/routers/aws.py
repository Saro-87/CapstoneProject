from fastapi import APIRouter
from app.services.aws_service import (
    get_daily_cost,
    get_monthly_cost,
    get_cost_by_service,
    get_cost_by_region,
    get_monthly_history,
)
from app.services.aws_sync import sync_aws

router = APIRouter(
    prefix="/api/aws",
    tags=["AWS Cost Explorer"],
)


@router.get("/daily-cost")
def daily_cost():
    """
    Get today's AWS cost.
    """
    return get_daily_cost()


@router.get("/monthly-cost")
def monthly_cost():
    """
    Get the current month's total AWS cost.
    """
    return get_monthly_cost()


@router.get("/service-cost")
def service_cost():
    """
    Get AWS cost grouped by service.
    """
    return get_cost_by_service()


@router.get("/region-cost")
def region_cost():
    """
    Get AWS cost grouped by region.
    """
    return get_cost_by_region()


@router.get("/monthly-history")
def monthly_history():
    """
    Get monthly AWS cost history.
    """
    return get_monthly_history()


@router.post("/sync")
def sync():
    """
    Synchronize AWS resources (EC2 + S3).
    """
    return sync_aws()
from app.services.aws_sync import sync_ec2

@router.post("/sync")
def sync_resources():
    return sync_ec2()