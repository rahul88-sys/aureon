from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="Aureon PDF Service",
    version="0.1.0",
    description=(
        "Portable PDF text extract / OCR service. "
        "JWT required on /v1/* . Swap ENGINE / host without changing clients."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

app.include_router(router)


@app.get("/")
def root():
    return {
        "ok": True,
        "service": "aureon-pdf",
        "docs": "/docs",
        "health": "/health",
    }
