import { PDFDocument, degrees } from "pdf-lib";
import JSZip from "jszip";

export type ConvertResult = { blob: Blob; filename: string };

function baseName(name: string) {
  return name.replace(/\.[^.]+$/, "") || "document";
}

function asBlob(bytes: Uint8Array, type: string) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy], { type });
}

async function readPdf(file: File) {
  const bytes = await file.arrayBuffer();
  return PDFDocument.load(bytes, { ignoreEncryption: true });
}

let workerReady = false;

function multiplyTransform(m1: number[], m2: number[]) {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
}

async function getPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  if (!workerReady && typeof window !== "undefined") {
    // Prefer bundled worker; fall back to CDN matching the installed version
    try {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
    } catch {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    }
    workerReady = true;
  }
  return pdfjs;
}

async function loadPdfJsDocument(file: File) {
  const pdfjs = await getPdfjs();
  // Slice so the buffer can't be neutered if the worker transfers it
  const data = new Uint8Array((await file.arrayBuffer()).slice(0));
  const pdf = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  return { pdfjs, pdf };
}

export async function mergePdfs(files: File[]): Promise<ConvertResult> {
  if (files.length < 2) throw new Error("Select at least two PDFs to merge.");
  const out = await PDFDocument.create();
  for (const file of files) {
    const src = await readPdf(file);
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  const bytes = await out.save();
  return {
    blob: asBlob(bytes, "application/pdf"),
    filename: "merged.pdf",
  };
}

export async function splitPdf(files: File[]): Promise<ConvertResult> {
  const file = files[0];
  if (!file) throw new Error("No PDF selected");
  const src = await readPdf(file);
  const count = src.getPageCount();
  if (count < 2) throw new Error("PDF already has a single page.");

  const zip = new JSZip();
  const root = baseName(file.name);
  for (let i = 0; i < count; i += 1) {
    const doc = await PDFDocument.create();
    const [page] = await doc.copyPages(src, [i]);
    doc.addPage(page);
    const bytes = await doc.save();
    zip.file(`${root}-page-${i + 1}.pdf`, bytes);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  return { blob, filename: `${root}-split.zip` };
}

export async function rotatePdf(
  files: File[],
  angle = 90,
): Promise<ConvertResult> {
  const file = files[0];
  if (!file) throw new Error("No PDF selected");
  const doc = await readPdf(file);
  doc.getPages().forEach((page) => {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + angle) % 360));
  });
  const bytes = await doc.save();
  return {
    blob: asBlob(bytes, "application/pdf"),
    filename: `${baseName(file.name)}-rotated.pdf`,
  };
}

export async function deletePdfPages(
  file: File,
  removeZeroBased: number[],
): Promise<ConvertResult> {
  const doc = await readPdf(file);
  const total = doc.getPageCount();
  const remove = new Set(
    removeZeroBased.filter((i) => i >= 0 && i < total),
  );
  if (!remove.size) throw new Error("Select at least one page to delete.");
  if (remove.size >= total) {
    throw new Error("Keep at least one page in the PDF.");
  }
  // Remove from end so indices stay valid
  [...remove]
    .sort((a, b) => b - a)
    .forEach((i) => doc.removePage(i));
  const bytes = await doc.save();
  return {
    blob: asBlob(bytes, "application/pdf"),
    filename: `${baseName(file.name)}-edited.pdf`,
  };
}

/** Compress by rasterizing pages to JPEG and rebuilding the PDF. */
export async function compressPdf(files: File[]): Promise<ConvertResult> {
  const file = files[0];
  if (!file) throw new Error("No PDF selected");
  const pages = await renderPdfPages(file, 1.25, "image/jpeg", 0.72);
  const out = await PDFDocument.create();
  for (const page of pages) {
    const jpg = await out.embedJpg(page.bytes);
    const pdfPage = out.addPage([page.width, page.height]);
    pdfPage.drawImage(jpg, {
      x: 0,
      y: 0,
      width: page.width,
      height: page.height,
    });
  }
  const bytes = await out.save({ useObjectStreams: true });
  return {
    blob: asBlob(bytes, "application/pdf"),
    filename: `${baseName(file.name)}-compressed.pdf`,
  };
}

type RenderedPage = {
  index: number;
  width: number;
  height: number;
  bytes: Uint8Array;
  dataUrl: string;
};

