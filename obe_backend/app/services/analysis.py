import pandas as pd
from app.utils.co_mapping import question_to_co

def preprocess_excel(df: pd.DataFrame):
    # Fill missing Exam, Course, Register Number forward
    df[['Exam', 'Course', 'Register Number']] = df[['Exam', 'Course', 'Register Number']].ffill()

    # Map QN.NO to CO
    df['CO'] = df['QN.NO'].map(question_to_co)

    # Group by Register Number and CO to sum marks per CO per student
    student_co = df.groupby(['Register Number', 'CO'])['Mark'].sum().reset_index()

    # Pivot table: student x CO marks
    pivot_df = student_co.pivot(index='Register Number', columns='CO', values='Mark').fillna(0).reset_index()

    return pivot_df


def create_performance_labels(pivot_df):
    max_mark_per_co = 10  # Adjust if each CO has a different maximum mark
    co_columns = [col for col in pivot_df.columns if col.startswith('CO')]
    total_cos = len(co_columns)
    max_total_marks = max_mark_per_co * total_cos

    # Calculate total marks per student
    pivot_df['Total_Marks'] = pivot_df[co_columns].sum(axis=1)

    # Performance labeling logic based on total mark percentage
    def label_performance(total):
        percent = (total / max_total_marks) * 100
        if percent >= 90:
            return 'Excellent'
        elif percent >= 75:
            return 'Average'
        else:
            return 'At-risk'

    pivot_df['Performance'] = pivot_df['Total_Marks'].apply(label_performance)

    return pivot_df


def get_weak_cos(pivot_df, threshold=5):
    weak_cos = {}
    co_columns = [col for col in pivot_df.columns if col.startswith('CO')]

    for _, row in pivot_df.iterrows():
        register_number = row['Register Number']
        weak = [co for co in co_columns if row[co] < threshold]
        weak_cos[register_number] = weak

    return weak_cos
