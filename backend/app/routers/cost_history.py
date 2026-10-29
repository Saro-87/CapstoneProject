from fastapi import APIRouter

router = APIRouter()

@router.get("/cost-history")
def get_cost_history():
    return [
        {"month": "Jan", "cost": 3200},
        {"month": "Feb", "cost": 4100},
        {"month": "Mar", "cost": 3800},
        {"month": "Apr", "cost": 4500},
        {"month": "May", "cost": 5200},
        {"month": "Jun", "cost": 4700},
        {"month": "Jul", "cost": 4551},
    ]