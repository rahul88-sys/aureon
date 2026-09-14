"use client";

import Link from "next/link";
import { ToolWorkspace } from "@/components/tools/ToolWorkspace";
import {
  convertImageFormat,
  imagesToPdf,
} from "@/lib/convert";
import { type Tool, tools } from "@/lib/tools";

export function ToolClient({ tool }: { tool: Tool }) {
  const onConvert = async (files: File[]) => {
    switch (tool.slug) {
      case "image-to-pdf":
      case "images-to-pdf":
        return imagesToPdf(files);
      case "png-to-jpg":
        return convertImageFormat(files, "image/jpeg", "jpg");
      case "jpg-to-png":
        return convertImageFormat(files, "image/png", "png");
      case "webp-convert":
        return convertImageFormat(files, "image/webp", "webp");
      default:
        throw new Error("Unknown tool");
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <ToolWorkspace
        accept={tool.accept}
        multiple={Boolean(tool.multiple)}
        convertLabel="Convert"
        onConvert={onConvert}
      />
      <div className="mt-10">
        <p className="ui-label text-muted">More tools</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {tools
            .filter((t) => t.slug !== tool.slug)
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
    </section>
  );
}
