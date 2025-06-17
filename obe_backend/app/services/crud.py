# app/services/crud.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import and_
from typing import List, Dict, Union
from sqlalchemy import insert
from sqlalchemy.dialects.postgresql import insert as pg_insert
import logging
from app.models.student_results import StudentResult
from app.models.schemas import StudentResultCreate, SuggestionItem, StudentDetailsCreate,ClassPerformanceCreate,COmappingCreate
from app.models.study_material import StudyMaterial
from app.models.student_details import StudentDetails
from app.models.teacherSignup import Teacher
from app.models.class_performance import ClassPerformance
from passlib.context import CryptContext
from app.models.co_mapping import COmapping



logger = logging.getLogger(__name__)


# ------------------------ STUDENT RESULT ------------------------

async def create_student_result(db: AsyncSession, result: StudentResultCreate):
    try:
        existing_result = await get_student_result_by_regno(db, result.register_number, result.exam, result.course)

        suggestions_dict = {
            k: v.dict() if hasattr(v, "dict") else v for k, v in result.suggestions.items()
        }

        if existing_result:
            existing_result.performance = result.performance
            existing_result.percentage = result.percentage
            existing_result.weak_cos = result.weak_cos
            existing_result.suggestions = suggestions_dict
            await db.commit()
            await db.refresh(existing_result)
            return existing_result
        else:
            db_result = StudentResult(
                register_number=result.register_number,
                exam = result.exam,
                course = result.course,
                performance=result.performance,
                percentage=result.percentage,
                weak_cos=result.weak_cos,
                suggestions=suggestions_dict
            )
            db.add(db_result)
            await db.commit()
            await db.refresh(db_result)
            return db_result

    except SQLAlchemyError as e:
        await db.rollback()
        logger.error("Error in create_student_result", exc_info=e)
        raise

async def get_student_result_by_regno(db: AsyncSession, register_number: str, exam: str, course: str):
    try:
        result = await db.execute(
            select(StudentResult).where(
                StudentResult.register_number == register_number,
                StudentResult.exam == exam,
                StudentResult.course == course
            )
        )
        return result.scalars().first()
    except Exception as e:
        logger.exception(f"Failed to fetch student result for {register_number}", exc_info=e)
        return None


# ------------------------ STUDY MATERIAL ------------------------

async def get_study_material_by_topic(db: AsyncSession, topic: str):
    try:
        cleaned_topic = topic.strip().lower()
        stmt = select(StudyMaterial).where(StudyMaterial.topic == cleaned_topic)
        result = await db.execute(stmt)
        record = result.scalars().first()
        if not record:
            return None
        return {
            "web_summaries": record.web_summaries,
            "youtube_videos": record.youtube_videos
        }
    except Exception as e:
        await db.rollback()
        logger.exception("Error while fetching study material", exc_info=e)
        return None


async def save_study_material(
    db: AsyncSession,
    topic: str,
    web_summaries: List[Dict[str, str]],
    youtube_videos: List[Dict[str, str]]
):
    try:
        cleaned_topic = topic.strip().lower()

        existing = await get_study_material_by_topic(db, cleaned_topic)
        if existing:
            logger.info(f"Study material already exists for topic: {topic}")
            return existing

        new_entry = StudyMaterial(
            topic=cleaned_topic,
            web_summaries=web_summaries,
            youtube_videos=youtube_videos
        )
        db.add(new_entry)
        await db.commit()
        await db.refresh(new_entry)
        logger.info(f"Saved new study material for topic: {topic}")
        return new_entry

    except Exception as e:
        await db.rollback()
        logger.exception(f"Failed to commit study material for topic: {topic}", exc_info=e)
        return None


async def save_study_material_from_suggestion(
    db: AsyncSession,
    topic: str,
    suggestion: Union[SuggestionItem, dict]
):
    try:
        if isinstance(suggestion, dict):
            material = suggestion.get("material", [])
            youtube_query = suggestion.get("youtube_query", "")
        else:
            material = suggestion.material if isinstance(suggestion.material, list) else []
            youtube_query = suggestion.youtube_query or ""

        youtube_videos = (
            [{"title": f"YouTube for {topic}", "url": youtube_query}]
            if youtube_query else []
        )

        return await save_study_material(db, topic, material, youtube_videos)

    except Exception as e:
        await db.rollback()
        logger.exception(f"Failed to save study material for topic: {topic}", exc_info=e)
        return None
async def get_student_details_by_regno(db: AsyncSession, register_number: str):
    result = await db.execute(
        select(StudentDetails).where(StudentDetails.register_number == register_number)
    )
    return result.scalar_one_or_none()

# ------------------------ STUDENT DETAILS ------------------------

async def create_student_detail(db: AsyncSession, detail: StudentDetailsCreate):
    try:
        detail_dict = detail.dict()

        # Construct insert statement with ON CONFLICT DO UPDATE
        stmt = pg_insert(StudentDetails).values(**detail_dict)

        # Prepare update dict excluding primary key fields
        update_dict = {
            key: stmt.excluded[key]
            for key in detail_dict.keys()
            if key not in ("register_number", "course", "exam")  # these are used for conflict resolution
        }

        stmt = stmt.on_conflict_do_update(
            index_elements=["register_number", "course", "exam"],
            set_=update_dict
        )

        await db.execute(stmt)
        await db.commit()
        logger.info(f"[UPSERT] StudentDetail upserted for {detail.register_number} ({detail.course}/{detail.exam})")
        return True

    except Exception as e:
        await db.rollback()
        logger.exception(f"[UPSERT ERROR] Failed to upsert student detail for {detail.register_number}", exc_info=e)
        return None
    
