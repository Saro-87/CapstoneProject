from fastapi import APIRouter
from app.services.report_service import get_report_summary
from fastapi.responses import StreamingResponse
from app.utils.pdf_generator import generate_pdf


router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"]
)

@router.get("/summary")
def report_summary():
    return get_report_summary()
@router.get("/pdf")
def export_pdf():

    report = get_report_summary()

    pdf = generate_pdf(report)

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=AWS_FinOps_Report.pdf"
        },
    )