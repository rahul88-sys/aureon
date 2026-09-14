"use client";

import Link from "next/link";
import { DeletePagesWorkspace } from "@/components/tools/DeletePagesWorkspace";
import { PdfEditorWorkspace } from "@/components/tools/PdfEditorWorkspace";
import { ToolWorkspace } from "@/components/tools/ToolWorkspace";
import {
  convertImageFormat,
  imagesToPdf,
} from "@/lib/convert";
import {
  compressImageFile,
  compressPdf,
  mergePdfs,
  pdfToImages,
  rotatePdf,
  splitPdf,
} from "@/lib/pdf-ops";
import { type Tool, readyTools } from "@/lib/tools";

const EDITOR_SLUGS = new Set([
  "edit-pdf",
  "sign-pdf",
  "add-image-to-pdf",
]);

export function ToolClient({ tool }: { tool: Tool }) {
  // Route by slug first so Edit/Sign never fall through to the oneshot converter
  if (tool.kind === "editor" || EDITOR_SLUGS.has(tool.slug)) {
    const mode =
      tool.editorMode ??
      (tool.slug === "sign-pdf" ? "sign" : "edit");
    return (
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <PdfEditorWorkspace mode={mode} />
        <MoreTools current={tool.slug} />
      </section>
    );
  }

  if (tool.kind === "pages" || tool.slug === "delete-pages") {
    return (
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <DeletePagesWorkspace />
        <MoreTools current={tool.slug} />
      </section>
    );
  }

  const onConvert = async (files: File[]) => {
    switch (tool.slug) {
      case "image-to-pdf":
      case "images-to-pdf":
      case "jpg-to-pdf":
        return imagesToPdf(files);
      case "png-to-jpg":
        return convertImageFormat(files, "image/jpeg", "jpg");
      case "jpg-to-png":
        return convertImageFormat(files, "image/png", "png");
      case "webp-convert":
        return convertImageFormat(files, "image/webp", "webp");
      case "compress-image":
        return compressImageFile(files);
      case "merge-pdf":
        return mergePdfs(files);
      case "split-pdf":
        return splitPdf(files);
      case "compress-pdf":
        return compressPdf(files);
      case "rotate-pdf":
        return rotatePdf(files, 90);
      case "pdf-to-jpg":
        return pdfToImages(files, "jpg");
      case "pdf-to-png":
        return pdfToImages(files, "png");
      default:
        throw new Error(`Unknown tool: ${tool.slug}`);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <ToolWorkspace
        accept={tool.accept}
        multiple={Boolean(tool.multiple)}
        convertLabel={tool.convertLabel ?? "Convert"}
        onConvert={onConvert}
      />
      <MoreTools current={tool.slug} />
    </section>
  );
}

function MoreTools({ current }: { current: string }) {
  return (
    <div className="mt-10">
      <p className="ui-label text-muted">More tools</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {readyTools()
          .filter((t) => t.slug !== current)
          .slice(0, 12)
          .map((t) => (
            <Link
              key={t.slug}
              href={`/tools/${t.slug}`}
              className="theme-control border border-line px-3 py-1.5 text-[12px] text-cream-dim transition hover:border-ice/40 hover:text-cream"
            >
              {t.title}
            </Link>
          ))}
      </div>
    </div>
  );
}
