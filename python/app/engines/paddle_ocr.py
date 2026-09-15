from __future__ import annotations

from app.core.config import get_settings
from app.core.schemas import PageResult
from app.engines.base import PdfEngine


class PaddleOcrEngine(PdfEngine):
    """
    Heavy OCR engine. Install via requirements-heavy.txt on a persistent host.
    Disabled on Vercel by default (ENABLE_HEAVY_OCR=0).
    """

    name = "paddle"

    def available(self) -> bool:
        settings = get_settings()
        if not settings.enable_heavy_ocr:
            return False
        try:
            from paddleocr import PaddleOCR  # noqa: F401

            return True
        except Exception:
            return False

    def extract(self, pdf_bytes: bytes) -> list[PageResult]:
        if not self.available():
            raise RuntimeError(
                "PaddleOCR is disabled or not installed. "
                "Set ENABLE_HEAVY_OCR=1 and install requirements-heavy.txt "
                "on Railway/Render/Fly (not recommended for default Vercel)."
            )

        # Lazy import — keep Vercel light bundle free of paddle
        import io

        import fitz
        from paddleocr import PaddleOCR
        from PIL import Image
        import numpy as np

        from app.core.schemas import TextRun

        def clamp01(v: float) -> float:
            return max(0.0, min(1.0, v))

        ocr = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        pages: list[PageResult] = []
        try:
            for page_index, page in enumerate(doc):
                mat = fitz.Matrix(2.0, 2.0)
                pix = page.get_pixmap(matrix=mat, alpha=False)
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                arr = np.array(img)
                width = float(page.rect.width) or 1.0
                height = float(page.rect.height) or 1.0
                scale_x = width / max(pix.width, 1)
                scale_y = height / max(pix.height, 1)
                result = ocr.ocr(arr, cls=True) or []
                runs: list[TextRun] = []
                idx = 0
                for block in result:
                    if not block:
                        continue
                    for line in block:
                        box, (text, conf) = line
                        text = (text or "").strip()
                        if not text:
                            continue
                        xs = [p[0] for p in box]
                        ys = [p[1] for p in box]
                        x0, x1 = min(xs) * scale_x, max(xs) * scale_x
                        y0, y1 = min(ys) * scale_y, max(ys) * scale_y
                        runs.append(
                            TextRun(
                                id=f"p{page_index}-pd{idx}",
                                text=text,
                                x=clamp01(x0 / width),
                                y=clamp01(y0 / height),
                                w=clamp01((x1 - x0) / width),
                                h=clamp01((y1 - y0) / height),
                                confidence=float(conf),
                            )
                        )
                        idx += 1
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
