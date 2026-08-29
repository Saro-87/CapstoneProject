from fastapi import APIRouter

router = APIRouter(prefix="/api/aws", tags=["Budget"])

@router.get("/budget")
def get_budget():
    return {
        "budget": 500,
        "spent": 220,
        "remaining": 280,
        "percentage": 44
    }