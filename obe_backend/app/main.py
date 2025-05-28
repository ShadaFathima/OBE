import os
from dotenv import load_dotenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse

from app.routers import predict, materials, upload
from app.services.improvement import get_combined_study_material

load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(predict.router, prefix="/api")
app.include_router(materials.router, prefix="/api")
app.include_router(upload.router, prefix="/api")  # <--- IMPORTANT

# Static
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/")
def read_root():
    return {"message": "FastAPI backend is running"}

@app.get("/api/materials/", name="get_combined_materials")
async def get_combined_materials(co_topic: str):
    return await get_combined_study_material(co_topic)

@app.get("/favicon.ico")
async def favicon():
    return RedirectResponse(url="/static/favicon.ico")