async def get_courses_exams_by_register_number(db: AsyncSession, register_number: str):
    result = await db.execute(
        select(StudentDetails.course, StudentDetails.exam).where(StudentDetails.register_number == register_number)
    )
    rows = result.fetchall()
    return [{"course": row.course, "exam": row.exam} for row in rows]


async def get_student_details_by_keys(db: AsyncSession, reg_no: str, course: str, exam: str):
    result = await db.execute(
        select(StudentDetails).where(
            and_(
                StudentDetails.register_number == reg_no,
                StudentDetails.course == course,
                StudentDetails.exam == exam
            )
        )
    )
    return result.scalar_one_or_none()

async def get_student_result_by_regno_exam_course(db: AsyncSession, register_number: str, exam: str, course: str):
    result = await db.execute(
        select(StudentResult).where(
            StudentResult.register_number == register_number,
            StudentResult.exam == exam,
            StudentResult.course == course
        )
    )
    return result.scalar_one_or_none()

async def get_student_details_by_regno_exam_course(db: AsyncSession, register_number: str, exam: str, course: str):
    result = await db.execute(
        select(StudentDetails).where(
            StudentDetails.register_number == register_number,
            StudentDetails.exam == exam,
            StudentDetails.course == course
        )
    )
    return result.scalar_one_or_none()


async def get_all_exam_records_by_student_course(
    db: AsyncSession, register_number: str, course: str
):
    result = await db.execute(
        select(StudentDetails).where(
            StudentDetails.register_number == register_number,
            StudentDetails.course == course
        ).order_by(StudentDetails.uploaded_at)
    )
    return result.scalars().all()


async def get_class_co_attainment(db: AsyncSession, course: str, exam: str):
    query = (
        select(
            StudentDetails.register_number,
            StudentDetails.co1,
            StudentDetails.co2,
            StudentDetails.co3,
            StudentDetails.co4,
            StudentDetails.co5,
            StudentDetails.co6,
        )
        .where(StudentDetails.course == course)
        .where(StudentDetails.exam == exam)
    )
    result = await db.execute(query)
    return result.mappings().all()
    
# ------------------------ CLASS PERFORMANCE ------------------------

async def get_class_performance(db: AsyncSession, course: str, exam: str):
    try:
        result = await db.execute(
            select(ClassPerformance).where(
                and_(
                    ClassPerformance.course == course,
                    ClassPerformance.exam == exam
                )
            )
        )
        return result.scalars().first()
    except Exception as e:
        await db.rollback()
        logger.exception(f"Failed to fetch class performance for {course} - {exam}", exc_info=e)
        return None


async def save_class_performance(db: AsyncSession, performance_data: ClassPerformanceCreate):
    try:
        existing = await get_class_performance(db, performance_data.course, performance_data.exam)

        if existing:
            for field, value in performance_data.dict(exclude_unset=True).items():
                setattr(existing, field, value)
            await db.commit()
            await db.refresh(existing)
            return existing
        else:
            record = ClassPerformance(**performance_data.dict())
            db.add(record)
            await db.commit()
            await db.refresh(record)
            return record

    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to save or update class performance", exc_info=e)
        return None


async def get_class_performance(db: AsyncSession, course: str, exam: str):
    result = await db.execute(
        select(ClassPerformance).where(
            ClassPerformance.course == course,
            ClassPerformance.exam == exam
        )
    )
    return result.scalar_one_or_none()

async def check_register_number_exists(db: AsyncSession, register_no: str) -> bool:
    result = await db.execute(
        select(StudentDetails).where(StudentDetails.register_number == register_no,)
    )
    student = result.scalar()  
    return student is not None

#---------------------------------------Teacher Sign Up ---------------------------------------------------------------

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Hash password
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Verify password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Create teacher
async def create_teacher(db: AsyncSession, email: str, password: str) -> Teacher:
    hashed_pw = get_password_hash(password)
    new_teacher = Teacher(email=email, hashed_password=hashed_pw)
    db.add(new_teacher)
    await db.commit()
    await db.refresh(new_teacher)
    return new_teacher

# Authenticate teacher
async def authenticate_teacher(db: AsyncSession, email: str, password: str) -> Teacher | None:
    result = await db.execute(select(Teacher).where(Teacher.email == email))
    teacher = result.scalar_one_or_none()
    if teacher and verify_password(password, teacher.hashed_password):
        return teacher
    return None

#------------------------------STUDENT WISE ENTRY SECTION -------------------------------------------------------

async def create_co_mapping(db: AsyncSession, data: COmappingCreate):
    stmt = pg_insert(COmapping).values(**data.dict()).on_conflict_do_update(
        index_elements=["course", "exam"],
        set_={
            "question_to_co": data.question_to_co,
            "co_definition": data.co_definition
        }
    )
    await db.execute(stmt)
    await db.commit()

async def get_co_mapping(db: AsyncSession, course: str, exam: str):
    result = await db.execute(
        select(COmapping).where(COmapping.course == course, COmapping.exam == exam)
    )
    return result.scalar_one_or_none()

async def get_question_to_co_and_definitions(db: AsyncSession, course: str, exam: str) -> tuple[dict, dict]:
    mapping = await get_co_mapping(db, course, exam)
    if not mapping:
        raise ValueError(f"CO mapping not found for course: {course}, exam: {exam}")

    return mapping.question_to_co, mapping.co_definition
