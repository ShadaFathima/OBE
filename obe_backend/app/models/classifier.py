import os
import joblib

# ✅ Fix path to match where model is saved
MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'models', 'student_performance_model.pkl'))

def load_model():
    return joblib.load(MODEL_PATH)

def predict_student_category(model, X):
    model_features = model.feature_names_in_  # works if model was trained with a DataFrame
    return model.predict(X[model_features])
