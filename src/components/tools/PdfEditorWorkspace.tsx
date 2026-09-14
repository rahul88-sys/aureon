"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import {
  bakeOverlaysOntoPdf,
  drawFittedText,
  extractOrOcrPdfTextRuns,
  type OverlayItem,
  type ParsedTextRun,
  type TextEdit,
  renderPdfPages,
} from "@/lib/pdf-ops";
import {
  ProcessSteps,
  type ProcessStep,
} from "@/components/tools/ProcessSteps";
import { EditorToolbar } from "@/components/tools/EditorToolbar";
import { cn } from "@/lib/utils";

type Mode = "select" | "text" | "draw" | "sign" | "image";

const LOAD_STEPS: ProcessStep[] = [
  { id: "open", label: "Reading your file" },
  { id: "render", label: "Rendering page preview" },
  { id: "parse", label: "Detecting selectable text" },
  { id: "ocr", label: "Running OCR on image text" },
  { id: "ready", label: "Ready to edit" },
];

type Overlay = {
  id: string;
  pageIndex: number;
  kind: "text" | "signature" | "image" | "ink";
  /** fraction of page width/height from top-left */
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  fontFamily?: string;
  color?: string;
  dataUrl?: string;
};

type EditableRun = ParsedTextRun & {
  original: string;
  dirty: boolean;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function renderTextPng(
  text: string,
  fontFamily: string,
  color: string,
  fontPx: number,
) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  // fontFamily may already be a CSS stack — don't wrap in extra quotes
  const fontCss = fontFamily.includes(",")
    ? fontFamily
    : `"${fontFamily}", "Segoe UI", Arial, sans-serif`;
  await document.fonts.load(`${fontPx}px ${fontCss}`).catch(() => undefined);
  ctx.font = `${fontPx}px ${fontCss}`;
  const metrics = ctx.measureText(text || " ");
  const padX = Math.max(4, Math.round(fontPx * 0.12));
  const padY = Math.max(2, Math.round(fontPx * 0.08));
  canvas.width = Math.ceil(metrics.width + padX * 2);
  canvas.height = Math.ceil(fontPx * 1.25 + padY * 2);
  const ctx2 = canvas.getContext("2d");
  if (!ctx2) throw new Error("Canvas not supported");
  ctx2.font = `${fontPx}px ${fontCss}`;
  ctx2.fillStyle = color;
  ctx2.textBaseline = "middle";
  ctx2.fillText(text || " ", padX, canvas.height / 2);
  return canvas.toDataURL("image/png");
}

const DEFAULT_EDIT_FONT =
  '"Segoe UI", Calibri, Arial, Helvetica, sans-serif';
const DEFAULT_SIGN_FONT = '"Great Vibes", cursive';

/** Match certificate-style names (ALL CAPS / large) vs body copy. */
function editTypeForRun(run: { original?: string; text?: string; h: number }) {
  const t = (run.original || run.text || "").trim();
  const isNameLike =
    t.length >= 5 &&
    t === t.toUpperCase() &&
    /[A-Z]/.test(t) &&
    !/[a-z]/.test(t);
  // Microsoft Learn credential names are bold condensed sans, not mono/Jakarta
  if (isNameLike || run.h > 0.028) {
    return {
      fontFamily: DEFAULT_EDIT_FONT,
      fontWeight: 700 as const,
      sizeFactor: 0.7,
    };
  }
  return {
    fontFamily: DEFAULT_EDIT_FONT,
    fontWeight: 400 as const,
    sizeFactor: 0.72,
  };
}

function nearestTextRun(
  nx: number,
  ny: number,
  runs: EditableRun[],
  pageIndex: number,
) {
  let best: EditableRun | null = null;
  let bestScore = Infinity;
  for (const r of runs) {
    if (r.pageIndex !== pageIndex) continue;
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const sameLine = Math.abs(cy - ny) <= Math.max(r.h * 0.85, 0.02);
    // Prefer same-line neighbors (e.g. type right after "Microsoft")
    const score = sameLine
      ? Math.abs(r.x + r.w - nx) * 0.35 + Math.abs(cy - ny) * 2
      : Math.hypot(cx - nx, cy - ny) + 0.5;
    if (score < bestScore) {
      bestScore = score;
      best = r;
    }
  }
  return best;
}

