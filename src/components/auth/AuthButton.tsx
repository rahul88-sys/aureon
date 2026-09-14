"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchSession,
  googleLoginUrl,
  logoutSession,
  type SessionUser,
} from "@/lib/api";
import { cn } from "@/lib/utils";

export function AuthButton({ className }: { className?: string }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void fetchSession().then((session) => {
      if (!alive) return;
      setUser(session);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <span
        className={cn(
          "theme-control hidden h-10 w-24 animate-pulse rounded-[var(--radius-sm)] bg-white/5 sm:inline-flex",
          className,
        )}
      />
    );
  }

  if (user) {
    return (
      <div className={cn("hidden items-center gap-2 sm:flex", className)}>
        {user.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.picture}
            alt=""
            className="h-8 w-8 rounded-full border border-line"
          />
        ) : null}
        <span className="max-w-[120px] truncate text-[12px] text-cream-dim">
          {user.name}
        </span>
        <button
          type="button"
          className="theme-control border border-line px-3 py-2 ui-label text-muted hover:border-ice hover:text-ice"
          onClick={async () => {
            await logoutSession();
            setUser(null);
            router.refresh();
          }}
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <a
      href={googleLoginUrl()}
      className={cn(
        "theme-control hidden items-center border border-line px-3 py-2 ui-label text-muted transition-colors hover:border-ice hover:text-ice sm:inline-flex",
        className,
      )}
    >
      Google sign-in
    </a>
  );
}
