from fastapi import APIRouter, UploadFile, File, Depends, Form
from typing import Optional
from io import BytesIO
import pandas as pd
import json
import asyncio
import logging
from fastapi import HTTPException
from app.models.classifier import load_model, load_label_encoder
from app.services.analysis import preprocess, add_model_predictions, get_weak_cos
from app.services.improvement import suggest_improvement_strategy
from app.auth import require_role, UserRole
from app.services.db import save_student_analysis, fetch_student_history

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/analyze/")
async def analyze_and_predict(
    file: UploadFile = File(...),
    co_mapping_json: str = Form(...),
    co_definitions_json: Optional[str] = Form(None),
    user=Depends(require_role(UserRole.student, UserRole.teacher, UserRole.admin))
):
    contents = await file.read()
    df = pd.read_excel(BytesIO(contents))

    # Parse CO mapping and definitions
    question_to_co = json.loads(co_mapping_json)
    co_definitions = json.loads(co_definitions_json) if co_definitions_json else {}

    # Preprocess using the unified function
    processed_df = preprocess(df, question_to_co)

    # Add predictions
    processed_df = add_model_predictions(processed_df)

    # Ensure CO definitions for all present COs
    for co in processed_df.columns:
        if co.startswith("CO") and co != "CO_Avg" and co not in co_definitions:
            co_definitions[co] = "Definition not provided"

    # Identify weak COs
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

        # Recommend improvements for weak COs
        tasks = [suggest_improvement_strategy(co, co_definitions.get(co)) for co in weak]
        reco_results = await asyncio.gather(*tasks)

        for co, reco in zip(weak, reco_results):
            feedback["recommendations"].append({
                "co": co,
                "definition": co_definitions.get(co, "N/A"),
                **reco
            })

        await save_student_analysis(reg_no, feedback)
        feedback_list.append(feedback)

    # Compute class-level CO average for visualization
    try:
        df["Question"] = df["QN.NO"].astype(str).str.extract(r'(\d+)').astype(float)
        df["Question"] = df["Question"].dropna().astype(int)
        df["CO"] = df["Question"].map(lambda q: question_to_co.get(str(q)) or question_to_co.get(int(q)))
        df["CO_Label"] = df["CO"].map(lambda co: co_definitions.get(co, co))
        co_avg = df.dropna(subset=["CO_Label", "Mark"]).groupby("CO_Label")["Mark"].mean().reset_index()
    except Exception:
        co_avg = pd.DataFrame(columns=["CO_Label", "Mark"])

    return {
        "student_analysis": feedback_list,
        "class_co_averages": co_avg.to_dict(orient="records")
    }

@router.get("/students/{reg_no}")
async def get_student_history(
    reg_no: str,
    user=Depends(require_role(UserRole.teacher, UserRole.admin))
):
    return fetch_student_history(reg_no)
