from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.api.routes.health import router as health_router
from app.api.routes.predict import router as predict_router
from app.api.routes.history_and_metrics import history_router, metrics_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="FastAPI backend for Plastic Waste Detection on Water Bodies Using Deep Learning (YOLOv8m + SAM 2.1 Small)",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(health_router, tags=["Health"])
app.include_router(predict_router, tags=["Inference"])
app.include_router(history_router, tags=["History"])
app.include_router(metrics_router, tags=["Metrics"])

# Static file serving for artifacts (annotated images and masks)
artifacts_dir = Path(settings.ARTIFACTS_DIR)
artifacts_dir.mkdir(parents=True, exist_ok=True)
app.mount("/artifacts", StaticFiles(directory=str(artifacts_dir)), name="artifacts")

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "running",
        "docs": "/docs",
        "health": "/health",
    }
