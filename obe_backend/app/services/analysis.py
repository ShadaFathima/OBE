import pandas as pd
import logging
from app.models.classifier import load_model, load_label_encoder, predict_student_category

MODEL = load_model()
LABEL_ENCODER = load_label_encoder()
DEFAULT_CATEGORY = "Average"

def preprocess(df, question_to_co):
    required_cols = ['Exam', 'Course', 'Register Number', 'QN.NO', 'Mark']
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required columns: {missing_cols}")

    # Fill forward for metadata columns
    df[['Exam', 'Course', 'Register Number']] = df[['Exam', 'Course', 'Register Number']].ffill()

    # Normalize question column
    df = df.rename(columns={'QN.NO': 'Question'})
    df['Question'] = df['Question'].astype(str).str.extract(r'(\d+)')  # extract numeric part
    df['Question'] = pd.to_numeric(df['Question'], errors='coerce')
    df = df.dropna(subset=['Question', 'Mark'])

    df['Question'] = df['Question'].astype(int)
    df['Mark'] = pd.to_numeric(df['Mark'], errors='coerce')

    # Debug: show unique questions before mapping
    print("Unique questions in Excel:", df['Question'].unique())
    print("Keys in CO mapping:", list(question_to_co.keys()))

    # Map questions to COs using keys like 'Q1', 'Q2', ...
    df['CO'] = df['Question'].map(lambda q: question_to_co.get(f'Q{q}'))
    df = df.dropna(subset=['CO'])

    if df.empty:
        raise ValueError("After CO mapping, no rows remain. Check CO mapping or data preprocessing logic.")

    df['CO'] = df['CO'].astype(str)

    # Pivot to wide format: rows = students, columns = questions
    question_pivot = df.pivot_table(index='Register Number', columns='Question', values='Mark', aggfunc='first')
    question_pivot.columns = [str(col) for col in question_pivot.columns]

    # Reattach metadata
    meta = df.groupby('Register Number')[['Exam', 'Course']].first().reset_index()
    question_pivot = question_pivot.reset_index().merge(meta, on='Register Number', how='left')

    # Sort question columns
    q_cols_sorted = sorted([col for col in question_pivot.columns if col.isdigit()], key=lambda x: int(x))
    question_pivot = question_pivot[['Register Number', 'Exam', 'Course'] + q_cols_sorted]

    # Build CO to question mapping dict: co_marks = {CO: [question_numbers]}
    co_marks = {}
    for q, co in question_to_co.items():
        try:
            q_int = int(q[1:]) if str(q).startswith('Q') else int(q)
            co_marks.setdefault(co, []).append(str(q_int))
        except ValueError:
            continue

    # Debug print of CO to questions mapping
    print("\nCO to question mapping:")
    for co, q_list in co_marks.items():
        print(f"{co}: {q_list}")

    # Calculate mean marks per CO (important change: mean instead of sum)
    for co, q_list in co_marks.items():
        valid_qs = [q for q in q_list if q in question_pivot.columns]
        if not valid_qs:
            print(f"[WARN] No valid questions found for CO {co} from {q_list}")
            question_pivot[co] = 0
        else:
            question_pivot[co] = question_pivot[valid_qs].mean(axis=1)

    co_columns = [co for co in co_marks if co in question_pivot.columns]

    # === DEBUGGING AND FIX FOR CO_Avg and CO_Max ===
    # Make sure CO columns are numeric to avoid hidden string/NaN problems
    for co in co_columns:
        question_pivot[co] = pd.to_numeric(question_pivot[co], errors='coerce').fillna(0)

    print("\nData types of CO columns:")
    print(question_pivot[co_columns].dtypes)

    print("\nSample CO marks per student before CO_Avg and CO_Max calculation:")
    print(question_pivot[['Register Number'] + co_columns].head())

    # Calculate mean marks per CO (CO_Avg)
    question_pivot['CO_Avg'] = question_pivot[co_columns].mean(axis=1) if co_columns else 0

    # Calculate max marks per CO (CO_Max)
    if co_columns:
        question_pivot['CO_Max'] = question_pivot[co_columns].max(axis=1)
    else:
        question_pivot['CO_Max'] = 0

    print("\nCO_Avg and CO_Max per student:")
    print(question_pivot[['Register Number', 'CO_Avg', 'CO_Max']].head())
    # ===================================================

    # Debug print final CO marks per student
    print("\nFinal CO marks per student (with CO_Max):")
    print(question_pivot[['Register Number'] + co_columns + ['CO_Avg', 'CO_Max']])

    return question_pivot


def add_model_predictions(df: pd.DataFrame, model=None, label_encoder=None) -> pd.DataFrame:
    if model is None:
        model = MODEL
    if label_encoder is None:
        label_encoder = LABEL_ENCODER

    model_features = getattr(model, 'feature_names_in_', None)
    if model_features is None:
        raise AttributeError("Model missing 'feature_names_in_' attribute.")

    # Ensure all expected CO features exist in DataFrame
    for co in model_features:
        if co not in df.columns:
            df[co] = 0

    try:
        X = df[model_features]
        print("Model input features preview:")
        print(X.head())

        y_pred_labels = predict_student_category(model, label_encoder, X)
        df['Performance'] = y_pred_labels
    except Exception as e:
        logging.error(f"Error during model prediction: {e}", exc_info=True)
        df['Performance'] = DEFAULT_CATEGORY

    # Percentage calculation of student marks based on co_avg
    df['Percentage'] = 0
    if 'CO_Avg' in df.columns and 'CO_Max' in df.columns:
        # Avoid division by zero
        df.loc[df['CO_Max'] != 0, 'Percentage'] = (df['CO_Avg'] / df['CO_Max']) * 100
    return df


def get_weak_cos(df: pd.DataFrame, threshold: float = 3) -> dict:
    co_cols = [col for col in df.columns if col.startswith('CO') and col not in ('CO_Avg', 'CO_Max')]
    weak_cos = {}

    for _, row in df.iterrows():
        reg = row.get('Register Number')
        # Select COs with marks less than or equal to threshold
        weak_cos[reg] = [co for co in co_cols if row.get(co, 0) <= threshold]

    return weak_cos

