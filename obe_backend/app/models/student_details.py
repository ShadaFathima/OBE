from sqlalchemy import Column, String, Float, DateTime, PrimaryKeyConstraint
from sqlalchemy.sql import func
from app.services.db import Base

class StudentDetails(Base):
    __tablename__ = "student_details"

    register_number = Column(String, index=True)
    course = Column(String, nullable=False)
    exam = Column(String, nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint('register_number', 'course', 'exam'),
    )

    # Questions: make them nullable to allow flexibility
    q1 = Column(Float, nullable=True)
    q2 = Column(Float, nullable=True)
    q3 = Column(Float, nullable=True)
    q4 = Column(Float, nullable=True)
    q5 = Column(Float, nullable=True)
    q6 = Column(Float, nullable=True)
    q7 = Column(Float, nullable=True)
    q8 = Column(Float, nullable=True)
    q9 = Column(Float, nullable=True)
    q10 = Column(Float, nullable=True)
    q11 = Column(Float, nullable=True)
    q12 = Column(Float, nullable=True)
    q13 = Column(Float, nullable=True)
    q14 = Column(Float, nullable=True)
    q15 = Column(Float, nullable=True)
    q16 = Column(Float, nullable=True)
    q17 = Column(Float, nullable=True)
    q18 = Column(Float, nullable=True)
    q19 = Column(Float, nullable=True)
    q20 = Column(Float, nullable=True)

    # CO Marks
    co1 = Column(Float, nullable=True)
    co2 = Column(Float, nullable=True)
    co3 = Column(Float, nullable=True)
    co4 = Column(Float, nullable=True)
    co5 = Column(Float, nullable=True)
    co6 = Column(Float, nullable=True)

    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
