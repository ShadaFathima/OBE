from fastapi import APIRouter, UploadFile, File, Depends
import pandas as pd
from io import BytesIO
from app.models.classifier import load_model, predict_student_category
from app.services.analysis import preprocess_excel, create_performance_labels, get_weak_cos
from app.utils.co_mapping import co_definitions, question_to_co
from app.services.materials import get_combined_study_material
from app.services.improvement import suggest_improvement_strategy
from app.auth import require_role, UserRole  # Import your auth roles and dependency

router = APIRouter()

@router.post("/analyze/")
async def analyze_and_predict(
    file: UploadFile = File(...),
    user=Depends(require_role(UserRole.student, UserRole.teacher, UserRole.admin))  # Roles allowed to access:
):
    contents = await file.read()
    df = pd.read_excel(BytesIO(contents))

    # Step 1: Preprocess
    pivot_df = preprocess_excel(df)

    # Step 2: Label performance categories (for training or backup logic)
    labeled_df = create_performance_labels(pivot_df)

    # Step 3: Load model & predict
    model = load_model()
    X = pivot_df.drop(columns=["Register Number"], errors="ignore")
    predictions = predict_student_category(model, X)
    labeled_df["Performance"] = predictions

    # Step 4: Identify weak COs
    weak_cos = get_weak_cos(labeled_df)

    # Step 5: Generate feedback & recommendations
    feedback_list = []

    for _, row in labeled_df.iterrows():
        register_number = row["Register Number"]
        performance = row["Performance"]
        weak = weak_cos.get(register_number, [])

        feedback = {
            "register_number": register_number,
            "performance": performance,
            "weak_cos": weak,
            "recommendations": []
        }

        for co in weak:
            # Fetch materials for the CO
            materials = get_combined_study_material(co)

            reco = {
                "co": co,
                "definition": co_definitions.get(co, "N/A"),
                "strategy": suggest_improvement_strategy(co),
                "resources": [
                    f"https://www.geeksforgeeks.org/tag/{co.lower()}/",
                    f"https://www.geeksforgeeks.org/search/?q={co_definitions.get(co, '').replace(' ', '+')}"
                ],
                "materials": materials  # add the fetched materials here
            }
            feedback["recommendations"].append(reco)

        feedback_list.append(feedback)

    # Step 6: Class-level CO average
    class_avg_df = df.copy()
    class_avg_df["CO"] = class_avg_df["QN.NO"].map(lambda q: co_definitions.get(question_to_co.get(q, ""), ""))
    co_avg = class_avg_df.groupby("CO")["Mark"].mean().reset_index()

    return {
        "student_analysis": feedback_list,
        "class_co_averages": co_avg.to_dict(orient="records")
    }
