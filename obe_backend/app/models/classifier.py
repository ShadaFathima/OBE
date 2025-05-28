import joblib
import os

MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'models', 'student_performance_model.pkl'))
LABEL_ENCODER_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'models', 'label_encoder.pkl'))

def load_model():
    return joblib.load(MODEL_PATH)

def load_label_encoder():
    return joblib.load(LABEL_ENCODER_PATH)

def predict_student_category(model, label_encoder, X):
    features = model.feature_names_in_
    X_ordered = X[features]
    y_pred_encoded = model.predict(X_ordered)
    y_pred_labels = label_encoder.inverse_transform(y_pred_encoded)
    return y_pred_labels
