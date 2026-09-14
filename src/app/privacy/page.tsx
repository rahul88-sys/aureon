import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy"
        body={`How ${site.legal} handles the small amount of information you share with us.`}
      />
      <article className="mx-auto max-w-3xl space-y-6 px-5 py-16 text-[15px] leading-8 text-muted sm:px-8">
        <p>
          Enquiries sent through this website — name, email, company, and the
          message you write — are used only to reply to you about possible work.
          We do not sell that information, and we do not run advertising pixels
          on this site.
        </p>
        <p>
          Hosting and analytics may process technical data such as IP address
          and browser type as part of keeping the site available. If you want
          an enquiry deleted, write to {site.email}.
        </p>
        <p>This page is a studio policy, not legal advice.</p>
      </article>
    </>
  );
}
