import dynamic from "next/dynamic";
import { Suspense } from "react";
import { AboutPreview } from "@/components/home/AboutPreview";
import { CTA } from "@/components/home/CTA";
import { Hero } from "@/components/home/Hero";
import { Process } from "@/components/home/Process";
import { Services } from "@/components/home/Services";
import { TechStrip } from "@/components/home/TechStrip";
import { Testimonials } from "@/components/home/Testimonials";
import { WhyUs } from "@/components/home/WhyUs";
import { Work } from "@/components/home/Work";

const ModernInsights = dynamic(
  () =>
    import("@/components/home/ModernInsights").then((m) => m.ModernInsights),
  { ssr: true },
);

const NextShowcase = dynamic(
  () => import("@/components/home/NextShowcase").then((m) => m.NextShowcase),
  { ssr: true },
);

function SectionFallback() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="h-40 animate-pulse rounded-[28px] bg-white/[0.04]" />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <TechStrip />
      <Services />
      <Work limit={3} />
      <WhyUs />
      <Suspense fallback={<SectionFallback />}>
        <ModernInsights />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <NextShowcase />
      </Suspense>
      <Process />
      <AboutPreview />
      <Testimonials />
      <CTA />
    </>
  );
}
