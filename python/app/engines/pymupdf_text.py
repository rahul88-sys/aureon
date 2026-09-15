from __future__ import annotations

import fitz  # PyMuPDF

from app.core.schemas import PageResult, TextRun
from app.engines.base import PdfEngine


def _clamp01(v: float) -> float:
    return max(0.0, min(1.0, v))


class PyMuPdfTextEngine(PdfEngine):
    """Light engine: extract the native PDF text layer (no OCR)."""

    name = "pymupdf_text"

    def available(self) -> bool:
        return True

    def extract(self, pdf_bytes: bytes) -> list[PageResult]:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        pages: list[PageResult] = []
        try:
            for page_index, page in enumerate(doc):
                width = float(page.rect.width) or 1.0
                height = float(page.rect.height) or 1.0
                runs: list[TextRun] = []
                # "words" → (x0, y0, x1, y1, word, block, line, word_no)
                words = page.get_text("words") or []
                for i, w in enumerate(words):
                    x0, y0, x1, y1, text, *_rest = w
                    text = (text or "").strip()
                    if not text:
                        continue
                    bw = max(x1 - x0, 1.0)
                    bh = max(y1 - y0, 1.0)
                    runs.append(
                        TextRun(
                            id=f"p{page_index}-w{i}",
                            text=text,
                            x=_clamp01(x0 / width),
                            y=_clamp01(y0 / height),
                            w=_clamp01(bw / width),
                            h=_clamp01(bh / height),
                            confidence=1.0,
                            font_hint=None,
                            font_size=round(bh * 0.85, 2),
                        )
                    )
                # Fallback to blocks if words empty but text exists
                if not runs:
                    blocks = page.get_text("blocks") or []
                    for i, block in enumerate(blocks):
                        if len(block) < 5:
                            continue
                        x0, y0, x1, y1, text = block[:5]
                        text = (str(text) or "").strip()
                        if not text:
                            continue
                        bw = max(x1 - x0, 1.0)
                        bh = max(y1 - y0, 1.0)
                        runs.append(
                            TextRun(
                                id=f"p{page_index}-b{i}",
                                text=text.replace("\n", " "),
                                x=_clamp01(x0 / width),
                                y=_clamp01(y0 / height),
                                w=_clamp01(bw / width),
                                h=_clamp01(bh / height),
                                confidence=1.0,
                                font_size=round(bh * 0.5, 2),
                            )
                        )
                pages.append(
                    PageResult(
                        index=page_index,
                        width=width,
                        height=height,
                        runs=runs,
                    )
                )
        finally:
            doc.close()
        return pages
