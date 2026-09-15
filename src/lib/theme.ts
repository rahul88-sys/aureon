export type Theme = "signal" | "modern";

export const THEME_KEY = "aureon-theme";
export const THEME_COOKIE = "aureon-theme";
export const DEFAULT_THEME: Theme = "modern";

export function isTheme(value: unknown): value is Theme {
  return value === "signal" || value === "modern";
}

function readThemeCookie(): Theme | null {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${THEME_COOKIE}=`));
    if (!match) return null;
    const value = decodeURIComponent(match.split("=").slice(1).join("="));
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

function writeThemeCookie(theme: Theme) {
  if (typeof document === "undefined") return;
  try {
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${THEME_COOKIE}=${encodeURIComponent(theme)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (isTheme(stored)) return stored;
  } catch {
    /* ignore */
  }
  const cookie = readThemeCookie();
  if (cookie) return cookie;
  return DEFAULT_THEME;
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
  writeThemeCookie(theme);
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
