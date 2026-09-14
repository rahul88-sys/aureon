"use client";

import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useTheme } from "@/components/theme/ThemeToggle";
import { process } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Process() {
  const modern = useTheme() === "modern";

  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Reveal>
          <SectionHeading
            eyebrow={modern ? "How we work" : "OPS // method"}
            title={
              modern ? "From idea to live product." : "Problem to production."
            }
            body={
              modern
                ? "A clear path from discovery to launch — with visible progress at every stage."
                : "Four stages. You see the product taking shape while the architecture is still honest."
            }
          />
        </Reveal>
        <div
          className={cn(
            "mt-14 grid border-y border-line sm:grid-cols-2 lg:grid-cols-4",
            modern && "gap-3 border-none",
          )}
        >
          {process.map((item, i) => (
            <Reveal key={item.step} delay={i * 0.05}>
              <article
                className={cn(
                  "h-full border-line p-7 sm:border-r sm:last:border-r-0 lg:[&:nth-child(2)]:border-r",
                  modern && "theme-panel border border-line sm:border",
                )}
              >
                <p
                  className={cn(
                    "text-ice",
                    modern ? "ui-label" : "font-mono text-[11px]",
                  )}
                >
                  {modern ? `Step ${item.step}` : item.step}
                </p>
                <h3 className="display mt-6 text-2xl text-cream">{item.title}</h3>
                <p className="mt-3 text-[14px] leading-7 text-muted">
                  {item.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
