/**
 * Client helpers for Nest PDF parse gateway (Blob + Python OCR service).
 */
import { apiBaseUrl, getStoredToken } from "@/lib/api";
import type { ParsedTextRun } from "@/lib/pdf-ops";

export type ServerParseResult = {
  ok: boolean;
  blobUrl?: string;
  engine: string;
  source: "text-layer" | "ocr" | "none";
  needsOcr?: boolean;
  message?: string;
  runs: ParsedTextRun[];
};

/** Upload PDF to Nest → Blob → Python. Requires a logged-in JWT. */
export async function parsePdfViaApi(file: File): Promise<ServerParseResult | null> {
  const token = getStoredToken();
  if (!token) return null;

  const form = new FormData();
  form.append("file", file, file.name);

  const res = await fetch(`${apiBaseUrl}/pdf/parse`, {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (res.status === 401) return null;

  const data = (await res.json().catch(() => ({}))) as ServerParseResult & {
    detail?: string | Array<{ message?: string }>;
    message?: string;
  };

  if (!res.ok) {
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : data.message || `Parse failed (${res.status})`;
    throw new Error(detail);
  }

  return {
    ok: true,
    blobUrl: data.blobUrl,
    engine: data.engine,
    source: data.source,
    needsOcr: data.needsOcr,
    message: data.message,
    runs: (data.runs || []).map((r) => ({
      id: r.id,
      pageIndex: r.pageIndex,
      text: r.text,
      x: r.x,
      y: r.y,
      w: r.w,
      h: r.h,
      fontSize: r.fontSize || 12,
      fontFamily: r.fontFamily,
      color: r.color,
    })),
  };
}
