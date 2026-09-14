"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Wrench } from "lucide-react";
import { MenuDropdown } from "@/components/ui/MenuDropdown";
import { tools } from "@/lib/tools";
import { cn } from "@/lib/utils";

export function ToolsNavMenu({ className }: { className?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const active = pathname === "/tools" || pathname.startsWith("/tools/");

  return (
    <MenuDropdown
      open={open}
      onClose={close}
      align="left"
      widthClass="w-72"
      className={className}
      trigger={
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "ui-label inline-flex items-center gap-1 text-muted transition-colors hover:text-ice",
            active && "text-ice",
          )}
        >
          Tools
          <ChevronDown
            size={14}
            className={cn("transition", open && "rotate-180")}
          />
        </button>
      }
    >
      <p className="px-2.5 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
        Free converters
      </p>
      <Link
        href="/tools"
        role="menuitem"
        onClick={close}
        className="mb-1 flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-[13px] font-medium text-cream-dim transition hover:bg-white/[0.05] hover:text-cream"
      >
        <Wrench size={14} className="text-ice" />
        All tools
      </Link>
      {tools.map((tool) => (
        <Link
          key={tool.slug}
          href={`/tools/${tool.slug}`}
          role="menuitem"
          onClick={close}
          className={cn(
            "flex w-full flex-col rounded-[var(--radius-sm)] px-2.5 py-2.5 text-left transition",
            pathname === `/tools/${tool.slug}`
              ? "bg-ice/10 text-cream"
              : "text-cream-dim hover:bg-white/[0.04] hover:text-cream",
          )}
        >
          <span className="text-[13px] font-medium">{tool.title}</span>
          <span className="text-[11px] text-muted">{tool.hint}</span>
        </Link>
      ))}
    </MenuDropdown>
  );
}
