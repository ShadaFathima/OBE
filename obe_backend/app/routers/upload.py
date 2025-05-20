from fastapi import APIRouter, UploadFile
import pandas as pd
from io import BytesIO
from app.services.analysis import preprocess_excel, create_performance_labels
from app.services.train import train_model_from_dataframe

router = APIRouter()

@router.get("/upload/")
async def upload_instructions():
    return {"message": "Use POST with a file to upload Excel data."}

@router.post("/upload/")
async def upload_excel(file: UploadFile):
    contents = await file.read()
    df = pd.read_excel(BytesIO(contents))
     # Preprocess uploaded data
    pivot_df = preprocess_excel(df)
    # Save the preprocessed data to a CSV file      
    # Create performance labels
    labeled_df = create_performance_labels(pivot_df)

    # Train the model with this labeled data
    train_info = train_model_from_dataframe(labeled_df)

    return {
        "filename": file.filename,
        "rows": len(df),
        "performance_distribution": labeled_df['Performance'].value_counts().to_dict(),
        "training_summary": train_info,
    }  # Use BytesIO to avoid warning

   
