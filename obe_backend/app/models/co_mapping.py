# app/models/comapping.py
from sqlalchemy import Column, String, JSON, DateTime
from sqlalchemy.sql import func
from app.services.db import Base

class COmapping(Base):
    __tablename__ = "co_mapping"

    course = Column(String, primary_key=True)
    exam = Column(String, primary_key=True)

    question_to_co = Column(JSON, nullable=False)
    co_definition = Column(JSON, nullable=False)  # { "CO1": "Definition", ... }

    created_at = Column(DateTime(timezone=True), server_default=func.now())
