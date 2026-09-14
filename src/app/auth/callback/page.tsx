"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const t = window.setTimeout(() => router.replace("/"), 900);
    return () => window.clearTimeout(t);
  }, [router]);

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-start justify-center px-5 pt-28 sm:px-8">
      <p className="ui-label text-ice">Signed in</p>
      <h1 className="display mt-4 text-3xl text-cream">Welcome back.</h1>
      <p className="mt-3 text-[15px] leading-7 text-muted">
        Google login worked. Taking you home…
      </p>
      <Link href="/" className="ui-label mt-6 text-ice hover:text-cream">
        Continue now →
      </Link>
    </section>
  );
}
