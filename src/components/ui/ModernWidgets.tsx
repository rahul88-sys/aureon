import { cn } from "@/lib/utils";

type Status = "Active" | "Standby" | "Queued";

const styles: Record<Status, string> = {
  Active: "border-ice/40 bg-ice/15 text-ice",
  Standby: "border-gold/40 bg-gold/10 text-gold",
  Queued: "border-line-strong bg-surface text-muted",
};

export function StatusBadge({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide",
        styles[status],
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "Active" && "bg-ice",
          status === "Standby" && "bg-gold",
          status === "Queued" && "bg-muted",
        )}
      />
      {status}
    </span>
  );
}

export function Meter({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[13px] text-cream-dim">{label}</span>
        <span className="text-[12px] font-semibold tabular-nums text-cream">
          {value}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-ice to-gold transition-[width] duration-700 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
