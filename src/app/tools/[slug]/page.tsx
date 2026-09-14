import type { Metadata } from "next";
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
      <ToolClient tool={tool} />
    </>
  );
}