async function canvasToBytes(
  canvas: HTMLCanvasElement,
  mime: "image/jpeg" | "image/png",
  quality: number,
): Promise<{ bytes: Uint8Array; dataUrl: string }> {
  const dataUrl = canvas.toDataURL(mime, quality);
  const res = await fetch(dataUrl);
  const buf = await res.arrayBuffer();
  return { bytes: new Uint8Array(buf), dataUrl };
}

export async function renderPdfPages(
  file: File,
  scale = 1.5,
  mime: "image/jpeg" | "image/png" = "image/jpeg",
  quality = 0.85,
): Promise<RenderedPage[]> {
  const { pdf } = await loadPdfJsDocument(file);
  const out: RenderedPage[] = [];

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    if (mime === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const { bytes, dataUrl } = await canvasToBytes(canvas, mime, quality);
    out.push({
      index: i - 1,
      width: viewport.width,
      height: viewport.height,
      bytes,
      dataUrl,
    });
  }
  return out;
}

export async function pdfToImages(
  files: File[],
  format: "jpg" | "png",
): Promise<ConvertResult> {
  const file = files[0];
  if (!file) throw new Error("No PDF selected");
  const mime = format === "jpg" ? "image/jpeg" : "image/png";
  const pages = await renderPdfPages(file, 2, mime, 0.9);
  const root = baseName(file.name);

  if (pages.length === 1) {
    return {
      blob: asBlob(pages[0].bytes, mime),
      filename: `${root}.${format}`,
    };
  }

  const zip = new JSZip();
  pages.forEach((p, i) => {
    zip.file(`${root}-page-${i + 1}.${format}`, p.bytes);
  });
  const blob = await zip.generateAsync({ type: "blob" });
  return { blob, filename: `${root}-${format}.zip` };
}

export async function getPdfPageCount(file: File) {
  const doc = await readPdf(file);
  return doc.getPageCount();
}

export async function getPdfPageThumbnails(file: File, scale = 0.35) {
  const pages = await renderPdfPages(file, scale, "image/jpeg", 0.7);
  return pages.map((p) => ({
    index: p.index,
    dataUrl: p.dataUrl,
    width: p.width,
    height: p.height,
  }));
}

export type OverlayItem = {
  pageIndex: number;
  /** Fractions of page size; origin top-left */
  x: number;
  y: number;
  w: number;
  h: number;
  /** PNG data URL of the overlay content */
  dataUrl: string;
};

/** Parsed PDF text run positions as fractions of the page (top-left origin). */
export type ParsedTextRun = {
  id: string;
  pageIndex: number;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Approx font size in PDF points */
  fontSize: number;
  /** CSS font stack closest to the source glyphs */
  fontFamily?: string;
  /** Detected ink color */
  color?: string;
  /** Detected background fill behind the glyphs */
  bgColor?: string;
};

export type TextEdit = {
  pageIndex: number;
  x: number;
  y: number;
  w: number;
  h: number;
  original: string;
  text: string;
  fontSize: number;
  fontFamily?: string;
  color?: string;
  bgColor?: string;
};

