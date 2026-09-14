"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Gauge, Table2 } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Meter, StatusBadge } from "@/components/ui/ModernWidgets";
import { useTheme } from "@/components/theme/ThemeToggle";
import {
  capacityMeters,
  deliveryRows,
  stackCompare,
} from "@/lib/site";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "delivery", label: "Delivery board", icon: Table2 },
  { id: "capacity", label: "Studio capacity", icon: Gauge },
  { id: "compare", label: "Typical vs Aureon", icon: Activity },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ModernInsights() {
  const modern = useTheme() === "modern";
  const [tab, setTab] = useState<TabId>("delivery");

  if (!modern) return null;

  return (
    <section className="border-t border-line/60">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Reveal>
          <SectionHeading
            eyebrow="Live studio view"
            title="How work looks inside Aureon."
            body="A clearer look at delivery lanes, capacity, and how we differ from a typical build — no fluff, just the operating picture."
          />
        </Reveal>

        <div className="mt-10 flex flex-wrap gap-2">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-medium transition-all",
                  active
                    ? "border-ice/40 bg-ice/15 text-cream shadow-[0_0_0_1px_rgba(79,209,197,0.12)]"
                    : "border-line bg-surface text-muted hover:border-ice/30 hover:text-cream",
                )}
              >
                <Icon size={15} className={active ? "text-ice" : undefined} />
                {item.label}
              </button>
            );
          })}
        </div>

        <Reveal delay={0.08}>
          <div className="theme-panel modern-table-shell mt-8 overflow-hidden border border-line">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {tab === "delivery" ? <DeliveryTable /> : null}
                {tab === "capacity" ? <CapacityPanel /> : null}
                {tab === "compare" ? <CompareTable /> : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function DeliveryTable() {
  return (
    <div className="overflow-x-auto">
      <table className="modern-table w-full min-w-[640px] text-left">
        <thead>
          <tr>
            <th>Area</th>
            <th>Stack</th>
            <th>Typical timeline</th>
            <th>Load</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {deliveryRows.map((row) => (
            <tr key={row.area}>
              <td className="font-medium text-cream">{row.area}</td>
              <td className="text-cream-dim">{row.stack}</td>
              <td className="tabular-nums text-cream-dim">{row.sla}</td>
              <td>
                <div className="flex min-w-[110px] items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-ice to-gold"
                      style={{ width: `${row.load}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[12px] tabular-nums text-muted">
                    {row.load}
                  </span>
                </div>
              </td>
              <td>
                <StatusBadge status={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CapacityPanel() {
  return (
    <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-12">
      <div className="space-y-5 lg:col-span-7">
        {capacityMeters.map((item) => (
          <Meter key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
      <aside className="flex flex-col justify-between gap-6 rounded-[var(--radius)] border border-line bg-ink/40 p-5 lg:col-span-5">
        <div>
          <p className="ui-label text-ice">Snapshot</p>
          <p className="mt-3 text-[15px] leading-7 text-cream-dim">
            We keep a small concurrent load on purpose. That is how senior people
            stay on your work instead of rotating juniors mid-sprint.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="modern-stat">
            <p className="ui-label text-muted">Open slots</p>
            <p className="mt-1 text-2xl font-semibold text-cream">2</p>
          </div>
          <div className="modern-stat">
            <p className="ui-label text-muted">Avg response</p>
            <p className="mt-1 text-2xl font-semibold text-cream">&lt;48h</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function CompareTable() {
  return (
    <div className="overflow-x-auto">
      <table className="modern-table w-full min-w-[560px] text-left">
        <thead>
          <tr>
            <th>Capability</th>
            <th>Typical vendor</th>
            <th>Aureon</th>
          </tr>
        </thead>
        <tbody>
          {stackCompare.map((row) => (
            <tr key={row.capability}>
              <td className="font-medium text-cream">{row.capability}</td>
              <td className="text-muted">{row.typical}</td>
              <td>
                <span className="inline-flex rounded-full border border-ice/30 bg-ice/10 px-2.5 py-1 text-[12px] font-medium text-ice">
                  {row.aureon}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
