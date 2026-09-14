"use client";

import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProcessStep = {
  id: string;
  label: string;
  detail?: string;
};

export function ProcessSteps({
  steps,
  activeId,
  doneIds,
  title = "Preparing your file",
}: {
  steps: ProcessStep[];
  activeId: string | null;
  doneIds: Set<string>;
  title?: string;
}) {
  return (
    <div className="theme-panel relative overflow-hidden border border-line p-6 sm:p-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, color-mix(in oklab, var(--ice) 18%, transparent), transparent 55%)",
        }}
      />
      <div className="relative">
        <p className="ui-label text-ice">{title}</p>
        <p className="mt-2 text-[13px] text-muted">
          Files stay in your browser — nothing is uploaded to our servers.
        </p>
        <ol className="mt-6 space-y-3">
          {steps.map((step, i) => {
            const done = doneIds.has(step.id);
            const active = activeId === step.id;
            return (
              <li
                key={step.id}
                className={cn(
                  "flex items-start gap-3 rounded-[var(--radius-sm)] border px-3 py-3 transition-all duration-500",
                  done && "border-ice/30 bg-ice/[0.06]",
                  active && "border-ice/50 bg-ice/[0.1] shadow-[0_0_0_1px_rgba(200,255,58,0.08)]",
                  !done && !active && "border-line/70 opacity-55",
                )}
                style={{
                  transitionDelay: `${i * 40}ms`,
                }}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px]",
                    done && "border-ice bg-ice text-ink",
                    active && "border-ice text-ice",
                    !done && !active && "border-line text-muted",
                  )}
                >
                  {done ? (
                    <Check size={13} strokeWidth={2.5} />
                  ) : active ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-[13px] font-medium",
                      done || active ? "text-cream" : "text-cream-dim",
                    )}
                  >
                    {step.label}
                  </span>
                  {active && step.detail ? (
                    <span className="mt-0.5 block text-[11px] text-muted">
                      {step.detail}
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ol>
        {activeId ? (
          <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-ice/80 transition-all duration-700 ease-out"
              style={{
                width: `${Math.min(
                  96,
                  (([...doneIds].length + 0.45) / Math.max(steps.length, 1)) *
                    100,
                )}%`,
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
