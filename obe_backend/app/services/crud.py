#app/services/crud.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from app.models.student_results import StudentResult
from app.models.schemas import StudentResultCreate
from app.models.study_material import StudyMaterial
from typing import List, Dict, Union
import logging
from app.models.schemas import SuggestionItem
from app.models.student_details import StudentDetails
from app.models.schemas import StudentDetailsCreate
logger = logging.getLogger(__name__)


async def create_student_result(db: AsyncSession, result: StudentResultCreate):
    try:
        existing_result = await get_student_result_by_regno(db, result.register_number)
        if existing_result:
            existing_result.performance = result.performance
            existing_result.weak_cos = result.weak_cos
            existing_result.suggestions = {k: v.dict() for k, v in result.suggestions.items()}

            await db.commit()
            await db.refresh(existing_result)
            return existing_result
        else:
            db_result = StudentResult(
                register_number=result.register_number,
                performance=result.performance,
                weak_cos=result.weak_cos,
                suggestions={k: v.dict() for k, v in result.suggestions.items()}  # 👈 fix here

            )
            db.add(db_result)
            await db.commit()
            await db.refresh(db_result)
            return db_result

    except SQLAlchemyError as e:
        await db.rollback()
        logger.error("Error in create_student_result", exc_info=e)
        raise e


async def get_student_result_by_regno(db: AsyncSession, register_number: str):
    result = await db.execute(
        select(StudentResult).where(StudentResult.register_number == register_number)
    )
    return result.scalars().first()


async def get_study_material_by_topic(db: AsyncSession, topic: str):
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



async def save_study_material(
    db: AsyncSession,
    topic: str,
    web_summaries: List[Dict[str, str]],
    youtube_videos: List[Dict[str, str]]
):
    cleaned_topic = topic.strip().lower()
    existing = await get_study_material_by_topic(db, cleaned_topic)
    if existing:
        logger.info(f"Study material already exists for topic: {topic}")
        return existing

    new_entry = StudyMaterial(
        topic=cleaned_topic,
        web_summaries=web_summaries,
        youtube_videos=youtube_videos  # ✅ no need to json.dumps
    )
    db.add(new_entry)
    try:
        await db.commit()
        await db.refresh(new_entry)
        logger.info(f"Saved new study material for topic: {topic}")
        return new_entry
    except Exception as e:
        await db.rollback()
        logger.exception(f"Failed to commit study material for topic: {topic} — {e}")
        return None


async def save_study_material_from_suggestion(
    db: AsyncSession,
    topic: str,
    suggestion: Union[SuggestionItem, dict]
):
    try:
        if isinstance(suggestion, dict):
            material = suggestion.get("material", [])
            youtube_videos = suggestion.get("youtube_query", "")
        else:
            material = suggestion.material if isinstance(suggestion.material, list) else []
            youtube_videos = suggestion.youtube_query or ""

        youtube_videos = (
            [{"title": f"YouTube for {topic}", "url": youtube_videos}]
            if youtube_videos else []
        )

        return await save_study_material(db, topic, material, youtube_videos)

    except Exception as e:
        logger.exception(f"Failed to save study material for topic: {topic} — {e}")
        return None



async def create_student_detail(db: AsyncSession, detail: StudentDetailsCreate):
    try:
        student = StudentDetails(**detail.dict())
        db.add(student)
        await db.commit()
        await db.refresh(student)
        return student
    except Exception as e:
        await db.rollback()
        logger.exception(f"Failed to save student detail for {detail.register_number}", exc_info=e)
        return None
