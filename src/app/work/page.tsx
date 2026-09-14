import type { Metadata } from "next";
import { Work } from "@/components/home/Work";
import { CTA } from "@/components/home/CTA";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected product and platform work from Aureon — fintech, healthcare, logistics and retail.",
};

export default function WorkPage() {
  return (
    <>
      <PageHero
        eyebrow="DEP // work"
        title="Selected deployments."
        body="A handful of engagements. Names are representative — the problems, constraints and outcomes are the kind of work we take on."
      />
      <Work hideHeading />
      <CTA />
    </>
  );
}
