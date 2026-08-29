from fastapi import APIRouter
from app.services.aws_sync import sync_ec2

router = APIRouter()

@router.post("/sync")
def sync_resources():
    return sync_ec2()