# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# from app.services.db import Base

# import pandas as pd

# router = APIRouter()

# class LoginRequest(BaseModel):
#     register_no: str

# @router.post("/login/")
# async def login(data: LoginRequest):
#     query = "SELECT DISTINCT register_no FROM student_data WHERE register_no = :reg_no"
#     result = await Base.fetch_one(query, values={"reg_no": data.register_no})

#     if result:
#         return {"success": True}
#     else:
#         raise HTTPException(status_code=401, detail="Invalid Register Number")
