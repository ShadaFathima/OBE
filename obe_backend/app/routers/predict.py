from fastapi import APIRouter, UploadFile, File, Depends, Form, HTTPException
from typing import Optional
from io import BytesIO
import pandas as pd
import json
import asyncio
import logging

from sqlalchemy.ext.asyncio import AsyncSession
from app.auth import require_role, UserRole
from app.services.db import get_db
from app.services.analysis import preprocess, add_model_predictions, get_weak_cos
from app.services.improvement import suggest_improvement_strategy
from app.services import crud
from app.models.schemas import StudentResultCreate, StudentResultOut, SuggestionItem

router = APIRouter()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/analyze/")
async def analyze_and_predict(
    file: UploadFile = File(...),
    co_mapping_json: str = Form(...),
    co_definitions_json: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(UserRole.student, UserRole.teacher, UserRole.admin))
):
    contents = await file.read()
    df = pd.read_excel(BytesIO(contents))

    # Parse CO mapping and definitions
    question_to_co = json.loads(co_mapping_json)
    co_definitions = json.loads(co_definitions_json) if co_definitions_json else {}

    # Preprocess and predict
    processed_df = preprocess(df, question_to_co)
    processed_df = add_model_predictions(processed_df)

    # Ensure definitions for all COs
    for co in processed_df.columns:
        if co.startswith("CO") and co != "CO_Avg" and co not in co_definitions:
            co_definitions[co] = "Definition not provided"

    weak_cos = get_weak_cos(processed_df)
    feedback_list = []

    for _, row in processed_df.iterrows():
        reg_no = row["Register Number"]
        performance = row["Performance"]
        percentage = row.get("Percentage", 0)
        weak = weak_cos.get(reg_no, [])

        feedback = {
            "register_number": reg_no,
            "performance": performance,
            "percentage": percentage,
            "weak_cos": weak,
            "recommendations": []
        }

        # Fetch study materials (check cache/db or scrape)
        reco_tasks = [suggest_improvement_strategy(co, co_definitions.get(co)) for co in weak]
        reco_results = await asyncio.gather(*reco_tasks)

        suggestions = {}
        for co, reco in zip(weak, reco_results):
            definition = co_definitions.get(co, "N/A")
            material = reco.get("material", [])
            youtube_query = reco.get("youtube_query")

            # Save into suggestions dict for DB
            suggestions[co] = SuggestionItem(
                co=co,
                definition=definition,
                material=material,
                youtube_query=youtube_query
            )

            # Add to feedback for API response
            feedback["recommendations"].append({
                "co": co,
                "definition": definition,
                "material": material,
                "youtube_query": youtube_query
            })

        # Save student result in DB
        result = StudentResultCreate(
            register_number=reg_no,
            performance=performance,
            weak_cos=weak,
            suggestions=suggestions
        )
        await crud.create_student_result(db, result)
        feedback_list.append(feedback)

    # Class-level CO averages
    try:
        df["Question"] = df["QN.NO"].astype(str).str.extract(r'(\d+)').astype(float)
        df["Question"] = df["Question"].dropna().astype(int)
        df["CO"] = df["Question"].map(lambda q: question_to_co.get(str(q)) or question_to_co.get(int(q)))
        df["CO_Label"] = df["CO"].map(lambda co: co_definitions.get(co, co))
        co_avg = df.dropna(subset=["CO_Label", "Mark"]).groupby("CO_Label")["Mark"].mean().reset_index()
    except Exception as e:
        logger.warning(f"CO average calculation failed: {e}")
        co_avg = pd.DataFrame(columns=["CO_Label", "Mark"])

    return {
        "student_analysis": feedback_list,
        "class_co_averages": co_avg.to_dict(orient="records")
    }


@router.get("/students/{register_number}", response_model=StudentResultOut)
async def get_student_history(
    register_number: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(UserRole.teacher, UserRole.admin))
):
    result = await crud.get_student_result_by_regno(db, register_number)
    if not result:
        raise HTTPException(status_code=404, detail="Student result not found")
    return result
