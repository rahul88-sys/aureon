"use client";

import { Reveal } from "@/components/ui/Reveal";
import { useTheme } from "@/components/theme/ThemeToggle";
import { testimonials } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Testimonials() {
  const theme = useTheme();
  const modern = theme === "modern";

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
      <Reveal>
        <p className="ui-label text-ice">
          {modern ? "Client notes" : "LOG // notes"}
        </p>
        <h2 className="display mt-4 max-w-xl text-3xl text-cream sm:text-4xl">
          {modern
            ? "What working with us feels like."
            : "What it feels like to ship with us."}
        </h2>
      </Reveal>
      <div
        className={cn(
          "mt-14 grid border-t border-line lg:grid-cols-3",
          modern && "gap-2 border-none",
        )}
      >
        {testimonials.map((item, i) => (
          <Reveal key={item.name} delay={i * 0.06}>
            <blockquote
              className={cn(
                "flex h-full flex-col justify-between border-b border-line p-7 lg:border-r lg:last:border-r-0",
                modern && "modern-quote border-none lg:border-none",
              )}
            >
              <p className="text-[16px] leading-8 text-cream-dim">
                “{item.quote}”
              </p>
              <footer className="mt-8 border-t border-line pt-5">
                <p className="text-sm font-medium text-cream">{item.name}</p>
                <p
                  className={cn(
                    "mt-1 text-[11px] text-muted",
                    modern ? "font-sans" : "font-mono",
                  )}
                >
                  {item.role}
                </p>
              </footer>
            </blockquote>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
