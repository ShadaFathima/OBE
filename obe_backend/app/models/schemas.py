#app/models/schemas.py

from pydantic import BaseModel, constr
from typing import List, Dict, Union, Optional
from datetime import datetime


class SuggestionItem(BaseModel):
    co: str
    definition: str
    material: Union[str, List[Dict[str, str]], None] = None
    youtube_videos: List[Dict[str, str]] = []


class StudentResultCreate(BaseModel):
    register_number: str
    performance: str  # You can convert this to Enum if needed
    weak_cos: List[str]
    suggestions: Dict[str, SuggestionItem]


class StudentResultOut(StudentResultCreate):
    uploaded_at: datetime

    class Config:
        from_attributes = True


class StudyMaterialSchema(BaseModel):
    topic: str
    web_summaries: List[Dict[str, str]]
    youtube_query: List[Dict[str, str]]
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True
