export type Theme = "signal" | "modern";

export const THEME_KEY = "aureon-theme";

export function isTheme(value: unknown): value is Theme {
  return value === "signal" || value === "modern";
}

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "signal";
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (isTheme(stored)) return stored;
  } catch {
    /* ignore */
  }
  return "signal";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent("aureon-theme", { detail: theme }));
}

export const themeCopy = {
  signal: {
    brandSuffix: " // SYS",
    live: "Sys live",
    stackLine: "> web · .net · ai · cloud",
    start: "Start_project",
    services: "Explore_services",
    toggle: "Modern",
    toggleHint: "Switch to modern theme",
  },
  modern: {
    brandSuffix: "",
    live: "Now booking Q2 projects",
    stackLine: "Web products · .NET platforms · AI assistants · Cloud",
    start: "Start a project",
    services: "Explore services",
    toggle: "Signal",
    toggleHint: "Switch to signal theme",
  },
} as const;
