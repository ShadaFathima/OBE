from fastapi import APIRouter, Query
from app.services.improvement import get_combined_study_material

router = APIRouter()

@router.get("/materials/")
async def get_materials(
    co_topic: str = Query(..., description="Course Outcome Topic (e.g., CO1, CO2)")
):
    """
    Get combined study materials for the given CO topic.
    """
    return await get_combined_study_material(co_topic)
