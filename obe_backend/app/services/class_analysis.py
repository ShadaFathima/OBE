from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert, select
from app.models.class_performance import ClassPerformance
import pandas as pd
import logging
from app.models.student_details import StudentDetails
from app.models.schemas import ClassPerformanceCreate
from sqlalchemy.dialects.postgresql import insert as pg_insert

logger = logging.getLogger(__name__)


def compute_class_averages(df: pd.DataFrame) -> dict | None:
    """
    Compute average marks per CO and overall class performance from the dataframe.
    Supports CO column names in any case like CO1 or co1.
    """
    try:
        df.columns = [col.lower() for col in df.columns]  # normalize to lowercase

        co_columns = [
            col for col in df.columns
            if col.startswith("co")
            and not col.endswith("_acquired")
            and not col.endswith("_max")
            and not col.endswith("_avg")
            and not col.endswith("_max")
            and pd.api.types.is_numeric_dtype(df[col])
        ]

        print(f"\n[DEBUG] Found CO columns: {co_columns}")
        logger.debug(f"[DEBUG] Found CO columns: {co_columns}")

        if not co_columns:
            logger.warning("No valid CO percentage columns found in DataFrame for class performance computation.")
            return None

        co_averages = {}
        for col in co_columns:
            avg_val = pd.to_numeric(df[col], errors='coerce').dropna().mean()
            rounded = round(avg_val, 2) if not pd.isna(avg_val) else 0.0
            co_averages[f"{col}_avg"] = rounded
            print(f"[DEBUG] Average of {col}: {rounded}")
            logger.debug(f"[DEBUG] Average of {col}: {rounded}")

        numeric_co_values = list(co_averages.values())
        print(f"[DEBUG] All CO avg values: {numeric_co_values}")
        logger.debug(f"[DEBUG] All CO avg values: {numeric_co_values}")

        class_avg = round(sum(numeric_co_values) / len(numeric_co_values), 2) if numeric_co_values else 0.0
        print(f"len(numeric_co_values): {len(numeric_co_values)}")
        print(f"[DEBUG] Final class_performance: {class_avg}")
        logger.debug(f"[DEBUG] Final class_performance: {class_avg}")

        course = df["course"].iloc[0] if "course" in df.columns else "Unknown"
        exam = df["exam"].iloc[0] if "exam" in df.columns else "Unknown"

        data = {
            "course": course,
            "exam": exam,
            **co_averages,
            "class_performance": class_avg
        }

        logger.debug(f"[DEBUG] Computed class averages to store: {data}")
        print(f"[DEBUG] Computed class averages to store: {data}")
        return data

    except Exception as e:
        logger.exception("Error in compute_class_averages")
        return None


async def store_class_performance(db: AsyncSession, data: ClassPerformanceCreate) -> dict | None:
    try:
        data_dict = data.dict()
        print(f"[STORE DEBUG] Data going to DB: {data_dict}")
        logger.debug(f"[STORE DEBUG] Data going to DB: {data_dict}")

        stmt = pg_insert(ClassPerformance).values(**data_dict).on_conflict_do_update(
            index_elements=['course', 'exam'],
            set_=data_dict
        )
        await db.execute(stmt)
        await db.commit()
        logger.info(f"[SUCCESS] Class performance saved for course={data.course} exam={data.exam}")
        print(f"[SUCCESS] Class performance saved for course={data.course} exam={data.exam}")
        return data_dict

    except Exception as e:
        logger.error(f"[ERROR] Failed to save class performance: {e}", exc_info=True)
        print(f"[ERROR] Failed to save class performance: {e}")
        return None


async def compute_and_save_class_performance(df: pd.DataFrame, db: AsyncSession):
    print(f"[DEBUG] Running compute_and_save_class_performance")
    logger.debug(f"[DEBUG] Running compute_and_save_class_performance")
    data = compute_class_averages(df)
    if data is None:
        print("[DEBUG] No class averages computed.")
        logger.warning("[DEBUG] No class averages computed.")
        return None
    schema_data = ClassPerformanceCreate(**data)
    return await store_class_performance(db, schema_data)


async def compute_and_save_class_performance_from_db(course: str, exam: str, db: AsyncSession):
    try:
        print(f"[DEBUG] Fetching student records for course={course}, exam={exam}")
        logger.debug(f"[DEBUG] Fetching student records for course={course}, exam={exam}")

        result = await db.execute(
            select(StudentDetails).where(
                StudentDetails.course == course,
                StudentDetails.exam == exam
            )
        )
        records = result.scalars().all()

        print(f"[DEBUG] Found {len(records)} student records.")
        logger.debug(f"[DEBUG] Found {len(records)} student records.")

        if not records:
            logger.warning(f"[WARNING] No student details found for course={course}, exam={exam}")
            return None

        df = pd.DataFrame([r.__dict__ for r in records])
        df = df.drop(columns=["_sa_instance_state", "id"], errors="ignore")
        print("[DEBUG] Constructed DataFrame from DB records:")
        print(df.head())
        logger.debug(f"[DEBUG] Constructed DataFrame from DB with columns: {df.columns.tolist()}")

        return await compute_and_save_class_performance(df, db)

    except Exception as e:
        logger.exception("[ERROR] Exception occurred while computing class performance from DB")
        print(f"[ERROR] Exception occurred in compute_and_save_class_performance_from_db: {e}")
        return None
