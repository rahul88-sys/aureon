import { technologies } from "@/lib/site";

export function TechStrip() {
  const row = [...technologies, ...technologies];

  return (
    <section
      aria-label="Technologies we work with"
      className="modern-tech relative border-y border-line bg-ink-soft/80 py-6"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink-soft to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink-soft to-transparent" />
      <div className="overflow-hidden">
        <div className="marquee-track flex w-max items-center gap-10 pr-10">
          {row.map((tech, i) => (
            <div key={`${tech}-${i}`} className="flex items-center gap-10">
              <span className="tech-label text-[13px] tracking-[0.18em] text-cream-dim uppercase">
                {tech}
              </span>
              <span className="tech-dot h-1 w-1 bg-ice" aria-hidden />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