/** Extract selectable text runs from every page (empty for scanned/image-only PDFs). */
export async function extractPdfTextRuns(
  file: File,
): Promise<ParsedTextRun[]> {
  const { pdfjs, pdf } = await loadPdfJsDocument(file);
  const runs: ParsedTextRun[] = [];
  const transformFn =
    pdfjs.Util?.transform?.bind(pdfjs.Util) ?? multiplyTransform;

  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
    const page = await pdf.getPage(pageNo);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent({
      includeMarkedContent: true,
    });
    const pageIndex = pageNo - 1;
    let idx = 0;
    const styles = (content.styles || {}) as Record<
      string,
      { fontFamily?: string }
    >;

    for (const raw of content.items) {
      if (!raw || typeof raw !== "object" || !("str" in raw)) continue;
      const item = raw as {
        str: string;
        transform: number[];
        width: number;
        height?: number;
        fontName?: string;
        hasEOL?: boolean;
      };
      // Keep whitespace-only items that are spaces between words if needed;
      // skip pure empty / control-only strings
      const str = item.str ?? "";
      if (!str.replace(/\s/g, "").length && str.length === 0) continue;
      if (!str.trim() && str.length < 1) continue;
      if (!str.trim()) continue;

      const m = transformFn(viewport.transform, item.transform);
      const fontSize = Math.hypot(m[2], m[3]) || item.height || 12;
      const scaleX = Math.hypot(m[0], m[1]) || 1;
      const width = Math.max(
        (typeof item.width === "number" ? item.width : 0) * scaleX,
        fontSize * Math.max(str.trim().length, 1) * 0.35,
      );
      const height = Math.max(fontSize * 1.2, 8);
      const left = m[4];
      // Viewport Y grows downward; m[5] is baseline
      const top = m[5] - fontSize * 0.8;
      const style = item.fontName ? styles[item.fontName] : undefined;
      const fontFamily = mapPdfFontToCss(
        style?.fontFamily || item.fontName || "",
      );

      runs.push({
        id: `t-${pageIndex}-${idx}`,
        pageIndex,
        text: str,
        x: clamp01(left / viewport.width),
        y: clamp01(top / viewport.height),
        w: clamp01(width / viewport.width),
        h: clamp01(height / viewport.height),
        fontSize,
        fontFamily,
        color: "#111111",
        bgColor: "#ffffff",
      });
      idx += 1;
    }
  }

  return mergeNearbyTextRuns(runs);
}

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(n, 0), 1);
}

/**
 * OCR fallback for scanned / image-only PDFs.
 * Runs entirely in the browser via Tesseract.js.
 * Note: tesseract.js v7 disables blocks/hocr by default — must request `blocks: true`.
 * Large titles (e.g. certificate names) need higher raster scale + line-level boxes.
 */
export async function ocrPdfTextRuns(
  file: File,
  onProgress?: (message: string) => void,
): Promise<ParsedTextRun[]> {
  onProgress?.("Rasterizing pages for OCR…");
  // Higher scale recovers large bold titles that vanish at 2.0
  const pages = await renderPdfPages(file, 2.75, "image/png", 0.95);
  const doc = await readPdf(file);
  const pdfPages = doc.getPages();
  const { createWorker, PSM } = await import("tesseract.js");
  onProgress?.("Starting OCR engine…");
  const worker = await createWorker("eng");
  const runs: ParsedTextRun[] = [];

  try {
    // AUTO works better for mixed title + body layouts than the default
    await worker.setParameters({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tessedit_pageseg_mode: String(PSM.AUTO) as any,
    });

    for (const page of pages) {
      onProgress?.(
        `OCR page ${page.index + 1} of ${pages.length}…`,
      );
      const result = await worker.recognize(
        page.dataUrl,
        {},
        { text: true, blocks: true },
      );
      const blocks = (result.data as { blocks?: OcrBlock[] | null }).blocks ?? [];
      const lines = flattenOcrLines(blocks);
      const pdfPage = pdfPages[page.index];
      const pageH = pdfPage?.getSize().height ?? 792;
      const appearance = await loadImageElement(page.dataUrl);
      let idx = 0;
      for (const line of lines) {
        const text = (line.text || "").trim();
        if (!text) continue;
        if ((line.confidence ?? 0) < 20) continue;
        // Skip tiny noise / decorative stars
        if (text.length <= 2 && (line.confidence ?? 0) < 60) continue;
        const { x0, y0, x1, y1 } = line.bbox;
        const w = Math.max(x1 - x0, 4);
        const h = Math.max(y1 - y0, 4);
        // Ignore ultra-thin header chrome sometimes, but keep real titles
        if (h < 8 && text.length < 8) continue;
        const sampled = sampleRegionAppearance(appearance, x0, y0, w, h);
        // Skip logo / graphic marks (preserve them; don't treat as editable text)
        if (
          isLikelyLogoOrGraphic(text, sampled, w, h, page.width, page.height, {
            img: appearance,
            x0,
            y0,
            rw: w,
            rh: h,
          })
        ) {
          continue;
        }
        const isTitle =
          h / page.height > 0.018 ||
          (text === text.toUpperCase() && text.length >= 5);
        // Expand box so descenders / tall glyphs are fully covered on edit
        const expandX = isTitle ? 0.012 : 0.006;
        const expandY = isTitle ? 0.35 : 0.18;
        const nx = x0 / page.width;
        const ny = y0 / page.height;
        const nw = w / page.width;
        const nh = h / page.height;
        runs.push({
          id: `ocr-${page.index}-${idx}`,
          pageIndex: page.index,
          text,
          x: clamp01(nx - nw * expandX),
          y: clamp01(ny - nh * expandY),
          w: clamp01(nw * (1 + expandX * 2)),
          h: clamp01(nh * (1 + expandY * 2)),
          fontSize: Math.max(8, (h / page.height) * pageH * 0.85),
          fontFamily: '"Segoe UI", Calibri, Arial, Helvetica, sans-serif',
          color: sampled.color,
          bgColor: sampled.bgColor,
        });
        idx += 1;
      }
    }
  } finally {
    await worker.terminate();
  }

  // Lines are already sentence-sized; light merge only for split leftovers
  return dedupeOverlappingRuns(mergeNearbyTextRuns(runs));
}

