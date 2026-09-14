import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms"
        body="A short note on using this website and talking to the studio."
      />
      <article className="mx-auto max-w-3xl space-y-6 px-5 py-16 text-[15px] leading-8 text-muted sm:px-8">
        <p>
          The material on this site describes {site.legal} and the kind of work
          we take on. It is not a contract. Project scope, fees and timelines
          are agreed in writing before work begins.
        </p>
        <p>
          Case studies are representative of the problems we solve. Names and
          some details may be changed where a client has asked for discretion.
        </p>
        <p>
          If something on this site is inaccurate, tell us at {site.email} and
          we will correct it.
        </p>
      </article>
    </>
  );
}
