"use client";

import { useRef, useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToolWorkspace({
  accept,
  multiple = false,
  convertLabel = "Convert",
  onConvert,
}: {
  accept: string;
  multiple?: boolean;
  convertLabel?: string;
  onConvert: (files: File[]) => Promise<{ blob: Blob; filename: string }>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    url: string;
    filename: string;
  } | null>(null);

  const pick = (list: FileList | null) => {
    setError(null);
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);
    const next = list ? Array.from(list) : [];
    setFiles(multiple ? next : next.slice(0, 1));
  };

  const run = async () => {
    if (!files.length) {
      setError("Choose at least one file.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const out = await onConvert(files);
      if (result?.url) URL.revokeObjectURL(result.url);
      setResult({
        url: URL.createObjectURL(out.blob),
        filename: out.filename,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="theme-panel border border-line p-6 sm:p-8">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => pick(e.target.files)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-3 rounded-[var(--radius)] border border-dashed border-line bg-white/[0.02] px-6 py-12 text-center transition hover:border-ice/40 hover:bg-ice/[0.04]",
        )}
      >
        <Upload size={22} className="text-ice" />
        <span className="text-[14px] font-medium text-cream">
          {files.length
            ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
            : "Drop or choose files"}
        </span>
        <span className="text-[12px] text-muted">
          Files stay in your browser — nothing is uploaded to our servers.
        </span>
      </button>

      {files.length ? (
        <ul className="mt-4 space-y-1.5 text-[12px] text-muted">
          {files.map((f) => (
            <li key={`${f.name}-${f.size}`} className="truncate text-cream-dim">
              {f.name} · {(f.size / 1024).toFixed(1)} KB
            </li>
          ))}
        </ul>
      ) : null}

      {error ? (
        <p className="mt-4 text-[13px] text-red-300">{error}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy || !files.length}
          onClick={run}
          className="theme-control inline-flex items-center gap-2 border border-ice bg-ice/15 px-5 py-2.5 ui-label text-ice transition hover:bg-ice hover:text-ink disabled:opacity-50"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : null}
          {busy ? "Converting…" : convertLabel}
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
