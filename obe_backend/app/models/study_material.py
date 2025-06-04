from sqlalchemy import Column, String, JSON, DateTime
from sqlalchemy.sql import func
from app.services.db import Base
from datetime import datetime

class StudyMaterial(Base):
    __tablename__ = "study_materials"

    topic = Column(String, primary_key=True, index=True)
    web_summaries = Column(JSON, nullable=True)
    youtube_videos = Column(JSON, nullable=True)  # ✅ changed from String to JSON
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
