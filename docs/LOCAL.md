# Local development

Three processes. Env files are already set (`api/.env`, `python/.env`, `.env.local`).

## Start

From repo root (three terminals):

```bash
npm run dev        # Next  → http://localhost:3000
npm run dev:api    # Nest  → http://localhost:4000/api/health
npm run dev:pdf    # Python → http://localhost:8000/health
```

## Test Edit PDF with server parse

1. Open http://localhost:3000 and **sign in** (Google) so a JWT exists.
2. Go to Tools → Edit PDF and open a PDF.
3. Signed-in flow: Nest uploads to Blob → Python parses → highlights.
4. Not signed in: browser OCR fallback still works.
5. Click a highlight → **Replace** popup (not inline edit).

## Checks

- `GET http://localhost:8000/health` — no auth
- `GET http://localhost:4000/api/health` — no auth
- `POST http://localhost:4000/api/pdf/parse` — needs `Authorization: Bearer <jwt>` + multipart `file`

## Notes

- Python venv: `python/.venv` (Python 3.12)
- JWT secrets in Nest + Python `.env` must match
- Rotate `BLOB_READ_WRITE_TOKEN` before production deploy
