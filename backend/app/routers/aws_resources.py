from fastapi import APIRouter

from app.services.aws_resource_summary import get_resource_summary
from app.services.aws_rds import get_rds_instances
router = APIRouter(
    prefix="/api/aws",
    tags=["AWS Resources"],
)

@router.get("/resources")
def aws_resources():
    return get_resource_summary()
rds = get_rds_instances()
