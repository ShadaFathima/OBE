from fastapi import HTTPException, APIRouter, UploadFile, Form
from typing import Optional
import pandas as pd
import json
import logging
import asyncio
from io import BytesIO
from app.services.analysis import preprocess, add_model_predictions, get_weak_cos
from app.services.improvement import suggest_improvement_strategy
from app.auth import require_role, UserRole

# Setup logger with format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/upload/")
async def upload_excel(
    file: UploadFile,
    co_mapping_json: Optional[str] = Form(None),
    co_definitions_json: Optional[str] = Form(None)
) -> dict:
    try:
        # Step 1: Validate file
        filename = file.filename.strip()
        content_type = file.content_type
        logger.info(f"Received file: {filename} | Content-Type: {content_type}")

        if not filename.endswith(".xlsx"):
            raise HTTPException(status_code=400, detail="Only .xlsx Excel files are supported.")

        # Step 2: Read Excel file into DataFrame
        contents = await file.read()
        try:
            df = pd.read_excel(BytesIO(contents), engine='openpyxl')
            logger.info(f"Excel DataFrame loaded: shape={df.shape}, columns={df.columns.tolist()}")
        except Exception:
            logger.exception("Error reading Excel file")
            raise HTTPException(status_code=400, detail="Failed to read Excel file. Ensure it is a valid .xlsx file.")

        if df.empty:
            logger.warning("Uploaded DataFrame is empty.")
            raise HTTPException(status_code=400, detail="Uploaded file is empty or does not contain valid data.")

        # Step 3: Parse CO mapping JSON
        if not co_mapping_json:
            raise HTTPException(status_code=400, detail="CO mapping JSON is required.")

        try:
            question_to_co = json.loads(co_mapping_json)
            if not isinstance(question_to_co, dict) or not question_to_co:
                raise ValueError("CO mapping JSON must be a non-empty dictionary.")
            logger.info(f"CO Mapping JSON parsed successfully.")
        except Exception:
            logger.exception("Invalid CO mapping JSON.")
            raise HTTPException(status_code=400, detail="Invalid or empty CO mapping JSON.")

        # Step 4: Parse CO definitions JSON (optional)
        try:
            co_definitions = json.loads(co_definitions_json) if co_definitions_json else {}
            logger.info(f"CO Definitions JSON parsed.")
        except json.JSONDecodeError as e:
            logger.exception("Invalid CO definitions JSON.")
            raise HTTPException(status_code=400, detail=f"Invalid CO definitions JSON: {str(e)}")

        # Step 5: Preprocess the uploaded data
        try:
            pivot_df = preprocess(df, question_to_co)
            logger.info(f"After preprocessing: shape={pivot_df.shape}, columns={pivot_df.columns.tolist()}")
        except Exception:
            logger.exception("Data preprocessing failed.")
            raise HTTPException(status_code=400, detail="Data preprocessing failed. Check uploaded data and CO mapping.")

        # Step 6: Run model prediction
        pivot_df = add_model_predictions(pivot_df)
        perf_counts = pivot_df['Performance'].value_counts().to_dict() if 'Performance' in pivot_df else {}
        logger.info(f"Model prediction completed. Performance distribution: {perf_counts}")

        # Step 7: Identify weak COs per student
        weak_cos_map = get_weak_cos(pivot_df)
        logger.info(f"Weak COs detected for {len(weak_cos_map)} students.")

        # Step 8: Generate improvement suggestions asynchronously
        improvement_suggestions = {}
        for reg_no, weak_cos in weak_cos_map.items():
            improvement_suggestions[reg_no] = []
            coroutines = [
                suggest_improvement_strategy(co, co_definitions.get(co, "Definition not available"))
                for co in weak_cos
            ]
            try:
                suggestions = await asyncio.gather(*coroutines)
                improvement_suggestions[reg_no].extend(suggestions)
                logger.info(f"Suggestions generated for {reg_no}.")
            except Exception:
                logger.exception(f"Error generating suggestions for {reg_no}.")

        # Step 9: Prepare final response data
        students_result = []
        unique_students = pivot_df.drop_duplicates(subset=['Register Number'])

        for _, row in unique_students.iterrows():
            reg_no = row.get('Register Number')
            performance = row.get("Performance", "Unknown")
            percentage = row.get("Percentage", 0)

            result = {
                "register_number": reg_no,
                "performance": performance,
                "percentage": round(percentage, 2),
                "weak_cos": weak_cos_map.get(reg_no, []),
                "improvements": improvement_suggestions.get(reg_no, [])
            }
            students_result.append(result)

        students_result.sort(key=lambda x: x["register_number"])

        final_response = {
            "filename": filename,
            "rows": len(df),
            "predicted_distribution": perf_counts,
            "students": students_result,
            "co_definitions_received": co_definitions
        }

        logger.info(f"Final API response prepared with {len(students_result)} student results.")
        return final_response

    except HTTPException:
        raise
    except Exception:
        logger.exception("Unexpected server error.")
        raise HTTPException(status_code=500, detail="Internal server error occurred.")
