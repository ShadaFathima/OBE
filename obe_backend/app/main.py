from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routers import predict, materials, upload
from app.services.improvement import get_combined_study_material

import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Set specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, prefix="/api")
app.include_router(materials.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
# app.include_router(proxy.router, prefix="/api")
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse


@app.get("/")
def read_root():
    return {"message": "FastAPI backend is running"}

@app.get("/api/materials/", name="get_combined_materials")
def get_combined_materials(co_topic: str):
    return get_combined_study_material(co_topic)
static_dir = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/favicon.ico")
async def favicon():
    return RedirectResponse(url="/static/favicon.ico")




