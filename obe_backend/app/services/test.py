from app.models.schemas import StudentResultCreate
from app.services.crud import create_student_result

async def test_insert(db):
    data = StudentResultCreate(
        register_number="TEST119",
        performance="At-Risk",
        weak_cos=["CO1", "CO3", "CO5"],
        suggestions={
            "CO1": ["Read topic from GFGygjfjg"],
            "CO3": ["Watch YouTube lecture"],
            "CO5": ["Check Programiz summary"]  # Optional: to avoid missing suggestion
        }
    )

    print(">>> Inserting test student result...")
    result = await create_student_result(db, data)
    print(">>> Inserted student:", result.register_number)
