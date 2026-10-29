from fastapi import APIRouter
from app.services.aws_budget import get_budgets

router = APIRouter(
    prefix="/api/aws",
    tags=["AWS Budget"],
)

@router.get("/budget")
def budget():
    return get_budgets()