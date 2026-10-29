from app.services.aws_service import get_monthly_cost
from app.services.aws_budget import get_budgets
from app.services.aws_resource_summary import get_resource_summary
from app.services.aws_optimizer import get_optimization_recommendations


def get_report_summary():
    try:
        monthly = get_monthly_cost()
        budget = get_budgets()
        resources = get_resource_summary()
        optimization = get_optimization_recommendations()

        monthly_cost = 0
        if monthly.get("status") == "success":
            monthly_cost = monthly.get("total_cost", 0)

        budget_amount = 0
        spent = 0
        remaining = 0

        if budget.get("status") == "success" and budget.get("budgets"):
            b = budget["budgets"][0]
            budget_amount = b.get("budget", 0)
            spent = b.get("spent", 0)
            remaining = b.get("remaining", 0)

        summary = resources.get("summary", {})
        total_resources = (
            summary.get("ec2", 0)
            + summary.get("s3", 0)
            + summary.get("rds", 0)
            + summary.get("lambda", 0)
        )

        estimated_savings = optimization.get("estimated_savings", 0)

        return {
            "status": "success",
            "monthly_cost": monthly_cost,
            "budget": budget_amount,
            "spent": spent,
            "remaining": remaining,
            "resources": total_resources,
            "estimated_savings": estimated_savings,
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }