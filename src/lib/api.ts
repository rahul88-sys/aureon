/** Prefer same-origin `/nest-api` rewrite in production to avoid CORS-cancelled auth calls. */
export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  (typeof window !== "undefined" ? "/nest-api" : "http://localhost:4000/api");

export const AUTH_TOKEN_KEY = "aureon_token";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: "google";
  theme?: "signal" | "modern";
};

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    else window.localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event("aureon-auth"));
}

/** Decode JWT payload locally so the UI can update even if /auth/me is slow/offline. */
export function userFromToken(token: string): SessionUser | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(atob(padded)) as {
      sub?: string;
      email?: string;
      name?: string;
      picture?: string;
      provider?: string;
      theme?: string;
      exp?: number;
    };
    if (!payload.sub || !payload.email) return null;
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name || payload.email,
      picture: payload.picture,
      provider: "google",
      theme: payload.theme === "signal" ? "signal" : "modern",
    };
  } catch {
    return null;
  }
}

export async function fetchSession(): Promise<SessionUser | null> {
  const token = getStoredToken();
  if (token) {
    const local = userFromToken(token);
    if (!local) {
      setStoredToken(null);
      return null;
    }
  } else {
    return null;
  }

  try {
    const res = await fetch(`${apiBaseUrl}/auth/me`, {
      credentials: "include",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const data = (await res.json()) as { ok?: boolean; user?: SessionUser };
      if (data.user) return data.user;
    }
  } catch {
    /* fall through to local token user */
  }

  return userFromToken(token);
}

export function googleLoginUrl() {
  return `${apiBaseUrl}/auth/google`;
}

export async function saveThemePreference(theme: "signal" | "modern") {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const res = await fetch(`${apiBaseUrl}/auth/me/theme`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ theme }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      user?: SessionUser;
      token?: string;
    };
    if (data.token) setStoredToken(data.token);
    return data.user ?? null;
  } catch {
    return null;
  }
}

export async function logoutSession() {
  setStoredToken(null);
  try {
    await fetch(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    /* ignore */
  }
}
