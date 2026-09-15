"use client";

import { useCallback, useState } from "react";
import { ChevronDown, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { MenuDropdown } from "@/components/ui/MenuDropdown";
import {
  googleLoginUrl,
  logoutSession,
  microsoftLoginUrl,
} from "@/lib/api";
import { cn } from "@/lib/utils";

function Avatar({
  name,
  picture,
  size = "md",
}: {
  name: string;
  picture?: string;
  size?: "md" | "lg";
}) {
  const [broken, setBroken] = useState(false);
  const initial = name.trim().slice(0, 1).toUpperCase() || "U";
  const box = size === "lg" ? "h-10 w-10 text-[12px]" : "h-8 w-8 text-[11px]";

  if (!picture || broken) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full border border-ice/30 bg-ice/10 font-semibold text-ice",
          box,
        )}
      >
        {initial}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={picture}
      alt={name}
      referrerPolicy="no-referrer"
      className={cn("rounded-full border border-line object-cover", box)}
      onError={() => setBroken(true)}
    />
  );
}

export function AuthButton({ className }: { className?: string }) {
  const { user, loading, setUser } = useAuth();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  if (loading) {
    return (
      <span
        className={cn(
          "theme-control inline-flex h-10 w-10 animate-pulse rounded-full bg-white/5",
          className,
        )}
      />
    );
  }

  if (user) {
    return (
      <MenuDropdown
        open={open}
        onClose={close}
        className={className}
        widthClass="w-60"
        trigger={
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="Account menu"
            onClick={() => setOpen((v) => !v)}
            className="theme-control inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-white/[0.03] py-1 pl-1 pr-2 transition hover:border-ice/40"
          >
            <Avatar name={user.name} picture={user.picture} />
            <ChevronDown
              size={14}
              className={cn(
                "text-muted transition",
                open && "rotate-180 text-cream",
              )}
            />
          </button>
        }
      >
        <div className="flex items-center gap-3 border-b border-line px-2.5 py-3">
          <Avatar name={user.name} picture={user.picture} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-cream">
              {user.name}
            </p>
            <p className="truncate text-[11px] text-muted">{user.email}</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted">
              {user.provider}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="menuitem"
          className="mt-1 flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-2.5 text-left text-[13px] font-medium text-cream-dim transition hover:bg-white/[0.05] hover:text-cream"
          onClick={async () => {
            setOpen(false);
            await logoutSession();
            setUser(null);
          }}
        >
          <LogOut size={15} className="text-ice" />
          Log out
        </button>
      </MenuDropdown>
    );
  }

  return (
    <MenuDropdown
      open={open}
      onClose={close}
      className={className}
      widthClass="w-56"
      trigger={
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Sign in"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "theme-control inline-flex items-center gap-1.5 rounded-full border border-ice/30 bg-gradient-to-r from-ice/15 to-gold/10 px-4 py-2 text-[12px] font-semibold text-cream shadow-[0_0_20px_rgba(79,209,197,0.12)] transition hover:border-ice/50 hover:from-ice/25 hover:to-gold/20",
          )}
        >
          <LogIn size={14} className="text-ice" />
          Sign in
          <ChevronDown
            size={14}
            className={cn("text-muted transition", open && "rotate-180")}
          />
        </button>
      }
    >
      <p className="px-2.5 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
        Continue with
      </p>
      <a
        href={googleLoginUrl()}
        role="menuitem"
        className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-2.5 text-[13px] font-medium text-cream-dim transition hover:bg-white/[0.05] hover:text-cream"
        onClick={() => setOpen(false)}
      >
        Google
      </a>
      <a
        href={microsoftLoginUrl()}
        role="menuitem"
        className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-2.5 text-[13px] font-medium text-cream-dim transition hover:bg-white/[0.05] hover:text-cream"
        onClick={() => setOpen(false)}
      >
        Microsoft
      </a>
    </MenuDropdown>
  );
}
