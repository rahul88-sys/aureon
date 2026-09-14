"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme/ThemeToggle";

export function ScrollProgress() {
  const modern = useTheme() === "modern";
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!modern) return;
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? (el.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [modern]);

  if (!modern) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] bg-transparent"
      aria-hidden
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-ice via-gold to-ice shadow-[0_0_12px_rgba(79,209,197,0.65)] transition-[width] duration-75 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
