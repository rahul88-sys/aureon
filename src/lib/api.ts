export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:4000/api";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: "google";
};

export async function fetchSession(): Promise<SessionUser | null> {
  try {
    const res = await fetch(`${apiBaseUrl}/auth/me`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok?: boolean; user?: SessionUser };
    return data.user ?? null;
  } catch {
    return null;
  }
}

export function googleLoginUrl() {
  return `${apiBaseUrl}/auth/google`;
}

export async function logoutSession() {
  await fetch(`${apiBaseUrl}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}
