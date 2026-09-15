"use client";

import { useEffect, useRef, useState } from "react";

export function ReplaceTextModal({
  selected,
  initialReplacement,
  onApply,
  onClose,
}: {
  selected: string;
  initialReplacement?: string;
  onApply: (replacement: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initialReplacement ?? selected);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialReplacement ?? selected);
    const t = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 30);
    return () => window.clearTimeout(t);
  }, [selected, initialReplacement]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="replace-text-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[var(--radius)] border border-line bg-ink-elevated p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="replace-text-title"
          className="text-[15px] font-semibold tracking-tight text-cream"
        >
          Replace text
        </h2>
        <p className="mt-1 text-[12px] text-muted">
          Original PDF look stays on the page until you save. Edit the
          replacement below.
        </p>

        <label className="mt-5 block text-[11px] uppercase tracking-[0.16em] text-muted">
          Selected
        </label>
        <div className="mt-1.5 rounded-[var(--radius-sm)] border border-line bg-ink/60 px-3 py-2.5 text-[14px] text-cream-dim">
          {selected || "—"}
        </div>

        <label
          htmlFor="replace-with"
          className="mt-4 block text-[11px] uppercase tracking-[0.16em] text-muted"
        >
          Replace with
        </label>
        <input
          ref={inputRef}
          id="replace-with"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onApply(value);
            }
          }}
          className="mt-1.5 w-full rounded-[var(--radius-sm)] border border-line bg-ink px-3 py-2.5 text-[14px] text-cream outline-none ring-ice/0 transition focus:border-ice/50 focus:ring-2 focus:ring-ice/30"
          autoComplete="off"
          spellCheck={false}
        />

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-sm)] border border-line px-3.5 py-2 text-[12px] text-cream-dim hover:border-line-strong hover:text-cream"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onApply(value)}
            className="rounded-[var(--radius-sm)] bg-ice px-3.5 py-2 text-[12px] font-medium text-ink hover:opacity-90"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