type OcrBBox = { x0: number; y0: number; x1: number; y1: number };
type OcrWord = { text: string; confidence: number; bbox: OcrBBox };
type OcrLine = {
  words?: OcrWord[];
  text?: string;
  confidence?: number;
  bbox?: OcrBBox;
};
type OcrParagraph = { lines?: OcrLine[] };
type OcrBlock = { paragraphs?: OcrParagraph[] };

type FlatOcrLine = {
  text: string;
  confidence: number;
  bbox: OcrBBox;
};

/** Prefer full lines so titles like "ANSHUL BAHADURE" stay one editable block. */
function flattenOcrLines(blocks: OcrBlock[]): FlatOcrLine[] {
  const lines: FlatOcrLine[] = [];
  for (const block of blocks) {
    for (const para of block.paragraphs ?? []) {
      for (const line of para.lines ?? []) {
        const words = line.words ?? [];
        const text =
          (line.text || "").trim() ||
          words
            .map((w) => w.text)
            .join(" ")
            .trim();
        if (!text) continue;
        let bbox = line.bbox;
        if (!bbox && words.length) {
          bbox = {
            x0: Math.min(...words.map((w) => w.bbox.x0)),
            y0: Math.min(...words.map((w) => w.bbox.y0)),
            x1: Math.max(...words.map((w) => w.bbox.x1)),
            y1: Math.max(...words.map((w) => w.bbox.y1)),
          };
        }
        if (!bbox) continue;
        const confidence =
          typeof line.confidence === "number"
            ? line.confidence
            : words.length
              ? words.reduce((s, w) => s + (w.confidence || 0), 0) /
                words.length
              : 0;
        lines.push({ text, confidence, bbox });
      }
    }
  }
  return lines;
}

function isLikelyLogoOrGraphic(
  text: string,
  sampled: { color: string; bgColor: string; bold: boolean },
  w: number,
  h: number,
  pageW: number,
  pageH: number,
  region?: {
    img: HTMLImageElement;
    x0: number;
    y0: number;
    rw: number;
    rh: number;
  },
) {
  const t = text.replace(/\s+/g, " ").trim();
  // OCR often reads the Microsoft mark as "B® Microsoft" / "BS Microsoft" / similar
  if (/^[b®*+\-\s0-9]*microsoft\b/i.test(t) && t.length < 28) return true;
  if (/^microsoft\s*$/i.test(t)) return true;
  if (/\bmicrosoft\b/i.test(t) && region && regionHasMicrosoftLogoColors(region)) {
    return true;
  }
  // Very square colorful marks
  const aspect = w / Math.max(h, 1);
  if (aspect < 2.2 && h / pageH > 0.04 && t.length <= 12) {
    const c = parseHexColor(sampled.color);
    const sat = Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b);
    if (sat > 0.2) return true;
  }
  return false;
}

/** Detect the 4-color Microsoft logo squares in a crop. */
function regionHasMicrosoftLogoColors(region: {
  img: HTMLImageElement;
  x0: number;
  y0: number;
  rw: number;
  rh: number;
}) {
  const canvas = document.createElement("canvas");
  const tw = Math.max(1, Math.min(120, Math.ceil(region.rw)));
  const th = Math.max(1, Math.min(80, Math.ceil(region.rh)));
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return false;
  ctx.drawImage(
    region.img,
    region.x0,
    region.y0,
    region.rw,
    region.rh,
    0,
    0,
    tw,
    th,
  );
  const { data } = ctx.getImageData(0, 0, tw, th);
  // Approx brand tile colors
  const targets = [
    [246, 83, 20],
    [127, 186, 0],
    [0, 164, 239],
    [255, 185, 0],
  ];
  let hits = 0;
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    for (const [tr, tg, tb] of targets) {
      if (
        Math.abs(r - tr) < 45 &&
        Math.abs(g - tg) < 45 &&
        Math.abs(b - tb) < 45
      ) {
        hits += 1;
        break;
      }
    }
  }
  return hits > 12;
}

