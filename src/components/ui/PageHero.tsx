import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: React.ReactNode;
  body?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line pt-28">
      <div className="pointer-events-none absolute inset-0 grid-fade opacity-70" />
      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="ui-label text-ice">{eyebrow}</p>
        <h1
          className={cn(
            "display mt-4 max-w-4xl text-4xl text-cream sm:text-5xl lg:text-6xl lg:leading-[1.02]",
          )}
        >
          {title}
        </h1>
        {body ? (
          <p className="mt-6 max-w-2xl text-[16px] leading-8 text-muted">{body}</p>
        ) : null}
      </div>
    </section>
  );
}
