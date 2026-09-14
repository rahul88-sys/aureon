import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { nav, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink-soft">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-5">
          <Logo />
          <p className="mt-5 max-w-sm text-[14px] leading-7 text-muted">
            A software engineering studio. We design and build digital products
            for companies that treat technology as infrastructure — not a
            brochure.
          </p>
          <p className="mt-6 ui-label text-ice">
            {site.location}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
          <div>
            <p className="ui-label text-muted">
              Studio
            </p>
            <ul className="mt-4 space-y-2.5">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[14px] text-cream-dim transition-colors hover:text-cream"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="ui-label text-muted">
              Contact
            </p>
            <ul className="mt-4 space-y-2.5 text-[14px] text-cream-dim">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="transition-colors hover:text-cream"
                >
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-cream"
                >
                  {site.phone}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="ui-label text-muted">
              Legal
            </p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/privacy"
                  className="text-[14px] text-cream-dim transition-colors hover:text-cream"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-[14px] text-cream-dim transition-colors hover:text-cream"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © 2026 {site.legal}. All rights reserved.
          </p>
          <p className="font-mono tracking-[0.14em] uppercase text-ice">
            Engineering with restraint.
          </p>
        </div>
      </div>
    </footer>
  );
}
