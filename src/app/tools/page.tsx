import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { toolCategories, toolsByCategory } from "@/lib/tools";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Free browser-based PDF and image tools from Aureon — merge, split, compress, edit, sign, and convert. Files never leave your device.",
};

export default function ToolsPage() {
  return (
    <>
      <PageHero
        eyebrow="SYS // tools"
        title={
          <>
            PDF tools.
            <br />
            Private by default.
          </>
        }
        body="Organize, edit, sign, and convert files in your browser. No accounts required — your files stay on your device."
      />
      <section className="mx-auto max-w-7xl space-y-16 px-5 py-16 sm:px-8 sm:py-20">
        {toolCategories.map((cat) => {
          const list = toolsByCategory(cat.id);
          return (
            <div key={cat.id}>
              <div className="mb-6 max-w-xl">
                <p className="ui-label text-ice">{cat.label}</p>
                <p className="mt-2 text-[14px] text-muted">{cat.blurb}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((tool) => {
                  const soon = tool.status === "soon";
                  const card = (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <p className="ui-label text-ice">{tool.hint}</p>
                        {soon ? (
                          <span className="shrink-0 rounded-[var(--radius-sm)] border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted">
                            Soon
                          </span>
                        ) : null}
                      </div>
                      <h2
                        className={cn(
                          "mt-3 text-[18px] font-semibold",
                          soon ? "text-cream-dim" : "text-cream",
                        )}
                      >
                        {tool.title}
                      </h2>
                      <p className="mt-2 text-[13px] leading-6 text-muted">
                        {tool.short}
                      </p>
                      {!soon ? (
                        <span className="mt-5 inline-flex items-center gap-1 text-[12px] font-medium text-ice transition group-hover:gap-1.5">
                          Open tool
                          <ArrowUpRight size={14} />
                        </span>
                      ) : (
                        <span className="mt-5 inline-block text-[12px] text-muted">
                          Listed for the full suite — not wired yet
                        </span>
                      )}
                    </>
                  );

                  if (soon) {
                    return (
                      <div
                        key={tool.slug}
                        className="theme-panel border border-line p-6 opacity-70"
                      >
                        {card}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      className="theme-panel group border border-line p-6 transition hover:border-ice/35"
                    >
                      {card}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}
