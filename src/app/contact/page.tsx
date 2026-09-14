import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageHero } from "@/components/ui/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a project with Aureon. Tell us what you are building — we will tell you if we are the right studio.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="CH // contact"
        title="Tell us the problem."
        body="A short brief is enough: what you need, who it is for, and when it has to exist. We reply within two working days."
      />
      <section className="mx-auto grid max-w-7xl gap-14 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-7">
          <ContactForm />
        </div>
        <aside className="space-y-0 lg:col-span-5">
          <div className="border border-line p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ice">
              Direct
            </p>
            <a
              href={`mailto:${site.email}`}
              className="mt-4 block font-mono text-lg text-cream hover:text-ice"
            >
              {site.email}
            </a>
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="mt-2 block text-cream-dim hover:text-cream"
            >
              {site.phone}
            </a>
            <p className="mt-6 font-mono text-[12px] text-muted">{site.location}</p>
          </div>
          <div className="border border-t-0 border-line p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ice">
              A useful brief includes
            </p>
            <ul className="mt-5 space-y-3 font-mono text-[13px] leading-7 text-muted">
              <li>— What exists today, and what is failing</li>
              <li>— Who will use the product</li>
              <li>— A date that actually matters</li>
              <li>— Whether this is a build, a rescue, or ongoing care</li>
            </ul>
          </div>
        </aside>
      </section>
    </>
  );
}
