import { cn } from "@/lib/utils";

type Accent = "gold" | "ice" | "steel" | "cream";

export function WorkMockup({
  accent,
  name,
}: {
  accent: Accent;
  name: string;
}) {
  const bar = {
    gold: "bg-ice/80",
    ice: "bg-ice",
    steel: "bg-cream/50",
    cream: "bg-cream/70",
  }[accent];

  return (
    <div className="modern-mockup relative aspect-[16/10] overflow-hidden border border-line bg-ink-elevated">
      <div className="absolute inset-0 opacity-50 grid-fade" />
      <div className="mock-window absolute inset-5 border border-line bg-ink/70 p-4 sm:inset-7 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            <span className="mock-dot h-2 w-2 bg-white/15" />
            <span className="mock-dot h-2 w-2 bg-white/15" />
            <span className="mock-dot h-2 w-2 bg-white/15" />
          </div>
          <span className="mock-chip border border-ice/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-ice">
            {name}
          </span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
          <div className="col-span-2 space-y-2">
            <div className="h-2 w-2/5 rounded-sm bg-white/15" />
            <div className="h-24 overflow-hidden border border-line bg-white/[0.03] sm:h-28">
              <div className="flex h-full items-end gap-1.5 p-3">
                {[40, 70, 55, 90, 48, 76, 62].map((h, i) => (
                  <div
                    key={i}
                    className={cn("mock-bar flex-1 opacity-80", bar)}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-2 w-3/4 rounded-sm bg-white/10" />
            <div className="h-10 rounded-[var(--radius-sm)] border border-line bg-white/[0.03]" />
            <div className="h-10 rounded-[var(--radius-sm)] border border-line bg-white/[0.03]" />
            <div className="h-10 rounded-[var(--radius-sm)] border border-line bg-white/[0.03]" />
          </div>
        </div>
      </div>
    </div>
  );
}