/** Drop overlapping OCR boxes that fight each other (causes double/ghost text). */
function dedupeOverlappingRuns(runs: ParsedTextRun[]): ParsedTextRun[] {
  const sorted = [...runs].sort(
    (a, b) => b.w * b.h - a.w * a.h || b.text.length - a.text.length,
  );
  const kept: ParsedTextRun[] = [];
  for (const run of sorted) {
    const overlaps = kept.some((k) => {
      if (k.pageIndex !== run.pageIndex) return false;
      const x1 = Math.max(k.x, run.x);
      const y1 = Math.max(k.y, run.y);
      const x2 = Math.min(k.x + k.w, run.x + run.w);
      const y2 = Math.min(k.y + k.h, run.y + run.h);
      const iw = Math.max(0, x2 - x1);
      const ih = Math.max(0, y2 - y1);
      const inter = iw * ih;
      const smaller = Math.min(k.w * k.h, run.w * run.h);
      return smaller > 0 && inter / smaller > 0.45;
    });
    if (!overlaps) kept.push(run);
  }
  return kept.sort((a, b) => a.pageIndex - b.pageIndex || a.y - b.y || a.x - b.x);
}

/** Native text layer first; OCR if the PDF has no selectable text. */
export async function extractOrOcrPdfTextRuns(
  file: File,
  onProgress?: (message: string, step?: string) => void,
): Promise<{ runs: ParsedTextRun[]; source: "text-layer" | "ocr" | "none" }> {
  onProgress?.("Looking for a selectable text layer…", "parse");
  let runs: ParsedTextRun[] = [];
  try {
    runs = await extractPdfTextRuns(file);
  } catch {
    runs = [];
  }
  if (runs.length) {
    onProgress?.(`Found ${runs.length} text blocks`, "parse");
    return { runs, source: "text-layer" };
  }
  try {
    onProgress?.("No text layer — starting OCR…", "ocr");
    const ocrRuns = await ocrPdfTextRuns(file, (msg) =>
      onProgress?.(msg, "ocr"),
    );
    if (ocrRuns.length) {
      onProgress?.(`OCR found ${ocrRuns.length} lines`, "ocr");
      return { runs: ocrRuns, source: "ocr" };
    }
  } catch {
    // OCR unavailable / failed
  }
  return { runs: [], source: "none" };
}

/** Merge adjacent runs on the same line so editing feels like real sentences. */
function mergeNearbyTextRuns(runs: ParsedTextRun[]): ParsedTextRun[] {
  const byPage = new Map<number, ParsedTextRun[]>();
  for (const r of runs) {
    const list = byPage.get(r.pageIndex) ?? [];
    list.push(r);
    byPage.set(r.pageIndex, list);
  }

  const merged: ParsedTextRun[] = [];
  for (const [pageIndex, list] of byPage) {
    const sorted = [...list].sort((a, b) => a.y - b.y || a.x - b.x);
    const pageMerged: ParsedTextRun[] = [];
    let current: ParsedTextRun | null = null;

    for (const run of sorted) {
      if (!current) {
        current = { ...run };
        continue;
      }
      const sameLine =
        Math.abs(current.y - run.y) < Math.max(current.h, run.h) * 0.65;
      const gap = run.x - (current.x + current.w);
      // Large title glyphs (names) need a wider merge gap
      const maxGap = Math.max(current.h, run.h) * 1.35;
      const close = gap >= -0.02 && gap < maxGap;
      if (sameLine && close) {
        const right = Math.max(current.x + current.w, run.x + run.w);
        const bottom = Math.max(current.y + current.h, run.y + run.h);
        const left = Math.min(current.x, run.x);
        const top = Math.min(current.y, run.y);
        let joiner = "";
        if (
          !current.text.endsWith(" ") &&
          !run.text.startsWith(" ") &&
          gap > 0.002
        ) {
          joiner = " ";
        }
        current = {
          ...current,
          text: current.text + joiner + run.text,
          x: left,
          y: top,
          w: right - left,
          h: bottom - top,
          fontSize: Math.max(current.fontSize, run.fontSize),
          fontFamily: current.fontFamily || run.fontFamily,
          color: current.color || run.color,
          bgColor: current.bgColor || run.bgColor,
        };
      } else {
        pageMerged.push(current);
        current = { ...run };
      }
    }
    if (current) pageMerged.push(current);
    pageMerged.forEach((r, i) => {
      merged.push({ ...r, id: `t-${pageIndex}-${i}` });
    });
  }
  return merged;
}

