from fastapi import APIRouter, Query, Depends
from app.services.materials import get_combined_study_material
from app.services.improvement import suggest_improvement_strategy
from app.auth import require_role, UserRole  # Import your auth roles and dependency

router = APIRouter()

@router.get("/materials/")
def get_materials(
    co_topic: str = Query(..., description="Course Outcome Topic"),
    user=Depends(require_role(UserRole.student, UserRole.teacher, UserRole.admin))  # Roles allowed to access
):
    """
    Get combined study materials including Wikipedia summary,
    YouTube videos, and personalized study recommendations for the given topic.
    """
    return get_combined_study_material(co_topic)

@router.get("/strategies/")
def get_strategies(
    co_topic: str = Query(..., description="Course Outcome Topic"),
    user=Depends(require_role(UserRole.student, UserRole.teacher, UserRole.admin))  # Roles allowed to access
):
    """
    Get suggested improvement strategies for the given topic.
    """
    return {"strategies": suggest_improvement_strategy(co_topic)}
