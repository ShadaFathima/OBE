# app/init_db.py

from sqlalchemy import create_engine
from app.services.db import Base
from app.models import student_results ,study_material ,student_details,class_performance,teacherSignup # register models

import os
from dotenv import load_dotenv


# Load .env for DATABASE_URL
dotenv_path = os.path.join(os.path.dirname(__file__), '../.env')
load_dotenv(dotenv_path)

DATABASE_URL = os.getenv("DATABASE_URL")

def create_tables():
    # Use synchronous engine just for table creation
    sync_engine = create_engine(DATABASE_URL.replace("+asyncpg", ""))
    Base.metadata.create_all(bind=sync_engine)
    print("✅ Tables created successfully.")

if __name__ == "__main__":
    create_tables()
