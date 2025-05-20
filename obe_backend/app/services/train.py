import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
from fastapi import APIRouter, UploadFile, File
import os
from app.models.classifier import load_model, predict_student_category

MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'models', 'student_performance_model.pkl'))

def train_model(train_csv_path='app/data/train.csv'):
    df = pd.read_csv(train_csv_path)

    X = df[[col for col in df.columns if col.startswith('CO')]]
    y = df['Performance']

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    print(classification_report(y_test, y_pred))
    # ✅ Ensure 'models/' directory exists
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

    # Save the trained model
    joblib.dump(model, MODEL_PATH)

    print(f"Model trained and saved at {MODEL_PATH}")

def train_model_from_dataframe(df: pd.DataFrame):
    X = df[[col for col in df.columns if col.startswith('CO')]]
    y = df['Performance']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    # ✅ Ensure 'models/' directory exists
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

    joblib.dump(model, MODEL_PATH)

    return {
        "train_samples": len(df),
        "classification_report": classification_report(y_test, y_pred, output_dict=True)
    }