function parseHexColor(hex: string) {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return { r: 0, g: 0, b: 0 };
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255,
  };
}

function rgbToHex(r: number, g: number, b: number) {
  const to = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** Map PDF / pdf.js font names to a close CSS stack. */
export function mapPdfFontToCss(name: string) {
  const n = (name || "").toLowerCase();
  const bold =
    n.includes("bold") || n.includes("black") || n.includes("heavy");
  const weight = bold ? "bold " : "";
  if (
    n.includes("times") ||
    n.includes("georgia") ||
    n.includes("garamond") ||
    n.includes("serif")
  ) {
    return `${weight}Georgia, "Times New Roman", Times, serif`;
  }
  if (
    n.includes("courier") ||
    n.includes("mono") ||
    n.includes("consolas")
  ) {
    return `${weight}"Courier New", Courier, monospace`;
  }
  if (n.includes("segoe")) {
    return bold
      ? '"Segoe UI Semibold", "Segoe UI", Calibri, Arial, sans-serif'
      : '"Segoe UI", Calibri, Arial, Helvetica, sans-serif';
  }
  if (n.includes("calibri") || n.includes("carlito")) {
    return `${weight}Calibri, Carlito, Arial, sans-serif`;
  }
  // Default: modern sans (covers Helvetica / Arial / unknown CID fonts)
  return bold
    ? "Arial Bold, Arial, Helvetica, sans-serif"
    : "Arial, Helvetica, sans-serif";
}

function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load page image"));
    img.src = src;
  });
}

/** Sample ink + background colors from a page region (pixel space). */
function sampleRegionAppearance(
  img: HTMLImageElement,
  x0: number,
  y0: number,
  w: number,
  h: number,
) {
  const canvas = document.createElement("canvas");
  const tw = Math.max(1, Math.ceil(w));
  const th = Math.max(1, Math.ceil(h));
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return { color: "#111111", bgColor: "#ffffff", bold: false };
  }
  ctx.drawImage(img, x0, y0, w, h, 0, 0, tw, th);
  const { data } = ctx.getImageData(0, 0, tw, th);
  const lumas: number[] = [];
  const pixels: { r: number; g: number; b: number; L: number }[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 200) continue;
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    lumas.push(L);
    pixels.push({ r, g, b, L });
  }
  if (!pixels.length) {
    return { color: "#111111", bgColor: "#ffffff", bold: false };
  }
  lumas.sort((a, b) => a - b);
  const bgCut = lumas[Math.floor(lumas.length * 0.85)] ?? 240;
  const inkCut = lumas[Math.floor(lumas.length * 0.25)] ?? 40;
  let bgR = 0;
  let bgG = 0;
  let bgB = 0;
  let bgN = 0;
  let inkR = 0;
  let inkG = 0;
  let inkB = 0;
  let inkN = 0;
  for (const p of pixels) {
    if (p.L >= bgCut) {
      bgR += p.r;
      bgG += p.g;
      bgB += p.b;
      bgN += 1;
    }
    if (p.L <= inkCut) {
      inkR += p.r;
      inkG += p.g;
      inkB += p.b;
      inkN += 1;
    }
  }
  const bgColor =
    bgN > 0
      ? rgbToHex(bgR / bgN, bgG / bgN, bgB / bgN)
      : "#ffffff";
  const color =
    inkN > 0
      ? rgbToHex(inkR / inkN, inkG / inkN, inkB / inkN)
      : "#111111";
  // Rough bold heuristic: share of dark pixels
  const bold = inkN / pixels.length > 0.28;
  return { color, bgColor, bold };
}

