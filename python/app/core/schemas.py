from typing import Literal

from pydantic import BaseModel, Field


class TextRun(BaseModel):
    id: str
    text: str
    x: float = Field(ge=0, le=1)
    y: float = Field(ge=0, le=1)
    w: float = Field(ge=0, le=1)
    h: float = Field(ge=0, le=1)
    confidence: float = Field(default=1.0, ge=0, le=1)
    font_hint: str | None = None
    font_size: float | None = None
    color: str | None = None


class PageResult(BaseModel):
    index: int
    width: float
    height: float
    runs: list[TextRun] = Field(default_factory=list)


class ExtractResponse(BaseModel):
    ok: bool = True
    engine: str
    source: Literal["text-layer", "ocr", "none"]
    pages: list[PageResult] = Field(default_factory=list)
    needs_ocr: bool = False
    message: str | None = None
    blob_url: str | None = None


class BlobParseRequest(BaseModel):
    blob_url: str
    engine: Literal["auto", "pymupdf_text", "tesseract", "paddle"] | None = None


class HealthResponse(BaseModel):
    ok: bool = True
    service: str = "aureon-pdf"
    engines: dict[str, bool]
