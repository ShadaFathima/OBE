from sqlalchemy import Column, Integer, String, JSON, DateTime, Float, PrimaryKeyConstraint
from sqlalchemy.sql import func
from app.services.db import Base
from datetime import datetime

class StudentResult(Base):
    __tablename__ = "student_results"

    register_number = Column(String, index=True, nullable=False)
    exam = Column(String, nullable=False)
    course = Column(String, nullable=False)

    performance = Column(String, nullable=False)
    percentage = Column(Float, nullable=False)
    weak_cos = Column(JSON, nullable=True)
    suggestions = Column(JSON, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("register_number", "exam", "course"),
    )
