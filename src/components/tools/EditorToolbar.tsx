"use client";

import {
  Bold,
  ClipboardPaste,
  Copy,
  Download,
  Highlighter,
  ImagePlus,
  MousePointer2,
  PenLine,
  Redo2,
  Save,
  Scissors,
  Trash2,
  Type,
  Undo2,
  Upload,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const EDITOR_FONTS = [
  { id: '"Segoe UI", Calibri, Arial, sans-serif', label: "Segoe UI" },
  { id: "Calibri, Carlito, Arial, sans-serif", label: "Calibri" },
  { id: "Arial, Helvetica, sans-serif", label: "Arial" },
  { id: 'Georgia, "Times New Roman", serif', label: "Georgia" },
  { id: '"Times New Roman", Times, serif', label: "Times" },
  { id: '"Courier New", Courier, monospace', label: "Courier" },
  { id: '"Great Vibes", cursive', label: "Great Vibes" },
  { id: '"Caveat", cursive', label: "Caveat" },
  { id: '"Allura", cursive', label: "Allura" },
];

function Sep() {
  return <span className="mx-1 hidden h-6 w-px bg-line sm:block" />;
}

function Btn({
  active,
  disabled,
  onClick,
  label,
  icon,
  title,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  label?: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "theme-control inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-[11px] transition disabled:opacity-35",
        active
          ? "border-ice bg-ice/15 text-ice"
          : "border-line text-cream-dim hover:border-ice/40 hover:text-cream",
      )}
    >
      {icon}
      {label ? <span className="hidden md:inline">{label}</span> : null}
    </button>
  );
}

export function EditorToolbar({
  tool,
  onTool,
  showEditTools,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  canClipboard,
  onDelete,
  canDelete,
  onOpen,
  onSave,
  saving,
  canSave,
  hasResult,
  resultUrl,
  resultName,
  fontFamily,
  onFontFamily,
  fontSize,
  onFontSize,
  color,
  onColor,
  bold,
  onBold,
  zoom,
  onZoom,
  hasSelection,
}: {
  tool: string;
  onTool: (t: "select" | "text" | "draw" | "sign" | "image") => void;
  showEditTools: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  canClipboard: boolean;
  onDelete: () => void;
  canDelete: boolean;
  onOpen: () => void;
  onSave: () => void;
  saving: boolean;
  canSave: boolean;
  hasResult: boolean;
  resultUrl?: string;
  resultName?: string;
  fontFamily: string;
  onFontFamily: (v: string) => void;
  fontSize: number;
  onFontSize: (v: number) => void;
  color: string;
  onColor: (v: string) => void;
  bold: boolean;
  onBold: () => void;
  zoom: number;
  onZoom: (v: number) => void;
  hasSelection: boolean;
}) {
  return (
    <div className="theme-panel space-y-2 border border-line p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <Btn
          title="Open PDF"
          label="Open"
          icon={<Upload size={14} className="text-ice" />}
          onClick={onOpen}
        />
        <Btn
          title="Save / download PDF (Ctrl+S)"
          label={saving ? "Saving…" : "Save"}
          icon={<Save size={14} />}
          onClick={onSave}
          disabled={!canSave || saving}
          active={canSave}
        />
        {hasResult && resultUrl ? (
          <a
            href={resultUrl}
            download={resultName || "edited.pdf"}
            className="theme-control inline-flex items-center gap-1.5 border border-line px-2.5 py-1.5 text-[11px] text-cream-dim hover:border-ice/40"
            title="Download last export"
          >
            <Download size={14} className="text-ice" />
            <span className="hidden md:inline">Download</span>
          </a>
        ) : null}

        <Sep />

        <Btn
          title="Undo (Ctrl+Z)"
          icon={<Undo2 size={14} />}
          onClick={onUndo}
          disabled={!canUndo}
        />
        <Btn
          title="Redo (Ctrl+Y)"
          icon={<Redo2 size={14} />}
          onClick={onRedo}
          disabled={!canRedo}
        />
        <Btn
          title="Cut (Ctrl+X)"
          icon={<Scissors size={14} />}
          onClick={onCut}
          disabled={!canClipboard}
        />
        <Btn
          title="Copy (Ctrl+C)"
          icon={<Copy size={14} />}
          onClick={onCopy}
          disabled={!canClipboard}
        />
        <Btn
          title="Paste (Ctrl+V)"
          icon={<ClipboardPaste size={14} />}
          onClick={onPaste}
          disabled={!hasSelection}
        />
        <Btn
          title="Delete selection"
          icon={<Trash2 size={14} />}
          onClick={onDelete}
          disabled={!canDelete}
        />

        <Sep />

        <Btn
          title="Select"
          label="Select"
          icon={<MousePointer2 size={14} />}
          active={tool === "select"}
          onClick={() => onTool("select")}
        />
        {showEditTools ? (
          <Btn
            title="Add text"
            label="Text"
            icon={<Type size={14} />}
            active={tool === "text"}
            onClick={() => onTool("text")}
          />
        ) : null}
        <Btn
          title="Sign"
          label="Sign"
          icon={<PenLine size={14} />}
          active={tool === "sign"}
          onClick={() => onTool("sign")}
        />
        {showEditTools ? (
          <>
            <Btn
              title="Draw"
              label="Draw"
              icon={<Highlighter size={14} />}
              active={tool === "draw"}
              onClick={() => onTool("draw")}
            />
            <Btn
              title="Add image"
              label="Image"
              icon={<ImagePlus size={14} />}
              active={tool === "image"}
              onClick={() => onTool("image")}
            />
          </>
        ) : null}

        <div className="ml-auto flex items-center gap-1">
          <Btn
            title="Zoom out"
            icon={<ZoomOut size={14} />}
            onClick={() => onZoom(Math.max(0.6, +(zoom - 0.1).toFixed(2)))}
          />
          <span className="min-w-[3rem] text-center text-[11px] text-muted">
            {Math.round(zoom * 100)}%
          </span>
          <Btn
            title="Zoom in"
            icon={<ZoomIn size={14} />}
            onClick={() => onZoom(Math.min(2, +(zoom + 0.1).toFixed(2)))}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2 border-t border-line pt-2">
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-wider text-muted">
          Font
          <select
            value={fontFamily}
            onChange={(e) => onFontFamily(e.target.value)}
            disabled={!hasSelection && tool !== "text" && tool !== "sign"}
            className="theme-control min-w-[9rem] border border-line bg-ink px-2 py-1.5 text-[12px] text-cream disabled:opacity-40"
          >
            {EDITOR_FONTS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-wider text-muted">
          Size
          <input
            type="number"
            min={8}
            max={96}
            value={Math.round(fontSize)}
            onChange={(e) => onFontSize(Number(e.target.value) || 12)}
            disabled={!hasSelection}
            className="theme-control w-16 border border-line bg-transparent px-2 py-1.5 text-[12px] text-cream disabled:opacity-40"
          />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-wider text-muted">
          Color
          <input
            type="color"
            value={color}
            onChange={(e) => onColor(e.target.value)}
            className="h-8 w-10 cursor-pointer border border-line bg-transparent"
          />
        </label>
        <Btn
          title="Bold"
          label="Bold"
          icon={<Bold size={14} />}
          active={bold}
          onClick={onBold}
          disabled={!hasSelection}
        />
        <p className="pb-1 text-[11px] text-muted">
          Tip: click text on the page, then use font controls. Ctrl+Z / Ctrl+S supported.
        </p>
      </div>
    </div>
  );
}
