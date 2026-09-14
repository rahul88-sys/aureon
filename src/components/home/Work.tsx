"use client";

import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SpotlightCard } from "@/components/modern/SpotlightCard";
import { WorkMockup } from "@/components/work/WorkMockup";
import { useTheme } from "@/components/theme/ThemeToggle";
import { projects } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Work({
  limit,
  hideHeading = false,
}: {
  limit?: number;
  hideHeading?: boolean;
}) {
  const modern = useTheme() === "modern";
  const items = limit ? projects.slice(0, limit) : projects;

  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        {hideHeading ? null : (
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <Reveal>
              <SectionHeading
                eyebrow={modern ? "Selected work" : "DEP // selected"}
                title={
                  modern ? "Products in production." : "Selected deployments."
                }
                body={
                  modern
                    ? "Real builds — designed, engineered, and launched with care."
                    : "Products we designed, engineered and put into production."
                }
              />
            </Reveal>
            {limit ? (
              <Reveal delay={0.1}>
                <Link
                  href="/work"
                  className="ui-label text-ice hover:text-cream"
                >
                  {modern ? "See all work →" : "All_work →"}
                </Link>
              </Reveal>
            ) : null}
          </div>
        )}

        <div className={hideHeading ? "" : "mt-14"}>
          {items.map((project, i) => (
            <Reveal key={project.slug} delay={i * 0.04}>
              <Link
                href={`/work/${project.slug}`}
                className={cn(
                  "group grid items-center gap-8 border-t border-line py-10 lg:grid-cols-12 lg:gap-12",
                  modern && "border-none py-5",
                )}
              >
                {modern ? (
                  <SpotlightCard className="theme-panel overflow-hidden border border-line lg:col-span-7">
                    <div className="relative aspect-[16/10]">
                      <Image
                        src="/media/work-cover.svg"
                        alt={`${project.name} preview`}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 1024px) 100vw, 58vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-70" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                        <p className="rounded-full border border-white/15 bg-ink/50 px-3 py-1 text-[12px] text-cream backdrop-blur-md">
                          {project.name}
                        </p>
                        <p className="ui-label text-ice">{project.year}</p>
                      </div>
                    </div>
                  </SpotlightCard>
                ) : (
                  <div className="lg:col-span-7">
                    <WorkMockup accent={project.accent} name={project.name} />
                  </div>
                )}
                <div className="lg:col-span-5">
                  <p className="ui-label text-ice">
                    {modern
                      ? `${project.sector} · ${project.year}`
                      : `DEP.0${i + 1} · ${project.sector} · ${project.year}`}
                  </p>
                  <h3 className="display mt-3 text-2xl text-cream sm:text-3xl">
                    {project.name}
                  </h3>
                  <p className="mt-3 text-[15px] leading-7 text-muted">
                    {project.summary}
                  </p>
                  <p className="ui-label mt-5 text-ice">
                    {modern ? "View case study →" : "Open_record →"}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
