"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center px-5 py-24 sm:px-8">
      <p className="ui-label text-ice">Something broke</p>
      <h1 className="display mt-4 text-3xl text-cream sm:text-4xl">
        We hit an unexpected error.
      </h1>
      <p className="mt-4 text-[15px] leading-7 text-muted">
        You can try again, or head back home while we keep the rest of the site
        running.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="theme-control border border-ice bg-ice/15 px-5 py-2.5 ui-label text-ice hover:bg-ice hover:text-ink"
        >
          Try again
        </button>
        <Link
          href="/"
          className="theme-control border border-line px-5 py-2.5 ui-label text-cream-dim hover:text-cream"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
