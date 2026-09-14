"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, ChevronDown, Palette } from "lucide-react";
import {
  applyTheme,
  getStoredTheme,
  type Theme,
} from "@/lib/theme";
import { useTheme } from "@/components/theme/ThemeToggle";
import { MenuDropdown } from "@/components/ui/MenuDropdown";
import { cn } from "@/lib/utils";

const options: { id: Theme; label: string; hint: string }[] = [
  { id: "modern", label: "Modern", hint: "Soft product look" },
  { id: "signal", label: "Signal", hint: "Engineering look" },
];

export function ThemeMenu({ className }: { className?: string }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Theme>("signal");
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setCurrent(getStoredTheme());
  }, [theme]);

  return (
    <MenuDropdown
      open={open}
      onClose={close}
      className={className}
      widthClass="w-56"
      trigger={
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Appearance"
          title="Appearance"
          onClick={() => setOpen((v) => !v)}
          className="theme-control inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-white/[0.03] px-3 text-cream-dim transition hover:border-ice/35 hover:text-cream"
        >
          <Palette size={15} className="text-ice" />
          <span className="hidden text-[12px] font-medium sm:inline">Theme</span>
          <ChevronDown
            size={14}
            className={cn("transition", open && "rotate-180")}
          />
        </button>
      }
    >
      <p className="px-2.5 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
        Appearance
      </p>
      {options.map((option) => {
        const active = current === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="menuitemradio"
            aria-checked={active}
            className={cn(
              "flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-2.5 py-2.5 text-left transition",
              active
                ? "bg-ice/10 text-cream"
                : "text-cream-dim hover:bg-white/[0.04] hover:text-cream",
            )}
            onClick={() => {
              applyTheme(option.id);
              setCurrent(option.id);
              setOpen(false);
            }}
          >
            <span
              className={cn(
                "h-2 w-2 shrink-0",
                option.id === "modern" ? "rounded-full bg-gold" : "bg-ice",
              )}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium">
                {option.label}
              </span>
              <span className="block text-[11px] text-muted">{option.hint}</span>
            </span>
            {active ? <Check size={14} className="text-ice" /> : null}
          </button>
        );
      })}
    </MenuDropdown>
  );
}
