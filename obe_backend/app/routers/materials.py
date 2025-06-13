#app/routers/materials.py

from fastapi import APIRouter, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from app.services.db import get_db
from app.models.schemas import StudentResultCreate
from app.services import crud
from app.services.improvement import get_combined_study_material
from fastapi import APIRouter, HTTPException
from app.models.schemas import StudentResultOut, StudentDetailsOut , ClassPerformanceOut , StudentLoginRequest, StudentLoginResponse, TeacherCreate, TeacherOut,TeacherLoginRequest,COmappingCreate,COmappingOut,CourseExamPair
import logging
from app.models.teacherSignup import Teacher
from typing import List
from sqlalchemy import select

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

@router.get("/student_details/{register_number}", response_model=StudentDetailsOut)
async def get_student_details(register_number: str, db: AsyncSession = Depends(get_db)):
    data = await crud.get_student_details_by_regno(db, register_number)
    if not data:
        raise HTTPException(status_code=404, detail="Student details not found")
    return data
@router.post("/student_details/", response_model=StudentDetailsOut)
async def create_student_detail_route(
    detail: crud.StudentDetailsCreate, db: AsyncSession = Depends(get_db)
):
    result = await crud.create_student_detail(db, detail)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to save student detail")
    return result

@router.get("/class_performance/", response_model=ClassPerformanceOut)
async def get_class_performance_route(
    course: str = Query(..., description="Course name"),
    exam: str = Query(..., description="Exam name"),
    db: AsyncSession = Depends(get_db)
):
    try:
        logger.info(f"Fetching class performance for course: {course}, exam: {exam}")
        performance = await crud.get_class_performance(db, course, exam)

        if not performance:
            logger.warning(f"No CO performance data found for course: {course}, exam: {exam}")
            raise HTTPException(status_code=404, detail="No CO performance data found for the selected course and exam.")

        logger.info(f"Performance data found: {performance.__dict__}")
        return performance

    except SQLAlchemyError as e:
        logger.exception(f"Database error while fetching class performance for {course} - {exam}", exc_info=e)
        raise HTTPException(status_code=500, detail="Internal server error")

    except Exception as e:
        logger.exception("Unexpected error in get_class_performance_route", exc_info=e)
        raise HTTPException(status_code=500, detail="Unexpected error")

@router.get("/class_performance/all_exams/")
async def get_all_exam_performance(
    course: str = Query(..., description="Course name"),
    db: AsyncSession = Depends(get_db)
):
    try:
        results = await db.execute(
            select(crud.ClassPerformance)
            .where(crud.ClassPerformance.course == course)
        )
        rows = results.scalars().all()
        if not rows:
            raise HTTPException(status_code=404, detail="No performance data found")
        # Sort by exam string, or implement natural sort using regex if needed
        rows.sort(key=lambda r: r.exam)
        return [r.to_dict() for r in rows]

    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="DB error fetching exams")


@router.get("/class-performance/options", response_model=List[CourseExamPair])
async def get_class_performance_options(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(crud.ClassPerformance.course, crud.ClassPerformance.exam))
    rows = result.all()
    # Deduplicate if needed
    unique_pairs = list({(course, exam) for course, exam in rows})
    return [{"course": course, "exam": exam} for course, exam in unique_pairs]

@router.post("/login/", response_model=StudentLoginResponse)
async def student_login(data: StudentLoginRequest, db: AsyncSession = Depends(get_db)):
    exists = await crud.check_register_number_exists(db, data.register_no)

    if exists:
        return StudentLoginResponse(success=True, message="Login successful")
    else:
        return StudentLoginResponse(success=False, message="Invalid register number")
    
@router.post("/teacher/signup", response_model=TeacherOut)
async def signup_teacher(data: TeacherCreate, db: AsyncSession = Depends(get_db)):
    teacher = await crud.create_teacher(db, data.email, data.password)
    return teacher


@router.post("/teacher/login")
async def login_teacher(data: TeacherLoginRequest, db: AsyncSession = Depends(get_db)):
    teacher = await crud.authenticate_teacher(db, data.email, data.password)

    if not teacher:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    return {"success": True}
@router.post("/teacher/login")
async def login_teacher(data: TeacherLoginRequest, db: AsyncSession = Depends(get_db)):
    teacher = await crud.authenticate_teacher(db, data.email, data.password)

    if not teacher:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    return {"success": True}

@router.post("/co-mapping/", status_code=201)
async def save_co_mapping(data: COmappingCreate, db: AsyncSession = Depends(get_db)):
    await crud.create_co_mapping(db, data)
    return {"message": "CO mapping saved successfully"}

@router.get("/co-mapping/", response_model=COmappingOut)
async def get_mapping(course: str, exam: str, db: AsyncSession = Depends(get_db)):
    mapping = await crud.get_co_mapping(db, course, exam)
    if not mapping:
        raise HTTPException(status_code=404, detail="Mapping not found")
    return mapping
