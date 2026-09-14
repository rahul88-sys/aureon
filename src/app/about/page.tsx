import type { Metadata } from "next";
import { CTA } from "@/components/home/CTA";
import { PageHero } from "@/components/ui/PageHero";
import { principles, stats } from "@/lib/site";

export const metadata: Metadata = {
  title: "Studio",
  description:
    "Aureon is an independent software engineering studio in Pune, working with companies worldwide.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="SYS // studio"
        title="People who still write the software."
        body="Aureon was founded to do a specific kind of work: digital products that have to survive contact with a real business. Not pitch-deck software. Not a theme with a logo swapped in."
      />

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="display text-2xl text-cream sm:text-3xl">How we are built</h2>
          <div className="mt-6 space-y-5 text-[16px] leading-8 text-muted">
            <p>
              We are independent, based in Pune, and work with teams across
              India, the Gulf, Europe and North America. Engagements are led by
              senior engineers and designers — the same people on the kickoff
              call and in the repository.
            </p>
            <p>
              Our stack is chosen for longevity: React and Next.js on the
              frontend, .NET and Node where the domain demands it, Azure and
              Vercel in production, and carefully scoped AI assistants when a
              conversation is the right interface. We will argue against a
              fashionable tool if it will make your life worse in eighteen
              months.
            </p>
            <p>
              We take on a limited number of projects at a time. That is the
              product: attention.
            </p>
          </div>
        </div>
        <aside className="grid grid-cols-2 border border-line lg:col-span-5 lg:grid-cols-1">
          {stats.map((item) => (
            <div key={item.label} className="border-b border-line p-6 last:border-b-0">
              <p className="font-mono text-3xl text-cream">{item.value}</p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                {item.label}
              </p>
            </div>
          ))}
        </aside>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <h2 className="display text-2xl text-cream sm:text-3xl">What we protect</h2>
          <div className="mt-10 grid border-t border-line sm:grid-cols-2">
            {principles.map((item) => (
              <article
                key={item.title}
                className="border-b border-line p-7 sm:odd:border-r"
              >
                <h3 className="display text-xl text-cream">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
