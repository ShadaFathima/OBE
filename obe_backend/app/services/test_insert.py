import asyncio
from app.services.test import test_insert
from app.services.crud import get_student_result_by_regno
from app.services.db import AsyncSessionLocal
from sqlalchemy import select, delete
from app.models.student_results import StudentResult
from fastapi.encoders import jsonable_encoder


async def debug_all_results():
    print("\n>>> All records in student_results table:")
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(StudentResult))
        results = result.scalars().all()
        for row in results:
            print(f">>> In DB: {row.register_number!r}")
            print(jsonable_encoder(row))


async def main():
    async with AsyncSessionLocal() as session:
        # Clean up any old test data
        await session.execute(delete(StudentResult).where(StudentResult.register_number == "TEST119"))
        await session.commit()

        # Insert new test data
        await test_insert(session)

        # Retrieve and print
        result = await get_student_result_by_regno(session, "TEST119")
        print("\n>>> Retrieved student result:")
        print(jsonable_encoder(result))

        # Optional assertions
        assert result.register_number == "TEST119"
        assert "CO1" in result.weak_cos
        assert result.performance == "At-Risk"

    await debug_all_results()


if __name__ == "__main__":
    asyncio.run(main())
