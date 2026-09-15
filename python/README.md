# Aureon PDF Python service

Portable FastAPI service for PDF text extraction and OCR.

## Local

```bash
cd python
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env   # set JWT_SECRET to match Nest
uvicorn app.main:app --reload --port 8000
```

- Health (no auth): `GET http://localhost:8000/health`
- Parse (JWT): `POST /v1/parse` with `{ "blob_url": "..." }` and `Authorization: Bearer <token>`

## Engines

| Env | Meaning |
|---|---|
| `ENGINE_DEFAULT=auto` | Text layer first, then OCR |
| `OCR_ENGINE=tesseract` | Medium OCR when installed |
| `ENABLE_HEAVY_OCR=1` + `requirements-heavy.txt` | PaddleOCR on Railway/etc. |

## Observability

`GET /` and `GET /observability` serve an HTML shell that loads Vercel Analytics + Speed Insights scripts (same pattern as Nest API).
