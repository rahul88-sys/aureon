"use client";

import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useTheme } from "@/components/theme/ThemeToggle";
import { principles } from "@/lib/site";
import { cn } from "@/lib/utils";

export function WhyUs() {
  const modern = useTheme() === "modern";

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
      <Reveal>
        <SectionHeading
          eyebrow={modern ? "Why teams choose us" : "WHY // Aureon"}
          title={
            modern ? "Built for trust, not theatre." : "Trust with serious work."
          }
          body={
            modern
              ? "We are not the cheapest quote in your inbox. We are the studio you call when the product has to work in production — with your name on it."
              : "We are not the cheapest vendor in the inbox. We are the team you call when the software has to work — in production, under load, with your name on it."
          }
        />
      </Reveal>
      <div
        className={cn(
          "mt-14 grid border-t border-line sm:grid-cols-2",
          modern && "gap-3 border-none",
        )}
      >
        {principles.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.05}>
            <article
              className={cn(
                "h-full border-b border-line p-7 sm:odd:border-r",
                modern && "theme-panel border border-line sm:odd:border",
              )}
            >
              <p
                className={cn(
                  "text-ice",
                  modern ? "ui-label" : "font-mono text-[11px]",
                )}
              >
                0{i + 1}
              </p>
              <h3 className="display mt-4 text-xl text-cream">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-7 text-muted">{item.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
