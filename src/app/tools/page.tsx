import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Free browser-based converters from Aureon — image to PDF, PNG to JPG, WebP, and more. Files never leave your device.",
};

export default function ToolsPage() {
  return (
    <>
      <PageHero
        eyebrow="SYS // tools"
        title={
          <>
            Free converters.
            <br />
            Private by default.
          </>
        }
        body="Quick file utilities that run in your browser. No accounts required for conversion — your files stay on your device."
      />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="theme-panel group border border-line p-6 transition hover:border-ice/35"
            >
              <p className="ui-label text-ice">{tool.hint}</p>
              <h2 className="mt-3 text-[18px] font-semibold text-cream">
                {tool.title}
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-muted">
                {tool.short}
              </p>
              <span className="mt-5 inline-flex items-center gap-1 text-[12px] font-medium text-ice transition group-hover:gap-1.5">
                Open tool
                <ArrowUpRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