export function PdfEditorWorkspace({
  mode: initialMode = "edit",
}: {
  mode?: "edit" | "sign";
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const pageWrapRef = useRef<HTMLDivElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<{ index: number; dataUrl: string }[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [textRuns, setTextRuns] = useState<EditableRun[]>([]);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<Mode>(
    initialMode === "sign" ? "sign" : "select",
  );
  const [textValue, setTextValue] = useState("Your text");
  const [signValue, setSignValue] = useState("");
  const [fontFamily, setFontFamily] = useState(
    initialMode === "sign" ? DEFAULT_SIGN_FONT : DEFAULT_EDIT_FONT,
  );
  const [color, setColor] = useState("#111111");
  const [drawing, setDrawing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    url: string;
    filename: string;
  } | null>(null);
  const [textSource, setTextSource] = useState<
    "text-layer" | "ocr" | "none" | null
  >(null);
  const [status, setStatus] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [doneSteps, setDoneSteps] = useState<Set<string>>(new Set());
  const [stepDetail, setStepDetail] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [bold, setBold] = useState(false);
  const [fontSizeUi, setFontSizeUi] = useState(16);
  const [clipboard, setClipboard] = useState("");
  const [past, setPast] = useState<
    { textRuns: EditableRun[]; overlays: Overlay[] }[]
  >([]);
  const [future, setFuture] = useState<
    { textRuns: EditableRun[]; overlays: Overlay[] }[]
  >([]);
  const skipHistory = useRef(false);

  const pushHistory = useCallback(() => {
    if (skipHistory.current) return;
    setPast((p) =>
      [
        ...p,
        {
          textRuns: structuredClone(textRuns),
          overlays: structuredClone(overlays),
        },
      ].slice(-50),
    );
    setFuture([]);
  }, [textRuns, overlays]);

  const undo = useCallback(() => {
    setPast((p) => {
      if (!p.length) return p;
      const prev = p[p.length - 1];
      setFuture((f) => [
        {
          textRuns: structuredClone(textRuns),
          overlays: structuredClone(overlays),
        },
        ...f,
      ].slice(0, 50));
      skipHistory.current = true;
      setTextRuns(prev.textRuns);
      setOverlays(prev.overlays);
      queueMicrotask(() => {
        skipHistory.current = false;
      });
      return p.slice(0, -1);
    });
  }, [textRuns, overlays]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (!f.length) return f;
      const [next, ...rest] = f;
      setPast((p) =>
        [
          ...p,
          {
            textRuns: structuredClone(textRuns),
            overlays: structuredClone(overlays),
          },
        ].slice(-50),
      );
      skipHistory.current = true;
      setTextRuns(next.textRuns);
      setOverlays(next.overlays);
      queueMicrotask(() => {
        skipHistory.current = false;
      });
      return rest;
    });
  }, [textRuns, overlays]);

  const activeRun = useMemo(
    () => textRuns.find((r) => r.id === activeRunId) ?? null,
    [textRuns, activeRunId],
  );

  useEffect(() => {
    if (!activeRun) return;
    setFontFamily(
      activeRun.fontFamily || DEFAULT_EDIT_FONT,
    );
    setColor(activeRun.color || "#111111");
    setFontSizeUi(activeRun.fontSize || 16);
    setBold(/semibold|bold/i.test(activeRun.fontFamily || ""));
  }, [activeRunId]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyRunStyle = (patch: Partial<EditableRun>) => {
    if (!activeRunId) return;
    pushHistory();
    setTextRuns((prev) =>
      prev.map((r) => {
        if (r.id !== activeRunId) return r;
        const next = { ...r, ...patch };
        next.dirty = next.text !== next.original;
        return next;
      }),
    );
  };

  const copySelection = async () => {
    const text = activeRun?.text || "";
    if (!text) return;
    setClipboard(text);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  };

  const cutSelection = async () => {
    if (!activeRun) return;
    await copySelection();
    pushHistory();
    setTextRuns((prev) =>
      prev.map((r) =>
        r.id === activeRun.id
          ? { ...r, text: "", dirty: "" !== r.original }
          : r,
      ),
    );
  };

  const pasteSelection = async () => {
    let text = clipboard;
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) text = clip;
    } catch {
      /* use local clipboard */
    }
    if (!activeRunId || !text) return;
    pushHistory();
    setTextRuns((prev) =>
      prev.map((r) =>
        r.id === activeRunId
          ? { ...r, text, dirty: text !== r.original }
          : r,
      ),
    );
  };

  const markStep = (id: string, detail?: string) => {
    setActiveStep(id);
    setStepDetail(detail ?? null);
    setDoneSteps((prev) => {
      const order = LOAD_STEPS.map((s) => s.id);
      const idx = order.indexOf(id);
      const next = new Set(prev);
      for (let i = 0; i < idx; i += 1) next.add(order[i]);
      return next;
    });
  };

  const completeStep = (id: string) => {
    setDoneSteps((prev) => new Set(prev).add(id));
  };

  const pageOverlays = useMemo(
    () => overlays.filter((o) => o.pageIndex === pageIndex),
    [overlays, pageIndex],
  );

  const pageRuns = useMemo(
    () => textRuns.filter((r) => r.pageIndex === pageIndex),
    [textRuns, pageIndex],
  );

  const dirtyCount = useMemo(
    () => textRuns.filter((r) => r.dirty && r.text !== r.original).length,
    [textRuns],
  );

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result?.url]);

  const loadFile = async (next: File | null) => {
    setError(null);
    setStatus(null);
    setTextSource(null);
    setActiveStep(null);
    setDoneSteps(new Set());
    setStepDetail(null);
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);
    setOverlays([]);
    setTextRuns([]);
    setActiveRunId(null);
    setSelectedId(null);
    setPageIndex(0);
    setFile(next);
    setPages([]);
    if (!next) return;
    setLoading(true);
    try {
      markStep("open", next.name);
      await new Promise((r) => setTimeout(r, 280));
      completeStep("open");

      markStep("render", "Building a crisp page preview…");
      const rendered = await renderPdfPages(next, 1.6, "image/jpeg", 0.88);
      setPages(
        rendered.map((p) => ({ index: p.index, dataUrl: p.dataUrl })),
      );
      completeStep("render");

      markStep("parse", "Checking for a native text layer…");
      let usedOcr = false;
      const { runs, source } = await extractOrOcrPdfTextRuns(
        next,
        (msg, step) => {
          if (step === "ocr") {
            usedOcr = true;
            markStep("ocr", msg);
          } else if (step === "parse") {
            markStep("parse", msg);
          } else {
            setStepDetail(msg);
          }
          setStatus(msg);
        },
      );
      completeStep("parse");
      if (usedOcr || source === "ocr") completeStep("ocr");
      else {
        // Skip OCR step visually when text layer exists
        setDoneSteps((prev) => {
          const nextSet = new Set(prev);
          nextSet.add("ocr");
          return nextSet;
        });
      }

      setTextSource(source);
      setTextRuns(
        runs.map((r) => ({
          ...r,
          original: r.text,
          dirty: false,
        })),
      );

      markStep("ready");
      completeStep("ready");
      setActiveStep(null);

      if (source === "ocr") {
        setStatus(
          `OCR found ${runs.length} text block${runs.length === 1 ? "" : "s"}. Click highlighted text to edit.`,
        );
      } else if (source === "text-layer") {
        setStatus(
          `Parsed ${runs.length} text block${runs.length === 1 ? "" : "s"}. Click highlighted text to edit.`,
        );
      } else if (initialMode === "edit") {
        setError(
          "This PDF has no readable text (image-only / failed OCR). You can still add text, draw, or sign.",
        );
        setStatus(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open PDF.");
      setFile(null);
      setActiveStep(null);
    } finally {
      setLoading(false);
    }
  };

  const visibleSteps = useMemo(() => {
    // Always show the pipeline; OCR may complete instantly as skipped
    return LOAD_STEPS.map((s) =>
      s.id === activeStep && stepDetail ? { ...s, detail: stepDetail } : s,
    );
  }, [activeStep, stepDetail]);

  const syncDrawCanvas = useCallback(() => {
    const canvas = drawCanvasRef.current;
    const wrap = pageWrapRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, [color, pages, pageIndex]);

  useEffect(() => {
    syncDrawCanvas();
  }, [syncDrawCanvas]);

  const addTextAt = async (nx: number, ny: number) => {
    const isSign = tool === "sign";
    const content = (isSign ? signValue : textValue).trim();
    if (!content) {
      setError(isSign ? "Type your signature first." : "Enter some text.");
      return;
    }

    // Match nearby existing text so placed words share size/spacing/font
    const neighbor = !isSign
      ? nearestTextRun(nx, ny, textRuns, pageIndex)
      : null;

    const matchedFont =
      neighbor?.fontFamily ||
      (isSign ? fontFamily || DEFAULT_SIGN_FONT : DEFAULT_EDIT_FONT);
    const matchedColor = neighbor?.color || color || "#111111";
    const wrap = pageWrapRef.current;
    if (!wrap) return;
    const pw = wrap.clientWidth;
    const ph = wrap.clientHeight;

    // Build overlay sized like the neighbor, with fitted Segoe metrics
    let w: number;
    let h: number;
    if (neighbor && Math.abs(neighbor.y + neighbor.h / 2 - ny) < neighbor.h * 1.2) {
      h = neighbor.h * 0.95;
      w = Math.min(0.45, Math.max(neighbor.w * 0.85, 0.08));
    } else {
      h = 0.028;
      w = 0.18;
    }

    const canvas = document.createElement("canvas");
    const dpr = 2;
    canvas.width = Math.max(8, Math.round(w * pw * dpr));
    canvas.height = Math.max(8, Math.round(h * ph * dpr));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    const boxW = canvas.width / dpr;
    const boxH = canvas.height / dpr;
    if (!isSign) {
      ctx.fillStyle = neighbor?.bgColor || "#ffffff";
      ctx.fillRect(0, 0, boxW, boxH);
    }
    await drawFittedText(ctx, {
      text: content,
      originalText: neighbor?.original || neighbor?.text || content,
      boxW,
      boxH,
      color: matchedColor,
      fontFamily: isSign ? matchedFont : DEFAULT_EDIT_FONT,
      bold: !isSign,
    });
    const dataUrl = canvas.toDataURL("image/png");

    setFontFamily(matchedFont);
    setColor(matchedColor);

    const x = neighbor
      ? Math.min(neighbor.x + neighbor.w + 0.006, Math.max(0, 1 - w))
      : Math.min(Math.max(0, nx - w / 2), 1 - w);
    const y = neighbor
      ? neighbor.y + Math.max(0, (neighbor.h - h) / 2)
      : Math.min(Math.max(0, ny - h / 2), 1 - h);

    pushHistory();
    const overlay: Overlay = {
      id: uid(),
      pageIndex,
      kind: isSign ? "signature" : "text",
      x,
      y,
      w,
      h,
      text: content,
      fontFamily: isSign ? matchedFont : DEFAULT_EDIT_FONT,
      color: matchedColor,
      dataUrl,
    };
    setOverlays((prev) => [...prev, overlay]);
    setSelectedId(overlay.id);
    setTool("select");
  };

  const addImageFile = async (imageFile: File) => {
    const dataUrl = await fileToDataUrl(imageFile);
    const img = await loadImg(dataUrl);
    const wrap = pageWrapRef.current;
    const pw = wrap?.clientWidth || 600;
    const w = Math.min(0.4, img.width / pw);
    const h = (img.height / img.width) * w;
    const overlay: Overlay = {
      id: uid(),
      pageIndex,
      kind: "image",
      x: 0.3,
      y: 0.3,
      w,
      h,
      dataUrl,
    };
    setOverlays((prev) => [...prev, overlay]);
    setSelectedId(overlay.id);
    setTool("select");
  };

  const onPageClick = async (e: React.MouseEvent) => {
    if (tool !== "text" && tool !== "sign") return;
    const wrap = pageWrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    await addTextAt(nx, ny);
  };

  const onDrawStart = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool !== "draw") return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    setDrawing(true);
    canvas.setPointerCapture(e.pointerId);
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const onDrawMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing || tool !== "draw") return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const onDrawEnd = () => {
    if (!drawing) return;
    setDrawing(false);
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    // Only keep if something was drawn (non-empty-ish)
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const sample = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let painted = false;
    for (let i = 3; i < sample.length; i += 16) {
      if (sample[i] > 0) {
        painted = true;
        break;
      }
    }
    if (!painted) return;
    const overlay: Overlay = {
      id: uid(),
      pageIndex,
      kind: "ink",
      x: 0,
      y: 0,
      w: 1,
      h: 1,
      dataUrl,
    };
    setOverlays((prev) => [...prev, overlay]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTool("select");
  };

  const moveOverlay = (id: string, dx: number, dy: number) => {
    setOverlays((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        return {
          ...o,
          x: Math.min(Math.max(0, o.x + dx), 1 - o.w),
          y: Math.min(Math.max(0, o.y + dy), 1 - o.h),
        };
      }),
    );
  };

  const removeSelected = () => {
    pushHistory();
    if (selectedId) {
      setOverlays((prev) => prev.filter((o) => o.id !== selectedId));
      setSelectedId(null);
      return;
    }
    if (activeRunId) {
      setTextRuns((prev) => prev.filter((r) => r.id !== activeRunId));
      setActiveRunId(null);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (key === "y" || (key === "z" && e.shiftKey)) {
        e.preventDefault();
        redo();
      } else if (key === "s") {
        e.preventDefault();
        void exportPdf();
      } else if (key === "c") {
        if (activeRunId) {
          e.preventDefault();
          void copySelection();
        }
      } else if (key === "x") {
        if (activeRunId) {
          e.preventDefault();
          void cutSelection();
        }
      } else if (key === "v") {
        if (activeRunId) {
          e.preventDefault();
          void pasteSelection();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const exportPdf = async () => {
    if (!file) {
      setError("Open a PDF first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const items: OverlayItem[] = overlays
        .filter((o) => o.dataUrl)
        .map((o) => ({
          pageIndex: o.pageIndex,
          x: o.x,
          y: o.y,
          w: o.w,
          h: o.h,
          dataUrl: o.dataUrl!,
        }));

      const edits: TextEdit[] = textRuns
        .filter((r) => r.dirty && r.text !== r.original)
        .map((r) => ({
          pageIndex: r.pageIndex,
          x: r.x,
          y: r.y,
          w: Math.max(r.w, 0.02),
          h: Math.max(r.h, 0.015),
          original: r.original,
          text: r.text,
          fontSize: r.fontSize,
          fontFamily: r.fontFamily,
          color: r.color,
          bgColor: r.bgColor,
        }));

      const out = await bakeOverlaysOntoPdf(file, items, edits);
      if (result?.url) URL.revokeObjectURL(result.url);
      setResult({
        url: URL.createObjectURL(out.blob),
        filename: out.filename,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  };

  const current = pages[pageIndex];

  return (
    <div className="space-y-4">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Allura&family=Caveat:wght@500;600&family=Great+Vibes&display=swap"
      />

      <div className="space-y-3">
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => loadFile(e.target.files?.[0] ?? null)}
        />
        <input
          ref={imageRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              pushHistory();
              void addImageFile(f);
            }
            e.target.value = "";
          }}
        />

        <EditorToolbar
          tool={tool}
          onTool={(t) => {
            if (t === "image") {
              imageRef.current?.click();
              return;
            }
            setTool(t);
            if (t === "draw") syncDrawCanvas();
          }}
          showEditTools={initialMode === "edit"}
          canUndo={past.length > 0}
          canRedo={future.length > 0}
          onUndo={undo}
          onRedo={redo}
          onCut={() => void cutSelection()}
          onCopy={() => void copySelection()}
          onPaste={() => void pasteSelection()}
          canClipboard={Boolean(activeRunId)}
          onDelete={removeSelected}
          canDelete={Boolean(selectedId || activeRunId)}
          onOpen={() => fileRef.current?.click()}
          onSave={() => void exportPdf()}
          saving={busy}
          canSave={Boolean(file)}
          hasResult={Boolean(result)}
          resultUrl={result?.url}
          resultName={result?.filename}
          fontFamily={fontFamily}
          onFontFamily={(v) => {
            setFontFamily(v);
            if (activeRunId) {
              applyRunStyle({
                fontFamily: bold
                  ? v.includes("Semibold")
                    ? v
                    : v.replace("Segoe UI", "Segoe UI Semibold")
                  : v,
              });
            }
          }}
          fontSize={fontSizeUi}
          onFontSize={(v) => {
            setFontSizeUi(v);
            if (activeRunId) applyRunStyle({ fontSize: v });
          }}
          color={color}
          onColor={(v) => {
            setColor(v);
            if (activeRunId) applyRunStyle({ color: v });
          }}
          bold={bold}
          onBold={() => {
            const next = !bold;
            setBold(next);
            if (!activeRunId) return;
            const base =
              fontFamily ||
              '"Segoe UI", Calibri, Arial, Helvetica, sans-serif';
            applyRunStyle({
              fontFamily: next
                ? '"Segoe UI Semibold", "Segoe UI", Calibri, Arial, sans-serif'
                : base.replace("Segoe UI Semibold", "Segoe UI"),
            });
          }}
          zoom={zoom}
          onZoom={setZoom}
          hasSelection={Boolean(activeRunId)}
        />

        {initialMode === "edit" && file ? (
          <p className="text-[12px] text-muted">
            {textSource === "ocr" ? "OCR · " : ""}
            {textRuns.length} text block{textRuns.length === 1 ? "" : "s"}
            {dirtyCount ? ` · ${dirtyCount} edited` : ""}
            {" — "}
            click a blue highlight to open a clean edit box (cursor blinks on
            that text). Logo art is not editable.
          </p>
        ) : null}

        {(tool === "text" || tool === "sign") && (
          <div className="theme-panel flex flex-wrap items-end gap-3 border border-line p-4">
            <label className="flex min-w-[180px] flex-1 flex-col gap-1 text-[11px] text-muted">
              {tool === "sign" ? "Signature text" : "New text"}
              <input
                value={tool === "sign" ? signValue : textValue}
                onChange={(e) =>
                  tool === "sign"
                    ? setSignValue(e.target.value)
                    : setTextValue(e.target.value)
                }
                placeholder={
                  tool === "sign" ? "Type your name" : "Type here"
                }
                className="theme-control border border-line bg-transparent px-3 py-2 text-[14px] text-cream outline-none focus:border-ice/50"
                style={
                  tool === "sign"
                    ? { fontFamily }
                    : undefined
                }
              />
            </label>
            <p className="text-[12px] text-muted">
              Click on the page to place.
            </p>
          </div>
        )}
      </div>

      {error ? (
        <p className="text-[13px] text-red-300">{error}</p>
      ) : null}

      {status && !error && !loading ? (
        <p className="text-[13px] text-muted">{status}</p>
      ) : null}

      {loading ? (
        <ProcessSteps
          title="Preparing your document"
          steps={visibleSteps}
          activeId={activeStep}
          doneIds={doneSteps}
        />
      ) : null}

      {current ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_120px]">
          <div
            ref={pageWrapRef}
            className="relative mx-auto w-full max-w-3xl origin-top overflow-hidden rounded-[var(--radius)] border border-line bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
            style={{ transform: `scale(${zoom})`, marginBottom: `${(zoom - 1) * 40}%` }}
            onClick={(e) => {
              // Click empty page area dismisses active text field
              if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === "IMG") {
                setActiveRunId(null);
              }
              void onPageClick(e);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.dataUrl}
              alt={`Page ${pageIndex + 1}`}
              className="block w-full select-none"
              draggable={false}
            />

            {initialMode === "edit" &&
              tool === "select" &&
              pageRuns.map((run) => {
                const active = activeRunId === run.id;
                return (
                  <div
                    key={run.id}
                    className={cn(
                      "absolute",
                      active && "z-20",
                      run.dirty && !active && "z-[5]",
                    )}
                    style={{
                      left: `${run.x * 100}%`,
                      top: `${run.y * 100}%`,
                      width: `${Math.max(run.w * 100, 2)}%`,
                      height: `${Math.max(run.h * 100, 1.2)}%`,
                    }}
                  >
                    {active ? (
                      <ActiveTextField
                        run={run}
                        onChange={(value) => {
                          setTextRuns((prev) =>
                            prev.map((r) =>
                              r.id === run.id
                                ? {
                                    ...r,
                                    text: value,
                                    dirty: value !== r.original,
                                  }
                                : r,
                            ),
                          );
                        }}
                        onBlur={() => {
                          /* keep selection until click elsewhere */
                        }}
                      />
                    ) : run.dirty ? (
                      <div className="absolute inset-0 z-[5]">
                        {/* Oversized solid cover — glyphs stick out of OCR boxes */}
                        <div
                          className="pointer-events-none absolute bg-white"
                          style={{
                            top: "-35%",
                            left: "-5%",
                            width: "110%",
                            height: "170%",
                          }}
                        />
                        <div className="absolute inset-0 overflow-hidden">
                          <FittedTextPreview run={run} />
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        title={`Edit: ${run.original}`}
                        className="absolute inset-0 cursor-text bg-sky-400/20 ring-1 ring-sky-400/40 transition hover:bg-sky-400/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(null);
                          pushHistory();
                          setActiveRunId(run.id);
                        }}
                      />
                    )}
                  </div>
                );
              })}

            {pageOverlays.map((o) => (
              <OverlayView
                key={o.id}
                overlay={o}
                selected={selectedId === o.id}
                onSelect={() => {
                  setSelectedId(o.id);
                  setActiveRunId(null);
                  setTool("select");
                }}
                onMove={moveOverlay}
              />
            ))}
            <canvas
              ref={drawCanvasRef}
              className={cn(
                "absolute inset-0 h-full w-full",
                tool === "draw"
                  ? "pointer-events-auto cursor-crosshair z-20"
                  : "pointer-events-none",
              )}
              onPointerDown={onDrawStart}
              onPointerMove={onDrawMove}
              onPointerUp={onDrawEnd}
              onPointerLeave={onDrawEnd}
            />
          </div>

          <div className="flex max-h-[70vh] flex-row gap-2 overflow-x-auto lg:flex-col lg:overflow-y-auto">
            {pages.map((p) => (
              <button
                key={p.index}
                type="button"
                onClick={() => setPageIndex(p.index)}
                className={cn(
                  "shrink-0 overflow-hidden rounded-[var(--radius-sm)] border",
                  pageIndex === p.index
                    ? "border-ice ring-1 ring-ice/40"
                    : "border-line opacity-80 hover:opacity-100",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.dataUrl}
                  alt={`Page ${p.index + 1}`}
                  className="h-24 w-auto lg:h-auto lg:w-full"
                />
              </button>
            ))}
          </div>
        </div>
      ) : !loading ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-[var(--radius)] border border-dashed border-line bg-white/[0.02] px-6 py-16 text-center transition hover:border-ice/40"
        >
          <Upload size={22} className="text-ice" />
          <span className="text-[14px] font-medium text-cream">
            Open a PDF to {initialMode === "sign" ? "sign" : "edit"}
          </span>
          <span className="text-[12px] text-muted">
            Files stay in your browser — nothing is uploaded.
          </span>
        </button>
      ) : null}
    </div>
  );
}