/**
 * Draw text fitted to a box using the original string as a metrics reference
 * (size from box height, letter-spacing from original width). This keeps edits
 * visually close to certificate / brand typography instead of a random CSS font size.
 */
export async function drawFittedText(
  ctx: CanvasRenderingContext2D,
  opts: {
    text: string;
    /** Original OCR/source string — used to lock spacing/size to the page */
    originalText: string;
    boxW: number;
    boxH: number;
    color: string;
    fontFamily?: string;
    bold?: boolean;
  },
) {
  const family =
    opts.fontFamily && opts.fontFamily.trim()
      ? opts.fontFamily.includes(",")
        ? opts.fontFamily
        : `"${opts.fontFamily}", "Segoe UI", Calibri, Arial, sans-serif`
      : '"Segoe UI", Calibri, Arial, Helvetica, sans-serif';
  const weight = opts.bold ? "700" : "400";
  await document.fonts.ready.catch(() => undefined);
  await document.fonts
    .load(`${weight} ${Math.round(opts.boxH)}px "Segoe UI"`)
    .catch(() => undefined);

  // Natural metrics — no letter-spacing stretch (that looked mono/blocky)
  let size = Math.max(8, opts.boxH * 0.7);
  const applyFont = (s: number) => {
    ctx.font = `${weight} ${s}px ${family}`;
    try {
      (
        ctx as CanvasRenderingContext2D & { letterSpacing: string }
      ).letterSpacing = "0px";
    } catch {
      /* ignore */
    }
  };

  applyFont(size);
  let guard = 0;
  while (ctx.measureText(opts.text || " ").width > opts.boxW * 0.98 && size > 7) {
    size *= 0.96;
    applyFont(size);
    guard += 1;
    if (guard > 50) break;
  }

  ctx.fillStyle = opts.color || "#111111";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(opts.text || " ", 2, opts.boxH / 2);
  return { size, spacing: 0, family, weight };
}

/**
 * Rasterize an edit patch from the original page pixels.
 * Only ink-like (dark/gray) pixels are cleared — logos and colored graphics in the
 * same region are preserved so nearby badges/marks don't disappear on export.
 */
async function renderEditPatchPng(opts: {
  pageImg: HTMLImageElement;
  /** pixel crop on pageImg */
  x0: number;
  y0: number;
  w: number;
  h: number;
  text: string;
  originalText?: string;
  fontFamily: string;
  color: string;
  bgColor: string;
  bold?: boolean;
}) {
  const scale = 2;
  const srcW = Math.max(2, Math.ceil(opts.w));
  const srcH = Math.max(2, Math.ceil(opts.h));
  const W = srcW * scale;
  const H = srcH * scale;

  const base = document.createElement("canvas");
  base.width = srcW;
  base.height = srcH;
  const bctx = base.getContext("2d", { willReadFrequently: true });
  if (!bctx) throw new Error("Canvas not supported");
  bctx.drawImage(
    opts.pageImg,
    opts.x0,
    opts.y0,
    opts.w,
    opts.h,
    0,
    0,
    srcW,
    srcH,
  );
  const image = bctx.getImageData(0, 0, srcW, srcH);
  const { data } = image;
  const bg = parseHexColor(opts.bgColor || "#ffffff");
  const bgR = Math.round(bg.r * 255);
  const bgG = Math.round(bg.g * 255);
  const bgB = Math.round(bg.b * 255);

  // Near-white certificate backgrounds: solid fill (anti-aliased ink ghosts otherwise).
  // Colored/busy regions: ink-only clear so logos nearby stay intact.
  const bgL = 0.2126 * bgR + 0.7152 * bgG + 0.0722 * bgB;
  const solidCover = bgL > 220;
  if (solidCover) {
    bctx.fillStyle = `rgb(${bgR},${bgG},${bgB})`;
    bctx.fillRect(0, 0, srcW, srcH);
  } else {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 20) continue;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      // Include gray anti-alias fringes so originals don't ghost
      const isInk = L < 200 && sat < 0.35;
      if (isInk) {
        data[i] = bgR;
        data[i + 1] = bgG;
        data[i + 2] = bgB;
        data[i + 3] = 255;
      }
    }
    bctx.putImageData(image, 0, 0);
  }

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(base, 0, 0, W, H);

  await drawFittedText(ctx, {
    text: opts.text,
    originalText: opts.originalText || opts.text,
    boxW: W,
    boxH: H,
    color: opts.color || "#111111",
    fontFamily: opts.fontFamily,
    bold: opts.bold ?? true,
  });

  return canvas.toDataURL("image/png");
}

