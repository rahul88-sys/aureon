from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

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

OBSERVABILITY_HTML = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Aureon PDF</title>
    <script defer src="/_vercel/insights/script.js"></script>
    <script defer src="/_vercel/speed-insights/script.js"></script>
  </head>
  <body style="font-family:system-ui;background:#070b12;color:#f4f7fb;padding:2rem">
    <h1>Aureon PDF Service</h1>
    <p>Health: <a href="/health" style="color:#4fd1c5">/health</a></p>
    <p>Docs: <a href="/docs" style="color:#4fd1c5">/docs</a></p>
    <p>Analytics + Speed Insights are enabled for this deployment.</p>
  </body>
</html>
"""


@app.get("/", response_class=HTMLResponse)
def root():
    return OBSERVABILITY_HTML


@app.get("/observability", response_class=HTMLResponse)
def observability():
    return OBSERVABILITY_HTML
