import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CTA } from "@/components/home/CTA";
import { WorkMockup } from "@/components/work/WorkMockup";
import { Button } from "@/components/ui/Button";
import { projects } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Work" };
  return {
    title: project.name,
    description: project.summary,
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const others = projects.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <>
      <article className="pt-28">
        <div className="mx-auto max-w-7xl px-5 pt-10 sm:px-8">
          <Link
            href="/work"
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted hover:text-ice"
          >
            <ArrowLeft size={14} />
            All work
          </Link>
          <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.22em] text-ice">
            {project.sector} · {project.year}
          </p>
          <h1 className="display mt-4 max-w-4xl text-4xl text-cream sm:text-5xl lg:text-6xl">
            {project.title}
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-8 text-muted">
            {project.summary}
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {project.services.map((s) => (
              <span
                key={s}
                className="border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-cream-dim"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-7xl px-5 sm:px-8">
          <WorkMockup accent={project.accent} name={project.name} />
        </div>

        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-12">
          <section className="lg:col-span-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ice">
              Result
            </p>
            <p className="mt-3 text-xl leading-8 text-cream">{project.result}</p>
          </section>
          <section className="lg:col-span-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ice">
              The problem
            </p>
            <p className="mt-3 text-[15px] leading-8 text-muted">
              {project.challenge}
            </p>
          </section>
          <section className="lg:col-span-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ice">
              What we did
            </p>
            <p className="mt-3 text-[15px] leading-8 text-muted">
              {project.approach}
            </p>
          </section>
        </div>
      </article>

      {others.length ? (
        <section className="border-t border-line">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
              More work
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {others.map((item) => (
                <Link
                  key={item.slug}
                  href={`/work/${item.slug}`}
                  className="group border border-line p-6 hover:border-ice"
                >
                  <p className="font-mono text-[11px] text-ice">{item.sector}</p>
                  <h2 className="mt-3 text-2xl text-cream">{item.name}</h2>
                  <p className="mt-2 text-[14px] leading-7 text-muted">
                    {item.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className="px-5 sm:px-8">
        <div className="mx-auto mb-10 flex max-w-7xl justify-start">
          <Button href="/contact" variant="ghost">
            Start_similar
          </Button>
        </div>
      </div>
      <CTA />
    </>
  );
}
