#app/routers/materials.py

from fastapi import APIRouter, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.db import get_db
from app.models.schemas import StudentResultCreate
from app.services import crud
from app.services.improvement import get_combined_study_material
from fastapi import APIRouter, HTTPException
from app.models.schemas import StudentResultOut
import logging
router = APIRouter()

logger = logging.getLogger(__name__)

@router.get("/materials/")
async def get_materials(
    co_topic: str = Query(..., description="Course Outcome Topic (e.g., CO1, CO2)"),
    db: AsyncSession = Depends(get_db),  # Inject DB session here
):
    """
    Get combined study materials for the given CO topic.
    """
    try:
        materials = await get_combined_study_material(co_topic, db)
        return materials
    except Exception as e:
        logger.error(f"Failed to get materials for topic {co_topic}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    

    
@router.post("/results/", response_model=StudentResultOut)
async def save_student_result(
    result: StudentResultCreate, db: AsyncSession = Depends(get_db)
):
    return await crud.create_student_result(db, result)

@router.get("/results/{register_number}", response_model=StudentResultOut)
async def get_student_result(
    register_number: str, db: AsyncSession = Depends(get_db)
):
    data = await crud.get_student_result_by_regno(db, register_number)
    if not data:
        raise HTTPException(status_code=404, detail="Result not found")
    return data