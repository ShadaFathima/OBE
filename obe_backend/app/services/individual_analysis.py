from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.db import get_db
from app.services.analysis import analyze_individual_entry
from app.services.crud import get_question_to_co_and_definitions
from app.models.schemas import (
    IndividualInputSchema,
    StudentDetailsCreate,
    StudentResultCreate,
    SuggestionItem,
)
from app.services.crud import (
    create_student_result,
    create_student_detail,
    save_study_material,
)
from app.services.class_analysis import compute_and_save_class_performance
from app.services.improvement import get_combined_study_material
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/analyze_individual/")
async def analyze_individual(
    data: IndividualInputSchema, db: AsyncSession = Depends(get_db)
) -> dict:
    try:
        course_type = data.course_type

        # Get CO mappings and definitions
        question_to_co, co_definitions = await get_question_to_co_and_definitions(
            db, data.course, data.exam
        )

        # Analyze student entry
        result_df = analyze_individual_entry(data, question_to_co, co_definitions, course_type)

        if result_df.empty:
            raise HTTPException(status_code=400, detail="No data processed")

        await compute_and_save_class_performance(result_df, db)

        performance_counts = result_df["Performance"].value_counts().to_dict()
        students_result = []

        for _, row in result_df.iterrows():
            reg_no = row["Register Number"]
            performance = row["Performance"]
            percentage = row["Percentage"]
            exam = row["Exam"]
            course = row["Course"]

            weak_cos = [
                co for co in row.index
                if co.startswith("CO") and not co.endswith(("acquired", "max")) and row[co] < 60
            ]

            # Clean CO definitions
            clean_co_definitions = {}
            for co, defn in co_definitions.items():
                try:
                    if isinstance(defn, str):
                        clean_co_definitions[co] = defn.strip()
                    elif isinstance(defn, (int, float)):
                        clean_co_definitions[co] = str(defn)
                    elif isinstance(defn, list):
                        clean_co_definitions[co] = " ".join(
                            str(x).strip() for x in defn if isinstance(x, (str, int, float))
                        )
                except Exception as e:
                    logger.error(f"Error cleaning CO definition for {co}: {e}")

            # Fetch study material per weak CO
            suggestions = []
            for co in weak_cos:
                topic = clean_co_definitions.get(co, "")
                material = await get_combined_study_material(topic, db)
                suggestions.append({
                    "co": co,
                    "definition": topic,
                    "material": material.get("web_summaries", []) if material else [],
                    "youtube_videos": material.get("youtube_videos", []) if material else [],
                })

            # Convert marks keys (Q1 → q1)
            formatted_marks = {k.lower(): v for k, v in data.marks.items()}

            detail_data = StudentDetailsCreate(
                register_number=reg_no,
                exam=exam,
                course=course,
                **formatted_marks,
                **{col.lower(): row[col] for col in row.index if col.startswith("CO")}
            )

            await create_student_detail(db, detail_data)

            def normalize_suggestion(sugg: dict) -> dict:
                material = sugg.get("material", [])
                if isinstance(material, str):
                    material = [material]
                youtube_videos = sugg.get("youtube_videos", [])
                if isinstance(youtube_videos, str):
                    youtube_videos = [{"title": "YouTube", "url": youtube_videos}]
                elif isinstance(youtube_videos, list):
                    youtube_videos = [
                        {"title": "YouTube", "url": y} if isinstance(y, str) else y for y in youtube_videos
                    ]
                else:
                    youtube_videos = []
                return {
                    "co": sugg.get("co", ""),
                    "definition": sugg.get("definition", ""),
                    "material": material,
                    "youtube_videos": youtube_videos,
                }

            suggestions_dict = {
                s["co"]: SuggestionItem(**normalize_suggestion(s))
                for s in suggestions
            }

            for co, suggestion in suggestions_dict.items():
                topic = clean_co_definitions.get(co, "")
                try:
                    await save_study_material(
                        db=db,
                        topic=topic,
                        web_summaries=[
                            {"title": f"Summary {i+1}", "link": m} for i, m in enumerate(suggestion.material)
                        ],
                        youtube_videos=suggestion.youtube_videos
                    )
                except Exception as e:
                    logger.warning(f"Failed to save study material for CO {co}: {e}")

            await create_student_result(db, StudentResultCreate(
                register_number=reg_no,
                exam=exam,
                course=course,
                performance=performance,
                percentage=round(percentage, 2),
                weak_cos=weak_cos,
                suggestions={co: s.dict() for co, s in suggestions_dict.items()}
            ))

            students_result.append({
                "register_number": reg_no,
                "performance": performance,
                "percentage": round(percentage, 2),
                "weak_cos": weak_cos,
                "improvements": [s.dict() for s in suggestions_dict.values()]
            })

        return {
            "students": students_result,
            "predicted_distribution": performance_counts,
            "co_definitions_received": co_definitions,
        }

    except Exception as e:
        logger.exception("Error in /analyze_individual/")
        raise HTTPException(status_code=500, detail=str(e))
