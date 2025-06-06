from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import and_
from typing import List, Dict, Union
import logging
from app.models.student_results import StudentResult
from app.models.schemas import StudentResultCreate, SuggestionItem
from app.models.study_material import StudyMaterial
from app.models.student_details import StudentDetails
from app.models.schemas import StudentDetailsCreate, ClassPerformanceCreate
from app.models.class_performance import ClassPerformance

logger = logging.getLogger(__name__)


# ------------------------ STUDENT RESULT ------------------------

async def create_student_result(db: AsyncSession, result: StudentResultCreate):
    try:
        existing_result = await get_student_result_by_regno(db, result.register_number)

        # If the session was already invalid due to earlier failure
        if existing_result is None and isinstance(existing_result, Exception):
            raise existing_result

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


async def get_student_result_by_regno(db: AsyncSession, register_number: str):
    try:
        result = await db.execute(
            select(StudentResult).where(StudentResult.register_number == register_number)
        )
        return result.scalars().first()
    except Exception as e:
        await db.rollback()
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


# ------------------------ STUDENT DETAILS ------------------------


async def create_student_detail(db: AsyncSession, detail: StudentDetailsCreate):
    try:
        # Step 1: Check if student already exists
        query = select(StudentDetails).where(StudentDetails.register_number == detail.register_number)
        result = await db.execute(query)
        existing_student = result.scalar_one_or_none()

        if existing_student:
            logger.info(f"Student {detail.register_number} exists. Updating record.")
            # Update fields from incoming detail
            for field, value in detail.dict().items():
                setattr(existing_student, field, value)
        else:
            logger.info(f"Student {detail.register_number} not found. Creating new record.")
            existing_student = StudentDetails(**detail.dict())
            db.add(existing_student)

        await db.commit()
        await db.refresh(existing_student)
        return existing_student

    except Exception as e:
        await db.rollback()
        logger.exception(f"Failed to save/update student detail for {detail.register_number}", exc_info=e)
        return None


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
