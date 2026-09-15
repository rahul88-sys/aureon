from __future__ import annotations

from app.core.config import Settings
from app.core.schemas import ExtractResponse, PageResult
from app.engines.paddle_ocr import PaddleOcrEngine
from app.engines.pymupdf_text import PyMuPdfTextEngine
from app.engines.tesseract_ocr import TesseractEngine

TEXT_ENGINE = PyMuPdfTextEngine()
TESSERACT = TesseractEngine()
PADDLE = PaddleOcrEngine()


def engine_availability() -> dict[str, bool]:
    return {
        TEXT_ENGINE.name: TEXT_ENGINE.available(),
        TESSERACT.name: TESSERACT.available(),
        PADDLE.name: PADDLE.available(),
    }


def _total_runs(pages: list[PageResult]) -> int:
    return sum(len(p.runs) for p in pages)


def _pick_ocr(settings: Settings):
    name = (settings.ocr_engine or "tesseract").lower()
    if name == "paddle":
        return PADDLE
    return TESSERACT


def run_extract(
    pdf_bytes: bytes,
    settings: Settings,
    *,
    engine: str | None = None,
    force_ocr: bool = False,
) -> ExtractResponse:
    mode = (engine or settings.engine_default or "auto").lower()

    if mode == "pymupdf_text" or (mode == "auto" and not force_ocr):
        pages = TEXT_ENGINE.extract(pdf_bytes)
        if _total_runs(pages) > 0 and not force_ocr:
            return ExtractResponse(
                engine=TEXT_ENGINE.name,
                source="text-layer",
                pages=pages,
                needs_ocr=False,
            )
        if mode == "pymupdf_text":
            return ExtractResponse(
                engine=TEXT_ENGINE.name,
                source="none",
                pages=pages,
                needs_ocr=True,
                message="No selectable text layer found",
            )

    if mode in ("tesseract", "paddle"):
        ocr = PADDLE if mode == "paddle" else TESSERACT
        if not ocr.available():
            return ExtractResponse(
                engine=ocr.name,
                source="none",
                pages=[],
                needs_ocr=True,
                message=f"Engine '{ocr.name}' is not available in this deploy",
            )
        pages = ocr.extract(pdf_bytes)
        return ExtractResponse(
            engine=ocr.name,
            source="ocr" if _total_runs(pages) else "none",
            pages=pages,
            needs_ocr=_total_runs(pages) == 0,
        )

    # auto → OCR fallback
    ocr = _pick_ocr(settings)
    if not ocr.available():
        # Try the other OCR before giving up
        alt = PADDLE if ocr is TESSERACT else TESSERACT
        if alt.available():
            ocr = alt
        else:
            text_pages = TEXT_ENGINE.extract(pdf_bytes) if mode == "auto" else []
            return ExtractResponse(
                engine=TEXT_ENGINE.name,
                source="none" if _total_runs(text_pages) == 0 else "text-layer",
                pages=text_pages,
                needs_ocr=_total_runs(text_pages) == 0,
                message=(
                    "No OCR engine installed on this host. "
                    "Text-layer extract only. Enable tesseract Docker or "
                    "ENABLE_HEAVY_OCR on another host."
                ),
            )

    pages = ocr.extract(pdf_bytes)
    return ExtractResponse(
        engine=ocr.name,
        source="ocr" if _total_runs(pages) else "none",
        pages=pages,
        needs_ocr=_total_runs(pages) == 0,
    )
