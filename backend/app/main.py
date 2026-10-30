from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import aws_sync
# Import Routers
from app.routers.dashboard import router as dashboard_router
from app.routers.resources import router as resources_router
from app.routers.alerts import router as alerts_router
from app.routers.recommendations import router as recommendations_router
from app.routers.cost_history import router as cost_history_router
from app.routers.cloud_distribution import router as cloud_distribution_router
from app.routers import aws
from app.routers import aws_budget
from app.routers import aws_resources
from app.routers import aws_optimizer
from app.routers import aws_cloudwatch
from app.routers import aws_anomaly
from app.routers import reports
from app.routers import cost_sync




app = FastAPI(
    title="Multi Cloud Cost Dashboard",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Home
@app.get("/")
def home():
    return {
        "message": "Multi Cloud Cost Dashboard API Running"
    }

# Register Routers
app.include_router(dashboard_router, prefix="/api")
app.include_router(resources_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")
app.include_router(recommendations_router, prefix="/api")
app.include_router(cost_history_router, prefix="/api")
app.include_router(cloud_distribution_router, prefix="/api")

# AWS APIs
app.include_router(aws.router)

# Budget APIs
app.include_router(aws.router)
app.include_router(aws_budget.router)
app.include_router(aws_cloudwatch.router)
app.include_router(aws_resources.router)
app.include_router(aws_optimizer.router)
app.include_router(aws_anomaly.router)
app.include_router(reports.router)
app.include_router(cost_sync.router)

