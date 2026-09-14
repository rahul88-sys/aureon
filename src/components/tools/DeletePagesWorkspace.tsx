"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";
import {
  deletePdfPages,
  getPdfPageThumbnails,
} from "@/lib/pdf-ops";
import { cn } from "@/lib/utils";

export function DeletePagesWorkspace() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [thumbs, setThumbs] = useState<
    { index: number; dataUrl: string }[]
  >([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    url: string;
    filename: string;
  } | null>(null);

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result?.url]);

  const load = async (next: File | null) => {
    setError(null);
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);
    setSelected(new Set());
    setThumbs([]);
    setFile(next);
    if (!next) return;
    setLoading(true);
    try {
      const pages = await getPdfPageThumbnails(next, 0.4);
      setThumbs(pages.map((p) => ({ index: p.index, dataUrl: p.dataUrl })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read PDF.");
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const run = async () => {
    if (!file) {
      setError("Choose a PDF first.");
      return;
    }
    if (!selected.size) {
      setError("Select pages to delete.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const out = await deletePdfPages(file, [...selected]);
      if (result?.url) URL.revokeObjectURL(result.url);
      setResult({
        url: URL.createObjectURL(out.blob),
        filename: out.filename,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="theme-panel border border-line p-6 sm:p-8">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => load(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-3 rounded-[var(--radius)] border border-dashed border-line bg-white/[0.02] px-6 py-10 text-center transition hover:border-ice/40 hover:bg-ice/[0.04]"
      >
        <Upload size={22} className="text-ice" />
        <span className="text-[14px] font-medium text-cream">
          {file ? file.name : "Choose a PDF"}
        </span>
        <span className="text-[12px] text-muted">
          Click pages to mark them for deletion. Files stay in your browser.
        </span>
      </button>

      {loading ? (
        <p className="mt-6 inline-flex items-center gap-2 text-[13px] text-muted">
          <Loader2 size={16} className="animate-spin text-ice" />
          Loading pages…
        </p>
      ) : null}

      {thumbs.length ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {thumbs.map((p) => {
            const on = selected.has(p.index);
            return (
              <button
                key={p.index}
                type="button"
                onClick={() => toggle(p.index)}
                className={cn(
                  "overflow-hidden rounded-[var(--radius-sm)] border text-left transition",
                  on
                    ? "border-red-400/70 ring-1 ring-red-400/40"
                    : "border-line hover:border-ice/40",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.dataUrl}
                  alt={`Page ${p.index + 1}`}
                  className={cn("w-full bg-white", on && "opacity-50")}
                />
                <span className="block px-2 py-1.5 text-[11px] text-muted">
                  Page {p.index + 1}
                  {on ? " · delete" : ""}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 text-[13px] text-red-300">{error}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy || !file || !selected.size}
          onClick={run}
          className="theme-control inline-flex items-center gap-2 border border-ice bg-ice/15 px-5 py-2.5 ui-label text-ice transition hover:bg-ice hover:text-ink disabled:opacity-50"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : null}
          {busy ? "Working…" : "Delete selected"}
        </button>
        {result ? (
          <a
            href={result.url}
            download={result.filename}
            className="theme-control inline-flex items-center gap-2 border border-line px-5 py-2.5 ui-label text-cream-dim transition hover:border-ice/40 hover:text-cream"
          >
            <Download size={16} className="text-ice" />
            Download
          </a>
        ) : null}
      </div>
    </div>
  );
}
