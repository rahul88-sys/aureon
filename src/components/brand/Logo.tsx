"use client";

import Link from "next/link";
import { useTheme } from "@/components/theme/ThemeToggle";
import { themeCopy } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn("h-5 w-5", className)}
    >
      <rect
        className="mark-frame"
        x="1"
        y="1"
        width="22"
        height="22"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M6 18 L12 6 L18 18" stroke="var(--ice)" strokeWidth="1.4" />
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  const theme = useTheme();
  const suffix = themeCopy[theme].brandSuffix;

  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-3 text-cream", className)}
      aria-label="Aureon home"
    >
      <Mark />
      <span className="ui-label text-[12px] tracking-[0.08em] text-cream sm:tracking-[0.14em]">
        Aureon
        {suffix ? <span className="text-ice">{suffix}</span> : null}
      </span>
    </Link>
  );
}
