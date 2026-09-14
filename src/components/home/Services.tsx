"use client";

import Link from "next/link";
import { ArrowUpRight, Code2 } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SpotlightCard } from "@/components/modern/SpotlightCard";
import { useTheme } from "@/components/theme/ThemeToggle";
import { serviceMeta } from "@/lib/service-meta";
import { services } from "@/lib/site";
import { cn } from "@/lib/utils";

const spans = [
  "md:col-span-2 lg:col-span-4 lg:row-span-2",
  "md:col-span-2 lg:col-span-4 lg:row-span-2",
  "md:col-span-2 lg:col-span-4",
  "md:col-span-1 lg:col-span-4",
  "md:col-span-1 lg:col-span-4",
  "md:col-span-2 lg:col-span-4",
  "md:col-span-1 lg:col-span-4",
  "md:col-span-1 lg:col-span-4",
  "md:col-span-2 lg:col-span-4",
];

export function Services() {
  const modern = useTheme() === "modern";

  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
      <div className="grid items-end gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <SectionHeading
              eyebrow={modern ? "Capabilities" : "SRV // capabilities"}
              title={
                modern ? "Nine ways we ship." : "Nine systems. One studio."
              }
              body={
                modern
                  ? "From first sketch to systems that stay healthy in production — pick a lane or combine a few."
                  : "We stay with a product from the first sketch through the systems that keep it running."
              }
            />
          </Reveal>
        </div>
        <Reveal delay={0.1} className="lg:col-span-5 lg:text-right">
          <Link
            href="/services"
            className={cn(
              "ui-label inline-flex items-center gap-2 text-ice hover:text-cream",
              modern &&
                "rounded-full border border-ice/30 bg-ice/10 px-4 py-2",
            )}
          >
            {modern ? "View all services" : "View_all_services"}
            <ArrowUpRight size={14} />
          </Link>
        </Reveal>
      </div>

      <div
        className={cn(
          "mt-14 grid gap-3 md:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[minmax(160px,auto)]",
          !modern && "gap-0 border-t border-line md:grid-cols-1 lg:grid-cols-1",
        )}
      >
        {services.map((service, i) => {
          const info = serviceMeta[service.slug];
          const Icon = info?.icon ?? Code2;
          const featured = modern && i < 2;

          if (!modern) {
            return (
              <Reveal key={service.slug} delay={Math.min(i * 0.03, 0.2)}>
                <Link
                  href={`/services#${service.slug}`}
                  className="group grid gap-3 border-b border-line py-6 transition-colors hover:bg-surface sm:grid-cols-12 sm:items-baseline sm:gap-4"
                >
                  <span className="font-mono text-[11px] text-ice sm:col-span-2">
                    SRV.{service.number}
                  </span>
                  <h3 className="display text-xl text-cream sm:col-span-4 sm:text-2xl">
                    {service.title}
                  </h3>
                  <p className="text-[14px] leading-7 text-muted sm:col-span-6">
                    {service.short}
                  </p>
                </Link>
              </Reveal>
            );
          }

          return (
            <Reveal
              key={service.slug}
              delay={Math.min(i * 0.04, 0.24)}
              className={spans[i] ?? "lg:col-span-4"}
            >
              <SpotlightCard
                className={cn(
                  "theme-panel group relative h-full overflow-hidden border border-line",
                  featured && "min-h-[280px]",
                )}
              >
                <Link
                  href={`/services#${service.slug}`}
                  className="flex h-full flex-col p-5 sm:p-6"
                >
                  <div
                    className={cn(
                      "pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-100",
                      info?.accent === "gold"
                        ? "bg-gold/20 opacity-50"
                        : "bg-ice/20 opacity-50",
                    )}
                  />

                  <div className="relative flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        "inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] border",
                        info?.accent === "gold"
                          ? "border-gold/30 bg-gold/10 text-gold"
                          : "border-ice/30 bg-ice/10 text-ice",
                      )}
                    >
                      <Icon size={20} />
                    </span>
                    <span className="rounded-full border border-line bg-ink/30 px-2.5 py-1 text-[11px] text-muted">
                      {info?.group}
                    </span>
                  </div>

                  <p className="ui-label relative mt-5 text-ice">
                    {service.number}
                  </p>
                  <h3
                    className={cn(
                      "relative mt-2 font-semibold tracking-tight text-cream",
                      featured ? "text-2xl sm:text-3xl" : "text-xl",
                    )}
                  >
                    {service.title}
                  </h3>
                  <p
                    className={cn(
                      "relative mt-3 flex-1 text-muted",
                      featured
                        ? "text-[15px] leading-7"
                        : "text-[13px] leading-6",
                    )}
                  >
                    {service.short}
                  </p>

                  <div className="relative mt-5 flex items-center justify-between border-t border-line/80 pt-4">
                    <span className="text-[12px] text-cream-dim">
                      {info?.timeline}
                    </span>
                    <span
                      className={cn(
                        "inline-flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                        info?.accent === "gold"
                          ? "border-gold/35 text-gold group-hover:bg-gold group-hover:text-ink"
                          : "border-ice/35 text-ice group-hover:bg-ice group-hover:text-ink",
                      )}
                    >
                      <ArrowUpRight size={14} />
                    </span>
                  </div>
                </Link>
              </SpotlightCard>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
