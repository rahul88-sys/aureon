"use client";

import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { useTheme } from "@/components/theme/ThemeToggle";
import { themeCopy } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function CTA() {
  const theme = useTheme();
  const copy = themeCopy[theme];
  const modern = theme === "modern";

  return (
    <section className={cn("border-t border-line", modern && "border-none")}>
      <Reveal>
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <div
            className={cn(
              modern &&
                "theme-panel relative overflow-hidden border border-line px-6 py-10 sm:px-10 sm:py-12",
            )}
          >
            {modern ? (
              <>
                <div className="modern-orb modern-orb-a !opacity-30" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-ice/10 via-transparent to-gold/10" />
              </>
            ) : null}
            <div className="relative">
              <p className="ui-label text-ice">
                {modern ? "Let's talk" : "Open_channel"}
              </p>
              <h2 className="display mt-4 max-w-3xl text-3xl text-cream sm:text-5xl sm:leading-[1.02]">
                {modern
                  ? "Ready to build something people will actually use?"
                  : "Have a product — or a system that has outgrown itself?"}
              </h2>
              <p className="mt-5 max-w-lg text-[15px] leading-7 text-muted">
                {modern
                  ? "Share the brief in a few lines. We’ll reply within two working days with a clear next step."
                  : "Tell us what you are trying to do. If we are a fit, we will say so. If we are not, we will say that too."}
              </p>
              <Button href="/contact" className="mt-8">
                {copy.start}
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
