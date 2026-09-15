from __future__ import annotations

import httpx

from app.core.config import Settings


async def fetch_blob_bytes(blob_url: str, settings: Settings) -> bytes:
    """Download a PDF from Vercel Blob (public URL or token-auth)."""
    headers: dict[str, str] = {}
    if settings.blob_read_write_token:
        headers["Authorization"] = f"Bearer {settings.blob_read_write_token}"

    async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
        res = await client.get(blob_url, headers=headers)
        if res.status_code >= 400 and settings.blob_read_write_token:
            # Some private Blob URLs expect token as query param fallback
            sep = "&" if "?" in blob_url else "?"
            res = await client.get(
                f"{blob_url}{sep}token={settings.blob_read_write_token}",
                headers=headers,
            )
        res.raise_for_status()
        data = res.content
        if len(data) > settings.max_download_bytes:
            raise ValueError(
                f"PDF exceeds max size ({settings.max_download_bytes} bytes)"
            )
        if not data.startswith(b"%PDF"):
            raise ValueError("Blob URL did not return a PDF")
        return data