/** Bake text replacements + image overlays. No watermark is applied. */
export async function bakeOverlaysOntoPdf(
  file: File,
  overlays: OverlayItem[],
  textEdits: TextEdit[] = [],
): Promise<ConvertResult> {
  const doc = await readPdf(file);
  const pages = doc.getPages();

  const dirty = textEdits.filter((e) => e.text !== e.original);
  // Always rasterize when baking text so we can patch from original pixels
  const pageRasters =
    dirty.length > 0
      ? await renderPdfPages(file, 2.5, "image/png", 0.95)
      : [];
  const pageImgs = await Promise.all(
    pageRasters.map((p) => loadImageElement(p.dataUrl)),
  );

  for (const edit of dirty) {
    const page = pages[edit.pageIndex];
    if (!page) continue;
    const { width: pageW, height: pageH } = page.getSize();
    // Use the (already expanded) edit box as-is — don't shrink or ghost remains
    const ex = edit.x;
    const ey = edit.y;
    const ew = Math.max(edit.w, 0.01);
    const eh = Math.max(edit.h, 0.008);

    const x = ex * pageW;
    const y = (1 - ey - eh) * pageH;
    const w = Math.max(ew * pageW, 4);
    const h = Math.max(eh * pageH, 4);

    let color = edit.color || "#111111";
    let bgColor = edit.bgColor || "#ffffff";
    const fontFamily =
      edit.fontFamily ||
      '"Segoe UI", Calibri, Arial, Helvetica, sans-serif';
    const looksName =
      (edit.original || edit.text || "").trim() ===
        (edit.original || edit.text || "").trim().toUpperCase() &&
      (edit.original || edit.text || "").trim().length >= 5;

    const raster = pageRasters[edit.pageIndex];
    const img = pageImgs[edit.pageIndex];
    if (!img || !raster) continue;

    const px0 = ex * raster.width;
    const py0 = ey * raster.height;
    const pw = ew * raster.width;
    const ph = eh * raster.height;

    const sampled = sampleRegionAppearance(img, px0, py0, pw, ph);
    if (!edit.color) color = sampled.color;
    if (!edit.bgColor) bgColor = sampled.bgColor;

    const dataUrl = await renderEditPatchPng({
      pageImg: img,
      x0: px0,
      y0: py0,
      w: pw,
      h: ph,
      text: edit.text,
      originalText: edit.original,
      fontFamily,
      color,
      bgColor,
      bold: looksName || sampled.bold,
    });
    const pngBytes = dataUrlToBytes(dataUrl);
    const embedded = await doc.embedPng(pngBytes);
    page.drawImage(embedded, {
      x,
      y,
      width: w,
      height: h,
    });
  }

  for (const item of overlays) {
    const page = pages[item.pageIndex];
    if (!page) continue;
    const { width: pageW, height: pageH } = page.getSize();
    const pngBytes = dataUrlToBytes(item.dataUrl);
    const img = await doc.embedPng(pngBytes);
    const drawW = item.w * pageW;
    const drawH = item.h * pageH;
    page.drawImage(img, {
      x: item.x * pageW,
      y: (1 - item.y - item.h) * pageH,
      width: drawW,
      height: drawH,
    });
  }

  const bytes = await doc.save();
  return {
    blob: asBlob(bytes, "application/pdf"),
    filename: `${baseName(file.name)}-edited.pdf`,
  };
}

function dataUrlToBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1];
  if (!base64) throw new Error("Invalid image data");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function compressImageFile(files: File[]): Promise<ConvertResult> {
  const file = files[0];
  if (!file) throw new Error("No image selected");
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not read image"));
      el.src = url;
    });
    const canvas = document.createElement("canvas");
    const max = 1920;
    const ratio = Math.min(1, max / Math.max(img.width, img.height));
    canvas.width = Math.max(1, Math.round(img.width * ratio));
    canvas.height = Math.max(1, Math.round(img.height * ratio));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Compress failed"))),
        "image/jpeg",
        0.75,
      );
    });
    return {
      blob,
      filename: `${baseName(file.name)}-compressed.jpg`,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}
