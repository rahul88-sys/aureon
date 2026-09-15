"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { getStoredToken, setStoredToken, userFromToken } from "@/lib/api";
import { applyTheme, isTheme } from "@/lib/theme";

function readTokenFromUrl(): string | null {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash.replace(/^#/, "");
  if (hash) {
    const fromHash = new URLSearchParams(hash).get("token");
    if (fromHash) return decodeURIComponent(fromHash);
  }

  const fromQuery = new URLSearchParams(window.location.search).get("token");
  if (fromQuery) return decodeURIComponent(fromQuery);

  return null;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setUser, refresh } = useAuth();
  const [status, setStatus] = useState<"working" | "ok" | "error">("working");

  useEffect(() => {
    const token = readTokenFromUrl() || getStoredToken();

    if (!token) {
      setStatus("error");
      return;
    }

    const localUser = userFromToken(token);
    setStoredToken(token);
    if (localUser) {
      setUser(localUser);
      if (localUser.theme && isTheme(localUser.theme)) {
        applyTheme(localUser.theme);
      }
    }
    setStatus("ok");
    void refresh();

    window.history.replaceState(null, "", "/auth/callback");

    const t = window.setTimeout(() => {
      router.replace("/");
    }, 500);

    return () => window.clearTimeout(t);
  }, [router, refresh, setUser]);

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-start justify-center px-5 pt-28 sm:px-8">
      <p className="ui-label text-ice">
        {status === "error" ? "Sign in" : "Welcome"}
      </p>
      <h1 className="display mt-4 text-3xl text-cream">
        {status === "error" ? "Could not finish sign in." : "You're in."}
      </h1>
      <p className="mt-3 text-[15px] leading-7 text-muted">
        {status === "error"
          ? "Try signing in again from the header."
          : "Taking you back to the site…"}
      </p>
      <Link href="/" className="ui-label mt-6 text-ice hover:text-cream">
        Continue →
      </Link>
    </section>
  );
}
