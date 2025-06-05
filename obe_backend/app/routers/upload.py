# app/routers/upload.py

from fastapi import HTTPException, APIRouter, UploadFile, Depends
import pandas as pd
import logging
import asyncio
from io import BytesIO
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.analysis import preprocess, add_model_predictions, get_weak_cos
from app.services.improvement import suggest_improvement_strategy
from app.services.crud import create_student_result, save_study_material
from app.models.schemas import StudentResultCreate, SuggestionItem
from app.services.db import get_db
from app.models.schemas import StudentDetailsCreate
from app.services.crud import create_student_detail
from app.services.class_analysis import compute_and_save_class_performance


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/upload/")
async def upload_excel(
    file: UploadFile,
    db: AsyncSession = Depends(get_db)
) -> dict:
    try:
        filename = file.filename.strip()
        if not filename.endswith(".xlsx"):
            raise HTTPException(status_code=400, detail="Only .xlsx Excel files are supported.")

        contents = await file.read()

        try:
            xls = pd.ExcelFile(BytesIO(contents), engine='openpyxl')
        except Exception:
            logger.exception("Failed to open Excel file")
            raise HTTPException(status_code=400, detail="Failed to read Excel file. Ensure it's valid.")

        required_sheets = ["marks", "CO_Mapping", "CO_Definition"]
        for sheet in required_sheets:
            if sheet not in xls.sheet_names:
                raise HTTPException(status_code=400, detail=f"Excel file missing required sheet: '{sheet}'")

        df_marks = pd.read_excel(xls, sheet_name="marks")
        df_co_mapping = pd.read_excel(xls, sheet_name="CO_Mapping")
        df_co_definitions = pd.read_excel(xls, sheet_name="CO_Definition")

        if df_marks.empty:
            raise HTTPException(status_code=400, detail="Marks sheet (marks) is empty.")

        question_to_co = {
            str(row["QN.NO"]).strip(): str(row["CO"]).strip()
            for _, row in df_co_mapping.iterrows()
            if row.get("QN.NO") and row.get("CO")
        }

        co_definitions = {
            str(row["CO"]).strip(): str(row["Definition"]).strip()
            for _, row in df_co_definitions.iterrows()
            if row.get("CO") and row.get("Definition")
        }

        logger.info(f"Excel loaded: marks={df_marks.shape}, CO Mapping={len(question_to_co)}, CO Definitions={len(co_definitions)}")

        pivot_df = preprocess(df_marks, question_to_co)

        for _, row in pivot_df.iterrows():
            try:
                detail_data = StudentDetailsCreate(
                    register_number=row["Register Number"],
                    exam=row["Exam"],
                    course=row["Course"],
                    **{f"q{col}": row[col] for col in row.index if col.isdigit()},
                    **{col.lower(): row[col] for col in row.index if col.startswith("CO")}
                )
                await create_student_detail(db, detail_data)
            except Exception as e:
                logger.warning(f"Failed to save student detail for {row['Register Number']}: {e}")




        pivot_df = add_model_predictions(pivot_df)
        print(pivot_df.head())
        await compute_and_save_class_performance(pivot_df, db)
        perf_counts = pivot_df['Performance'].value_counts().to_dict() if 'Performance' in pivot_df else {}

        weak_cos_map = get_weak_cos(pivot_df)

        improvement_suggestions = {}
        for reg_no, weak_cos in weak_cos_map.items():
            coroutines = [
                suggest_improvement_strategy(co, co_definitions.get(co, "Definition not available"), db)
                for co in weak_cos
            ]
            try:
                suggestions = await asyncio.gather(*coroutines)
                improvement_suggestions[reg_no] = suggestions
            except Exception:
                logger.exception(f"Error generating suggestions for {reg_no}")
                improvement_suggestions[reg_no] = []

        students_result = []
        unique_students = pivot_df.drop_duplicates(subset=['Register Number'])

        for _, row in unique_students.iterrows():
            reg_no = row.get('Register Number')
            performance = row.get("Performance", "Unknown")
            percentage = row.get("Percentage", 0.0)
            weak_cos = weak_cos_map.get(reg_no, [])
            imp_list = improvement_suggestions.get(reg_no, [])

            result = {
                "register_number": reg_no,
                "performance": performance,
                "percentage": round(percentage, 2),
                "weak_cos": weak_cos,
                "improvements": imp_list
            }

            try:
                # Normalize SuggestionItem from dict or raw response
                def fill_missing_keys(sugg: dict) -> dict:
                    material = sugg.get("material", [])
                    if isinstance(material, str):
                        material = [material]

                    youtube_videos = sugg.get("youtube_videos", [])
                    if isinstance(youtube_videos, str):
                        youtube_videos = [{"title": "YouTube", "url": youtube_videos}]
                    elif isinstance(youtube_videos, list):
                        fixed = []
                        for y in youtube_videos:
                            if isinstance(y, str):
                                fixed.append({"title": "YouTube", "url": y})
                            elif isinstance(y, dict):
                                fixed.append(y)
                        youtube_videos = fixed
                    else:
                        youtube_videos = []

                    return {
                        "co": sugg.get("co", ""),
                        "definition": sugg.get("definition", ""),
                        "material": material,
                        "youtube_videos": youtube_videos
                    }

                suggestions_dict = {
                    co: SuggestionItem(**fill_missing_keys(imp))
                    for co, imp in zip(weak_cos, imp_list)
                }

                for co, suggestion in suggestions_dict.items():
                    try:
                        topic = co_definitions.get(co, "")
                        material = suggestion.material
                        youtube_videos = suggestion.youtube_videos

                        await save_study_material(
                            db=db,
                            topic=topic,
                            web_summaries=[
                                {"title": f"Summary {i+1}", "link": str(m)}
                                for i, m in enumerate(material)
                                if isinstance(m, str)
                            ],
                            youtube_videos=youtube_videos
                        )
                    except Exception as e:
                        logger.warning(f"Failed to save study material for CO {co}: {e}")

                suggestions_dict_for_db = {
                    co: suggestion.dict() for co, suggestion in suggestions_dict.items()
                }


                await create_student_result(db, StudentResultCreate(
                    register_number=reg_no,
                    performance=performance,
                    weak_cos=weak_cos,
                    suggestions=suggestions_dict_for_db
                ))

                logger.info(f"Saved student result for {reg_no} to database.")
            except Exception as e:
                logger.exception(f"Failed to save student result for {reg_no}: {e}")

            students_result.append(result)

        students_result.sort(key=lambda x: x["register_number"])

        return {
            "filename": filename,
            "rows": len(df_marks),
            "predicted_distribution": perf_counts,
            "students": students_result,
            "co_definitions_received": co_definitions
        }

    except HTTPException:
        raise
    except Exception:
        logger.exception("Unexpected server error")
        raise HTTPException(status_code=500, detail="Internal server error occurred.")
