from sqlalchemy import Column, String, Float
from app.services.db import Base
from sqlalchemy.schema import PrimaryKeyConstraint


class ClassPerformance(Base):
    __tablename__ = "class_performance"

    course = Column(String, index=True)
    exam = Column(String, index=True)

    co1_avg = Column(Float, nullable=True)
    co2_avg = Column(Float, nullable=True)
    co3_avg = Column(Float, nullable=True)
    co4_avg = Column(Float, nullable=True)
    co5_avg = Column(Float, nullable=True)
    co6_avg = Column(Float, nullable=True)

    class_performance = Column(Float, nullable=True)

    __table_args__ = (
        PrimaryKeyConstraint('course', 'exam'),
    )

    def to_dict(self):
        return {
            "course": self.course,
            "exam": self.exam,
            "co1_avg": self.co1_avg,
            "co2_avg": self.co2_avg,
            "co3_avg": self.co3_avg,
            "co4_avg": self.co4_avg,
            "co5_avg": self.co5_avg,
            "co6_avg": self.co6_avg,
            "class_performance": self.class_performance,
        }