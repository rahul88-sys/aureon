import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-5 pt-24 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ice">
        ERR.404
      </p>
      <h1 className="display mt-4 max-w-lg text-4xl text-cream sm:text-5xl">
        Page not in the system.
      </h1>
      <p className="mt-4 max-w-md text-muted">
        The URL may have moved, or it never existed. The work is still this way.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/">Back_home</Button>
        <Button href="/contact" variant="ghost">
          Contact
        </Button>
      </div>
      <Link
        href="/work"
        className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-ice hover:text-cream"
      >
        Or look at the work →
      </Link>
    </section>
  );
}
