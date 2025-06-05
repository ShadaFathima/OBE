# app/models/schemas.py

from pydantic import BaseModel, constr
from typing import List, Dict, Union, Optional
from datetime import datetime
from pydantic import BaseModel
from typing import Optional


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


class StudentDetailsCreate(BaseModel):
    register_number: str
    exam: str
    course: str
    q1: Optional[float] = None
    q2: Optional[float] = None
    q3: Optional[float] = None
    q4: Optional[float] = None
    q5: Optional[float] = None
    q6: Optional[float] = None
    q7: Optional[float] = None
    q8: Optional[float] = None
    q9: Optional[float] = None
    q10: Optional[float] = None
    q11: Optional[float] = None
    q12: Optional[float] = None
    q13: Optional[float] = None
    q14: Optional[float] = None
    q15: Optional[float] = None
    q16: Optional[float] = None
    q17: Optional[float] = None
    q18: Optional[float] = None
    q19: Optional[float] = None
    q20: Optional[float] = None
    co1: Optional[float] = None
    co2: Optional[float] = None
    co3: Optional[float] = None
    co4: Optional[float] = None
    co5: Optional[float] = None
    co6: Optional[float] = None


class StudentDetailsOut(StudentDetailsCreate):
    uploaded_at: datetime

    class Config:
        from_attributes = True




class ClassPerformanceBase(BaseModel):
    course: str
    exam: str
    co1_avg: Optional[float] = None
    co2_avg: Optional[float] = None
    co3_avg: Optional[float] = None
    co4_avg: Optional[float] = None
    co5_avg: Optional[float] = None
    co6_avg: Optional[float] = None
    class_performance: Optional[float] = None


class ClassPerformanceCreate(ClassPerformanceBase):
    pass


class ClassPerformanceOut(ClassPerformanceBase):
    class Config:
        orm_mode = True

