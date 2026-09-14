"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { AuthButton } from "@/components/auth/AuthButton";
import { ThemeToggle, useTheme } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { themeCopy } from "@/lib/theme";
import { nav } from "@/lib/site";
import { cn } from "@/lib/utils";
import { googleLoginUrl } from "@/lib/api";

export function Header() {
  const pathname = usePathname();
  const theme = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const copy = themeCopy[theme];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open
          ? "border-b border-line bg-ink/90 backdrop-blur-md"
          : "bg-transparent",
        theme === "modern" && scrolled && "bg-ink/70 shadow-[0_10px_40px_rgba(0,0,0,0.25)]",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "ui-label text-muted transition-colors hover:text-ice",
                  active && "text-ice",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <AuthButton />
          <ThemeToggle className="hidden sm:inline-flex" />
          <div className="hidden md:block">
            <Button href="/contact">{copy.start}</Button>
          </div>
          <button
            type="button"
            className="theme-control inline-flex h-10 w-10 items-center justify-center border border-line text-cream md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-line bg-ink px-5 py-8 md:hidden">
          <nav className="flex flex-col">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-line py-3 ui-label text-cream-dim hover:text-ice"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={googleLoginUrl()}
                className="theme-control border border-line px-3 py-2 ui-label text-muted hover:border-ice hover:text-ice"
              >
                Google sign-in
              </a>
              <ThemeToggle />
              <Button href="/contact">{copy.start}</Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