function ActiveTextField({
  run,
  onChange,
  onBlur,
}: {
  run: EditableRun;
  onChange: (value: string) => void;
  onBlur?: () => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [fontPx, setFontPx] = useState(18);
  const type = editTypeForRun(run);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const apply = () => {
      const h = el.clientHeight || 24;
      // Size from the OCR run box — NOT the oversized white mask
      setFontPx(Math.max(11, Math.round(h * type.sizeFactor)));
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [type.sizeFactor]);

  useEffect(() => {
    inputRef.current?.focus();
    const len = run.text.length;
    try {
      inputRef.current?.setSelectionRange(len, len);
    } catch {
      /* ignore */
    }
  }, [run.id]);

  return (
    <div
      className="absolute inset-0 z-20"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Solid cover taller/wider than OCR — kills ghost glyphs */}
      <div
        className="pointer-events-none absolute bg-white ring-2 ring-ice shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
        style={{
          top: "-35%",
          left: "-5%",
          width: "110%",
          height: "170%",
        }}
      />
      <div ref={boxRef} className="absolute inset-0 overflow-hidden">
        <textarea
          ref={inputRef}
          value={run.text}
          spellCheck={false}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          className="pdf-edit-input h-full w-full resize-none border-0 bg-transparent outline-none"
          style={{
            color: run.color || "#1a1a1a",
            caretColor: "#111111",
            fontFamily: type.fontFamily,
            fontWeight: type.fontWeight,
            fontSize: `${fontPx}px`,
            lineHeight: 1.05,
            letterSpacing: "normal",
            padding: "0 2px",
            fontVariantLigatures: "none",
            fontSynthesis: "none",
            WebkitTextFillColor: run.color || "#1a1a1a",
          }}
        />
      </div>
    </div>
  );
}

