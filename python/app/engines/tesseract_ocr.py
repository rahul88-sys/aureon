from __future__ import annotations

from app.core.schemas import PageResult
from app.engines.base import PdfEngine


class TesseractEngine(PdfEngine):
    """
    Medium OCR engine for scanned PDFs.
    Enabled when system tesseract + pytesseract are installed
    (e.g. Docker on Vercel / Railway). Stubbed when unavailable.
    """

    name = "tesseract"

    def available(self) -> bool:
        try:
            import pytesseract  # noqa: F401
            from PIL import Image  # noqa: F401
            import fitz  # noqa: F401

            return True
        except Exception:
            return False

    def extract(self, pdf_bytes: bytes) -> list[PageResult]:
        if not self.available():
            raise RuntimeError(
                "Tesseract OCR is not installed in this environment. "
                "Deploy with Dockerfile (tesseract-ocr) or set OCR_ENGINE=paddle "
                "on a host with heavy deps."
            )

        import fitz
        import pytesseract
        from PIL import Image
        import io

        from app.core.schemas import TextRun

        def clamp01(v: float) -> float:
            return max(0.0, min(1.0, v))

        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        pages: list[PageResult] = []
        try:
            for page_index, page in enumerate(doc):
                # ~2x raster for OCR quality vs size
                mat = fitz.Matrix(2.0, 2.0)
                pix = page.get_pixmap(matrix=mat, alpha=False)
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                data = pytesseract.image_to_data(
                    img, output_type=pytesseract.Output.DICT
                )
                width = float(page.rect.width) or 1.0
                height = float(page.rect.height) or 1.0
                scale_x = width / max(pix.width, 1)
                scale_y = height / max(pix.height, 1)
                runs: list[TextRun] = []
                n = len(data.get("text", []))
                for i in range(n):
                    text = (data["text"][i] or "").strip()
                    conf_raw = data["conf"][i]
                    try:
                        conf = float(conf_raw)
                    except Exception:
                        conf = -1
                    if not text or conf < 40:
                        continue
                    x0 = data["left"][i] * scale_x
                    y0 = data["top"][i] * scale_y
                    bw = data["width"][i] * scale_x
                    bh = data["height"][i] * scale_y
                    runs.append(
                        TextRun(
                            id=f"p{page_index}-ocr{i}",
                            text=text,
                            x=clamp01(x0 / width),
                            y=clamp01(y0 / height),
                            w=clamp01(bw / width),
                            h=clamp01(bh / height),
                            confidence=max(0.0, min(1.0, conf / 100.0)),
                            font_size=round(bh * 0.85, 2),
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
