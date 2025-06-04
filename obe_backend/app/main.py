import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from contextlib import asynccontextmanager

from app.routers import predict, materials, upload, login
from app.services.db import engine
from app.models import student_results  # ensures models are loaded

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions (can include test DB connection, migrations etc.)
    print("App startup")
    yield
    # Shutdown actions
    print("App shutdown")

app = FastAPI(lifespan=lifespan)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to frontend origin(s) in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(predict.router, prefix="/api", tags=["Predict & Analyze"])
app.include_router(materials.router, prefix="/api", tags=["Materials & Results"])
app.include_router(upload.router, prefix="/api", tags=["Upload & Preprocess"])
# app.include_router(login.router, prefix="/api", tags=["Authentication"])  # Uncomment if login implemented

# Static file mount
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/")
def read_root():
    return {"message": "FastAPI backend is running"}

@app.get("/favicon.ico")
async def favicon():
    return RedirectResponse(url="/static/favicon.ico")