function FittedTextPreview({ run }: { run: EditableRun }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const type = editTypeForRun(run);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    let cancelled = false;
    const paint = async () => {
      const W = Math.max(2, parent.clientWidth);
      const H = Math.max(2, parent.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx || cancelled) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = run.bgColor || "#ffffff";
      ctx.globalAlpha = 1;
      ctx.fillRect(0, 0, W, H);
      await drawFittedText(ctx, {
        text: run.text,
        originalText: run.original,
        boxW: W,
        boxH: H,
        color: run.color || "#1a1a1a",
        fontFamily: type.fontFamily,
        bold: type.fontWeight >= 600,
      });
    };
    void paint();
    return () => {
      cancelled = true;
    };
  }, [
    run.text,
    run.original,
    run.color,
    run.bgColor,
    run.fontFamily,
    run.w,
    run.h,
    type.fontFamily,
    type.fontWeight,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}

function OverlayView({
  overlay,
  selected,
  onSelect,
  onMove,
}: {
  overlay: Overlay;
  selected: boolean;
  onSelect: () => void;
  onMove: (id: string, dx: number, dy: number) => void;
}) {
  const dragging = useRef<{ x: number; y: number } | null>(null);

  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect();
        dragging.current = { x: e.clientX, y: e.clientY };
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        const parent = (e.currentTarget as HTMLElement).parentElement;
        if (!parent) return;
        const dx = (e.clientX - dragging.current.x) / parent.clientWidth;
        const dy = (e.clientY - dragging.current.y) / parent.clientHeight;
        dragging.current = { x: e.clientX, y: e.clientY };
        onMove(overlay.id, dx, dy);
      }}
      onPointerUp={() => {
        dragging.current = null;
      }}
      className={cn(
        "absolute cursor-move",
        selected && "ring-2 ring-ice/70",
      )}
      style={{
        left: `${overlay.x * 100}%`,
        top: `${overlay.y * 100}%`,
        width: `${overlay.w * 100}%`,
        height: `${overlay.h * 100}%`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={overlay.dataUrl}
        alt=""
        className="h-full w-full object-contain pointer-events-none"
        draggable={false}
      />
    </div>
  );
}

function loadImg(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}
