import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function AboutPreview() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto grid max-w-7xl items-start gap-12 px-5 py-24 sm:px-8 lg:grid-cols-12 lg:py-32">
        <Reveal className="lg:col-span-6">
          <p className="ui-label text-ice">SYS // studio</p>
          <h2 className="display mt-4 text-3xl text-cream sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]">
            Independent. Senior. Pune / worldwide.
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-6">
          <p className="text-[16px] leading-8 text-muted">
            Aureon is a compact software studio — engineers and designers who
            have shipped products, not a staffing bench. We take on a small
            number of engagements so the people you meet are the people writing
            the code.
          </p>
          <p className="mt-4 text-[16px] leading-8 text-muted">
            If you need a hundred juniors by Monday, we are not the firm. If you
            need a product that will still make sense in three years, we should
            talk.
          </p>
          <Button href="/about" variant="ghost" className="mt-8">
            About_studio
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
