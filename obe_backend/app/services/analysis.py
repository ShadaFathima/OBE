# app/services/analysis.py

import pandas as pd
import logging 
from app.models.schemas import IndividualInputSchema  # Import this if not already

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

    # Detect total number of questions
    total_questions = df['Question'].nunique()
    logging.info(f"Detected total unique questions: {total_questions}")

    # Dynamic mark allocation
    def get_max_mark(q):
        if total_questions == 20:
            if 1 <= q <= 10:
                return 3
            elif 11 <= q <= 18:
                return 6
            elif 19 <= q <= 20:
                return 10
        elif total_questions == 17:
            if 1 <= q <= 10:
                return 2
            elif 11 <= q <= 15:
                return 6
            elif 16 <= q <= 17:
                return 10
        return 0

    df['MaxMark'] = df['Question'].apply(get_max_mark)

    # Map questions to COs
    df['CO'] = df['Question'].map(lambda q: question_to_co.get(f'Q{q}'))
    df = df.dropna(subset=['CO'])
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

    # Calculate acquired and max marks per CO
    co_acquired_df = df.groupby(['Register Number', 'CO'])['Mark'].sum().unstack(fill_value=0)
    co_max_df = df.groupby(['Register Number', 'CO'])['MaxMark'].sum().unstack(fill_value=0)

    co_acquired_df.columns = [f'{col}_acquired' for col in co_acquired_df.columns]
    co_max_df.columns = [f'{col}_max' for col in co_max_df.columns]

    # Merge into pivot
    question_pivot = question_pivot.merge(co_acquired_df, on='Register Number', how='left')
    question_pivot = question_pivot.merge(co_max_df, on='Register Number', how='left')

    # Extract COs
    co_columns = [col.replace('_acquired', '') for col in co_acquired_df.columns]

    # Calculate CO percentage per student
    for co in co_columns:
        acquired_col = f'{co}_acquired'
        max_col = f'{co}_max'
        question_pivot[co] = (question_pivot[acquired_col] / question_pivot[max_col].replace(0, 1)) * 100

    # Calculate CO_Avg (avg of all CO percentages) and CO_Max (total max marks across COs)
    question_pivot['CO_Avg'] = question_pivot[co_columns].mean(axis=1)
    question_pivot['CO_Max'] = question_pivot[[f'{co}_max' for co in co_columns]].sum(axis=1)

    print("\nFinal CO percentage per student:")
    print(question_pivot[['Register Number'] + co_columns + ['CO_Avg', 'CO_Max']].head())

    return question_pivot

def add_model_predictions(df: pd.DataFrame) -> pd.DataFrame:
    def rule_based_category(co_avg):
        if co_avg >= 90:
            return 'Excellent'
        elif co_avg >= 75:
            return 'Good'
        elif co_avg >= 55:
            return 'Average'
        else:
            return 'At-Risk'

    df['CO_Avg'] = df.get('CO_Avg', 0.0)
    df['Performance'] = df['CO_Avg'].apply(rule_based_category)
    df['Percentage'] = df['CO_Avg']
    return df

def get_weak_cos(df: pd.DataFrame, threshold: float = 65.0) -> dict:    
    co_cols = [
        col for col in df.columns
        if col.startswith('CO') and not col.endswith(('_avg', '_max', '_acquired', '_Max', '_Avg'))
    ]
    weak_cos = {}
    for _, row in df.iterrows():
        reg = row.get('Register Number')
        weak_cos[reg] = [
            co for co in co_cols 
            if pd.notnull(row.get(co)) and row.get(co) < threshold
        ]
    return weak_cos


def analyze_individual_entry(entry, question_to_co: dict, co_definitions: dict, course_type: str) -> pd.DataFrame:
    register_number = entry.register_number
    exam = entry.exam
    course = entry.course
    marks_dict = entry.marks

    if not all([register_number, exam, course, marks_dict]):
        raise ValueError("Missing required student entry fields")

    records = []
    print("DEBUG: question_to_co =", question_to_co)
    print("DEBUG: marks_dict =", marks_dict)

    for q_str, mark in marks_dict.items():
        try:
            q_no = int(q_str.strip("qQ"))
            co = question_to_co.get(f"Q{q_no}")
            if co is None:
                continue

            if course_type == "Major":
                if 1 <= q_no <= 10:
                    max_mark = 3
                elif 11 <= q_no <= 18:
                    max_mark = 6
                elif 19 <= q_no <= 20:
                    max_mark = 10
                else:
                    max_mark = 0
            elif course_type == "Minor":
                if 1 <= q_no <= 10:
                    max_mark = 2
                elif 11 <= q_no <= 15:
                    max_mark = 6
                elif 16 <= q_no <= 17:
                    max_mark = 10
                else:
                    max_mark = 0
            else:
                raise ValueError("Invalid course type")

            records.append({
                "Register Number": register_number,
                "Exam": exam,
                "Course": course,
                "Question": q_no,
                "Mark": float(mark),
                "CO": co,
                "MaxMark": max_mark
            })
        except Exception:
            continue

    if not records:
        raise ValueError("No valid questions mapped to COs — check question_to_co and student marks.")

    df = pd.DataFrame(records)
    if df.empty:
        raise ValueError("No valid question records processed — check CO mappings and mark entries.")

    co_acquired_df = df.groupby(['Register Number', 'CO'])['Mark'].sum().unstack(fill_value=0)
    co_max_df = df.groupby(['Register Number', 'CO'])['MaxMark'].sum().unstack(fill_value=0)

    co_acquired_df.columns = [f"{col}_acquired" for col in co_acquired_df.columns]
    co_max_df.columns = [f"{col}_max" for col in co_max_df.columns]

    result_df = co_acquired_df.merge(co_max_df, on='Register Number', how='left')

    for co in [col.replace("_acquired", "") for col in co_acquired_df.columns]:
        result_df[co] = (result_df[f"{co}_acquired"] / result_df[f"{co}_max"].replace(0, 1)) * 100

    co_columns = [col for col in result_df.columns if col.startswith("CO") and not col.endswith(("_acquired", "_max","_Max","_Avg","_avg"))]
    result_df["CO_Avg"] = result_df[co_columns].mean(axis=1)
    result_df["CO_Max"] = result_df[[f"{co}_max" for co in co_columns]].sum(axis=1)

    def rule_based_category(avg):
        if avg >= 90:
            return "Excellent"
        elif avg >= 75:
            return "Good"
        elif avg >= 55:
            return "Average"
        else:
            return "At-Risk"

    result_df["Performance"] = result_df["CO_Avg"].apply(rule_based_category)
    result_df["Percentage"] = result_df["CO_Avg"]
    result_df["Register Number"] = register_number
    result_df["Exam"] = exam
    result_df["Course"] = course

    result_df = result_df[
        ["Register Number", "Exam", "Course"] +
        co_columns + ["CO_Avg", "CO_Max", "Percentage", "Performance"]
    ]

    return result_df
