import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolClient } from "@/components/tools/ToolClient";
import { PageHero } from "@/components/ui/PageHero";
import { getTool, tools } from "@/lib/tools";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return { title: "Tool" };
  return {
    title: tool.title,
    description: tool.short,
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  return (
    <>
      <PageHero
        eyebrow="SYS // tools"
        title={tool.title}
        body={tool.short}
      />
      {tool.status === "soon" ? (
        <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="theme-panel border border-line p-8 text-center">
            <p className="ui-label text-ice">Coming soon</p>
            <p className="mt-4 text-[15px] leading-7 text-muted">
              This tool is listed in the suite catalog and will ship in a later
              phase (Office convert / OCR). Use Merge, Split, Edit, Sign, and
              image converters today — all in your browser.
            </p>
            <Link
              href="/tools"
              className="mt-8 inline-flex theme-control border border-ice bg-ice/15 px-5 py-2.5 ui-label text-ice transition hover:bg-ice hover:text-ink"
            >
              Browse ready tools
            </Link>
          </div>
        </section>
      ) : (
        <ToolClient tool={tool} />
      )}
    </>
  );
}
