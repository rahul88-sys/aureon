"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { HeroCanvas } from "@/components/home/HeroCanvas";
import { useTheme } from "@/components/theme/ThemeToggle";
import { themeCopy } from "@/lib/theme";
import { stats } from "@/lib/site";
import { cn } from "@/lib/utils";

const fade = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

export function Hero() {
  const theme = useTheme();
  const copy = themeCopy[theme];
  const modern = theme === "modern";

  return (
    <section className="relative isolate overflow-hidden pt-24">
      <div className="pointer-events-none absolute inset-0">
        {modern ? (
          <>
            <div className="modern-orb modern-orb-a" />
            <div className="modern-orb modern-orb-b" />
            <div className="modern-orb absolute bottom-[8%] left-[40%] h-56 w-56 bg-gold/25 opacity-40 blur-[70px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/40 to-ink" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ice/50 to-transparent" />
          </>
        ) : (
          <>
            <HeroCanvas />
            <div className="grid-fade absolute inset-0 opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/50 to-ink" />
          </>
        )}
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-12 lg:pb-24 lg:pt-14">
        <div className="lg:col-span-7">
          <motion.div
            initial={fade.initial}
            animate={fade.animate}
            className={cn(
              "theme-control inline-flex items-center gap-2 border border-line px-3 py-1.5 ui-label text-ice",
              modern && "modern-chip sexy-shimmer",
            )}
          >
            <span
              className={cn(
                "sys-pulse h-1.5 w-1.5 bg-ice",
                modern && "rounded-full",
              )}
            />
            {copy.live}
          </motion.div>

          <motion.h1
            initial={fade.initial}
            animate={fade.animate}
            transition={{ delay: 0.06 }}
            className={cn(
              "display mt-7 max-w-3xl text-[2.7rem] leading-[0.95] text-cream sm:text-6xl lg:text-[4.6rem]",
              modern && "leading-[1.02] sm:leading-[1.05]",
            )}
          >
            {modern ? (
              <>
                We build products
                <br />
                people trust.
              </>
            ) : (
              <>
                We build
                <br />
                systems.
              </>
            )}
          </motion.h1>

          <motion.p
            initial={fade.initial}
            animate={fade.animate}
            transition={{ delay: 0.12 }}
            className={cn(
              "mt-5 text-ice",
              modern ? "text-[15px] font-medium tracking-wide text-cream-dim" : "font-mono text-[12px]",
            )}
          >
            {copy.stackLine}
          </motion.p>

          <motion.p
            initial={fade.initial}
            animate={fade.animate}
            transition={{ delay: 0.16 }}
            className={cn(
              "mt-6 max-w-xl text-[16px] leading-8 text-muted",
              modern && "text-[17px] leading-8 text-cream-dim/90",
            )}
          >
            {modern
              ? "Aureon is a software studio for teams that need clear products, calm interfaces, and systems that stay reliable after launch."
              : "Aureon is a software engineering studio. We design, build and scale websites, products and platforms for companies that need technology they can actually run a business on."}
          </motion.p>

          <motion.div
            initial={fade.initial}
            animate={fade.animate}
            transition={{ delay: 0.22 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Button href="/contact">{copy.start}</Button>
            <Button href="/services" variant="ghost">
              {copy.services}
            </Button>
          </motion.div>

          <motion.dl
            initial={fade.initial}
            animate={fade.animate}
            transition={{ delay: 0.3 }}
            className={cn(
              "mt-12 grid grid-cols-2 gap-6 border-t border-line pt-8 sm:grid-cols-4",
              modern && "gap-3 border-none pt-10 sm:gap-3",
            )}
          >
            {stats.map((item) => (
              <div
                key={item.label}
                className={cn(modern && "modern-stat")}
              >
                <dt className="ui-label text-muted">{item.label}</dt>
                <dd
                  className={cn(
                    "mt-1.5 text-lg text-cream",
                    modern ? "font-sans text-xl font-semibold tracking-tight" : "font-mono",
                  )}
                >
                  {item.value}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <div className="relative lg:col-span-5">
          <HeroPanels modern={modern} />
        </div>
      </div>
    </section>
  );
}

function HeroPanels({ modern }: { modern: boolean }) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-md space-y-3 text-[11px] lg:max-w-none",
        modern ? "space-y-4 font-sans text-[12px]" : "font-mono",
      )}
    >
      <article
        className={cn(
          "theme-panel border border-line bg-ink-elevated p-4",
          modern && "p-5",
        )}
      >
        <div className="flex items-center justify-between text-muted">
          <span className={modern ? "font-medium text-cream-dim" : undefined}>
            {modern ? "Product status" : "PROD.STATUS"}
          </span>
          <span className="inline-flex items-center gap-2 text-ice">
            <span
              className={cn(
                "sys-pulse h-1.5 w-1.5 bg-ice",
                modern && "rounded-full",
              )}
            />
            Healthy
          </span>
        </div>
        <p className={cn("mt-4 text-cream", modern && "text-[15px] font-medium")}>
          Northwell Clinic · API
        </p>
        <div
          className={cn(
            "mt-4 grid grid-cols-3 gap-px bg-line",
            modern && "gap-2 overflow-visible rounded-none bg-transparent",
          )}
        >
          {[
            ["p95", "41ms"],
            ["uptime", "99.98%"],
            ["deploys", "12d"],
          ].map(([k, v]) => (
            <div
              key={k}
              className={cn(
                "bg-ink px-2 py-2",
                modern && "rounded-[var(--radius-sm)] border border-line bg-ink/50 px-3 py-3",
              )}
            >
              <p className="ui-label text-[9px] text-muted">{k}</p>
              <p className={cn("mt-1 text-sm text-cream", modern && "text-base font-semibold")}>
                {v}
              </p>
            </div>
          ))}
        </div>
      </article>
      <article className="theme-panel border border-line bg-ink p-4 leading-6 text-cream-dim sm:p-5">
        <p className={cn("text-muted", modern && "ui-label text-ice")}>
          {modern ? "Settlement service" : "// settlement.service"}
        </p>
        {modern ? (
          <p className="mt-3 text-[14px] leading-7 text-cream">
            Same-day clearing for the IN–SG corridor, with policy checks before
            each transfer.
          </p>
        ) : (
          <>
            <p>
              <span className="text-ice">await</span> rails.clear(
            </p>
            <p className="pl-4">corridor: &quot;IN-SG&quot;,</p>
            <p className="pl-4">policy: &quot;same-day&quot;</p>
            <p>)</p>
          </>
        )}
      </article>
      <article
        className={cn(
          "theme-panel border border-ice/40 bg-ink-elevated p-4 sm:p-5",
          modern && "border-ice/25 bg-gradient-to-br from-ice/10 to-transparent",
        )}
      >
        <p className="ui-label text-ice">Stack</p>
        <p className={cn("mt-2 text-cream-dim", modern && "text-[14px] text-cream")}>
          Next.js · .NET · Azure · TypeScript
        </p>
      </article>
    </div>
  );
}
