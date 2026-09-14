"use client";

import { useEffect, useState } from "react";
import {
  applyTheme,
  getStoredTheme,
  themeCopy,
  type Theme,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("signal");

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  const next: Theme = theme === "signal" ? "modern" : "signal";
  const copy = themeCopy[theme];

  return (
    <button
      type="button"
      className={cn(
        "theme-control inline-flex h-10 items-center gap-2 border border-line px-3 ui-label text-muted transition-all hover:border-ice hover:text-ice",
        theme === "modern" &&
          "rounded-full border-ice/25 bg-white/[0.04] px-3.5 backdrop-blur-md hover:bg-ice/10",
        className,
      )}
      aria-label={copy.toggleHint}
      title={copy.toggleHint}
      onClick={() => {
        applyTheme(next);
        setTheme(next);
      }}
    >
      <span
        className={cn(
          "h-1.5 w-1.5",
          theme === "modern" ? "rounded-full bg-gold" : "bg-ice",
        )}
      />
      {copy.toggle}
    </button>
  );
}

export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>("signal");

  useEffect(() => {
    setTheme(getStoredTheme());
    const onTheme = (e: Event) => {
      const detail = (e as CustomEvent<Theme>).detail;
      if (detail === "signal" || detail === "modern") setTheme(detail);
    };
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === "aureon-theme" &&
        (e.newValue === "signal" || e.newValue === "modern")
      ) {
        setTheme(e.newValue);
      }
    };
    window.addEventListener("aureon-theme", onTheme);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("aureon-theme", onTheme);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return theme;
}
