from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert
from app.models.class_performance import ClassPerformance
import pandas as pd
import logging
from app.models.schemas import ClassPerformanceCreate
from app.services.crud import save_class_performance
from sqlalchemy.dialects.postgresql import insert  # ensure this import

logger = logging.getLogger(__name__)

def compute_class_averages(df: pd.DataFrame) -> dict | None:
    """
    Compute average marks per CO and overall class performance from the dataframe.
    Returns a dict with averages and metadata or None if no valid CO columns found.
    """
    # Filter only CO percentage columns (like CO1, CO2, ...) excluding *_acquired and *_max
    co_columns = [
        col for col in df.columns
        if col.startswith("CO")
        and not col.endswith("_acquired")
        and not col.endswith("_max")
        and not col.endswith("_Avg")
        and not col.endswith("_Max")
    ]
    print(f"\n[DEBUG] Found CO columns: {co_columns}")

    if not co_columns:
        logger.warning("No valid CO percentage columns found in DataFrame for class performance computation.")
        return None

    # Compute individual CO averages
    co_averages = {}
    for col in co_columns:
        avg_val = pd.to_numeric(df[col], errors='coerce').dropna().mean()
        rounded = round(avg_val, 2) if not pd.isna(avg_val) else 0.0
        co_averages[f"{col.lower()}_avg"] = rounded
        print(f"[DEBUG] Average of {col}: {rounded}")

    # Compute class performance as average of all valid CO percentage averages
    numeric_co_values = list(co_averages.values())
    print(f"[DEBUG] All CO avg values: {numeric_co_values}")

    class_avg = round(sum(numeric_co_values) / len(numeric_co_values), 2) if numeric_co_values else 0.0
    print(f"len(numeric_co_values): {len(numeric_co_values)}")
    print(f"[DEBUG] Final class_performance: {class_avg}")

    course = df["Course"].iloc[0] if "Course" in df.columns else "Unknown"
    exam = df["Exam"].iloc[0] if "Exam" in df.columns else "Unknown"

    data = {
        "course": course,
        "exam": exam,
        **co_averages,
        "class_performance": class_avg
    }

    logger.debug(f"Computed class averages: {data}")
    return data



async def store_class_performance(db: AsyncSession, data: ClassPerformanceCreate) -> dict | None:
    try:
        data_dict = data.dict()
        print(f"[STORE DEBUG] Data going to DB: {data_dict}")

        stmt = insert(ClassPerformance).values(**data_dict).on_conflict_do_update(
            index_elements=['course', 'exam'],
            set_=data_dict
        )
        await db.execute(stmt)
        await db.commit()
        logger.info(f"Class performance saved for course {data.course} exam {data.exam}")
        return data_dict
    except Exception as e:
        logger.error(f"Error saving class performance: {e}", exc_info=True)
        return None


async def compute_and_save_class_performance(df: pd.DataFrame, db: AsyncSession):
    data = compute_class_averages(df)
    if data is None:
        return None
    schema_data = ClassPerformanceCreate(**data)
    return await store_class_performance(db, schema_data)
