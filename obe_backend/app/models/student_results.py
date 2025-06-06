# app/models/student_results.py

from sqlalchemy import Column, Integer, String, JSON, DateTime, Float
from sqlalchemy.sql import func
from app.services.db import Base
from datetime import datetime

class StudentResult(Base):
    __tablename__ = "student_results"
    register_number = Column(String, primary_key=True, index=True, nullable=False, unique=True)
    performance = Column(String, nullable=False)
    percentage = Column(Float, nullable=False)
    weak_cos = Column(JSON, nullable=True)
    suggestions = Column(JSON, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
