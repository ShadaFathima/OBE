from fastapi import APIRouter, Query
from app.services.improvement import suggest_improvement_strategy, get_combined_study_material
from app.utils.co_mapping import co_definitions

router = APIRouter()

@router.get("/materials/")
def get_materials(
    co_topic: str = Query(..., description="Course Outcome Topic (e.g., CO1, CO2)")
):
    """
    Get combined study materials for the given CO topic.
    """
    # Use CO description if co_topic is a CO code
    topic_text = co_definitions.get(co_topic.upper(), co_topic)
    return get_combined_study_material(topic_text)

@router.get("/improvement/")
def get_improvement(
    co_code: str = Query(..., description="Course Outcome Code (e.g., CO1, CO2)")
):
    """
    Get suggested improvement strategies for the given CO.
    This internally fetches combined study materials too.
    """
    return suggest_improvement_strategy(co_code.upper())
