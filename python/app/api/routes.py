from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.auth import require_jwt
from app.core.config import Settings, get_settings
from app.core.schemas import BlobParseRequest, ExtractResponse, HealthResponse
from app.services.blob import fetch_blob_bytes
from app.services.pipeline import engine_availability, run_extract

router = APIRouter()
secure = APIRouter(dependencies=[Depends(require_jwt)])


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(engines=engine_availability())


@secure.post("/v1/parse", response_model=ExtractResponse)
async def parse_blob(
    body: BlobParseRequest,
    settings: Annotated[Settings, Depends(get_settings)],
    _user: Annotated[dict, Depends(require_jwt)],
) -> ExtractResponse:
    try:
        pdf_bytes = await fetch_blob_bytes(body.blob_url, settings)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not download blob: {exc}",
        ) from exc

    result = run_extract(pdf_bytes, settings, engine=body.engine)
    result.blob_url = body.blob_url
    return result


@secure.post("/v1/extract", response_model=ExtractResponse)
async def extract_blob(
    body: BlobParseRequest,
    settings: Annotated[Settings, Depends(get_settings)],
    _user: Annotated[dict, Depends(require_jwt)],
) -> ExtractResponse:
    try:
        pdf_bytes = await fetch_blob_bytes(body.blob_url, settings)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not download blob: {exc}",
        ) from exc

    result = run_extract(
        pdf_bytes, settings, engine=body.engine or "pymupdf_text"
    )
    result.blob_url = body.blob_url
    return result


@secure.post("/v1/ocr", response_model=ExtractResponse)
async def ocr_blob(
    body: BlobParseRequest,
    settings: Annotated[Settings, Depends(get_settings)],
    _user: Annotated[dict, Depends(require_jwt)],
) -> ExtractResponse:
    try:
        pdf_bytes = await fetch_blob_bytes(body.blob_url, settings)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not download blob: {exc}",
        ) from exc

    engine = body.engine
    if engine in (None, "auto", "pymupdf_text"):
        engine = settings.ocr_engine or "tesseract"
    result = run_extract(pdf_bytes, settings, engine=engine, force_ocr=True)
    result.blob_url = body.blob_url
    return result


@secure.post("/v1/parse-upload", response_model=ExtractResponse)
async def parse_upload(
    settings: Annotated[Settings, Depends(get_settings)],
    _user: Annotated[dict, Depends(require_jwt)],
    file: UploadFile = File(...),
    engine: str | None = None,
) -> ExtractResponse:
    data = await file.read()
    if len(data) > settings.max_download_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large",
        )
    if not data.startswith(b"%PDF"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Upload is not a PDF",
        )
    return run_extract(data, settings, engine=engine)


router.include_router(secure)
