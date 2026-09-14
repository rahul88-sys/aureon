"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Cloud,
  Code2,
  Globe,
  Layout,
  MonitorSmartphone,
  Server,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { SpotlightCard } from "@/components/modern/SpotlightCard";
import { CTA } from "@/components/home/CTA";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { StatusBadge } from "@/components/ui/ModernWidgets";
import { services } from "@/lib/site";
import { cn } from "@/lib/utils";

type Group = "All" | "Product" | "Platform" | "AI" | "Care";

const meta: Record<
  string,
  {
    icon: LucideIcon;
    group: Exclude<Group, "All">;
    timeline: string;
    status: "Active" | "Standby" | "Queued";
  }
> = {
  "web-development": {
    icon: Globe,
    group: "Product",
    timeline: "2–6 weeks",
    status: "Active",
  },
  "custom-software": {
    icon: Code2,
    group: "Platform",
    timeline: "6–14 weeks",
    status: "Active",
  },
  "react-next": {
    icon: Layout,
    group: "Product",
    timeline: "3–10 weeks",
    status: "Active",
  },
  dotnet: {
    icon: Server,
    group: "Platform",
    timeline: "4–12 weeks",
    status: "Active",
  },
  mobile: {
    icon: MonitorSmartphone,
    group: "Product",
    timeline: "8–16 weeks",
    status: "Queued",
  },
  "ui-ux": {
    icon: Sparkles,
    group: "Product",
    timeline: "2–6 weeks",
    status: "Active",
  },
  cloud: {
    icon: Cloud,
    group: "Platform",
    timeline: "Ongoing",
    status: "Standby",
  },
  maintenance: {
    icon: Wrench,
    group: "Care",
    timeline: "Retainer",
    status: "Active",
  },
  "ai-chatbots": {
    icon: Bot,
    group: "AI",
    timeline: "3–8 weeks",
    status: "Active",
  },
};

const filters: Group[] = ["All", "Product", "Platform", "AI", "Care"];

const engagement = [
  {
    model: "Fixed scope",
    best: "Clear brief, fixed outcomes",
    start: "From 3 weeks",
  },
  {
    model: "Product partnership",
    best: "Ongoing roadmap",
    start: "Monthly",
  },
  {
    model: "Rescue / rewrite",
    best: "Legacy or failing stack",
    start: "Discovery first",
  },
  {
    model: "Care retainer",
    best: "After launch",
    start: "From 20 hrs/mo",
  },
];

export function ServicesExperience() {
  const [group, setGroup] = useState<Group>("All");

  const filtered = useMemo(() => {
    if (group === "All") return services;
    return services.filter((s) => meta[s.slug]?.group === group);
  }, [group]);

  return (
    <>
      <section className="relative overflow-hidden pt-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="modern-orb modern-orb-a" />
          <div className="modern-orb modern-orb-b" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/50 to-ink" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-10 sm:px-8 sm:pb-16 sm:pt-14">
          <Reveal>
            <p className="modern-chip theme-control inline-flex items-center gap-2 border border-line ui-label text-ice">
              <span className="sys-pulse h-1.5 w-1.5 rounded-full bg-ice" />
              9 capabilities · one studio
            </p>
            <h1 className="display mt-6 max-w-4xl text-4xl leading-[1.05] text-cream sm:text-5xl lg:text-6xl">
              Services built for products that have to work.
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-8 text-cream-dim/90">
              From first interface to production systems — web, .NET, mobile,
              cloud and AI assistants. Pick a lane below, or tell us the problem
              and we will map the work.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/contact">Start a project</Button>
              <Button href="#service-board" variant="ghost">
                Browse services
              </Button>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["09", "Service lanes"],
              ["A–Z", "Design to deploy"],
              ["<48h", "First reply"],
              ["Senior", "On the work"],
            ].map(([value, label], i) => (
              <Reveal key={label} delay={i * 0.05}>
                <div className="modern-stat theme-panel border border-line">
                  <p className="text-2xl font-semibold tracking-tight text-cream">
                    {value}
                  </p>
                  <p className="ui-label mt-1 text-muted">{label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="service-board"
        className="scroll-mt-24 border-t border-line/50"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <Reveal>
              <p className="ui-label text-ice">Service board</p>
              <h2 className="display mt-3 text-3xl text-cream sm:text-4xl">
                Choose a starting point.
              </h2>
            </Reveal>
            <div className="flex flex-wrap gap-2">
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setGroup(item)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-[13px] font-medium transition-all",
                    group === item
                      ? "border-ice/40 bg-ice/15 text-cream"
                      : "border-line bg-surface text-muted hover:border-ice/30 hover:text-cream",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((service, i) => {
              const info = meta[service.slug];
              const Icon = info?.icon ?? Code2;
              return (
                <Reveal key={service.slug} delay={Math.min(i * 0.04, 0.2)}>
                  <SpotlightCard className="theme-panel h-full border border-line transition-transform hover:-translate-y-1">
                    <a
                      href={`#${service.slug}`}
                      className="group flex h-full flex-col p-6"
                    >
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] border border-ice/25 bg-ice/10 text-ice">
                        <Icon size={20} />
                      </span>
                      <StatusBadge status={info?.status ?? "Active"} />
                    </div>
                    <p className="ui-label mt-5 text-muted">
                      {service.number} · {info?.group}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-cream">
                      {service.title}
                    </h3>
                    <p className="mt-3 flex-1 text-[14px] leading-7 text-muted">
                      {service.short}
                    </p>
                    <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                      <span className="text-[12px] text-cream-dim">
                        {info?.timeline}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[13px] font-medium text-ice transition-transform group-hover:translate-x-0.5">
                        Details <ArrowRight size={14} />
                      </span>
                    </div>
                  </a>
                  </SpotlightCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-line/50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <Reveal>
            <p className="ui-label text-ice">Engagement models</p>
            <h2 className="display mt-3 max-w-2xl text-3xl text-cream sm:text-4xl">
              How teams usually start with us.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="theme-panel modern-table-shell mt-8 overflow-hidden border border-line">
              <div className="overflow-x-auto">
                <table className="modern-table w-full min-w-[560px] text-left">
                  <thead>
                    <tr>
                      <th>Model</th>
                      <th>Best for</th>
                      <th>Starts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {engagement.map((row) => (
                      <tr key={row.model}>
                        <td className="font-medium text-cream">{row.model}</td>
                        <td className="text-cream-dim">{row.best}</td>
                        <td>
                          <span className="inline-flex rounded-full border border-ice/25 bg-ice/10 px-2.5 py-1 text-[12px] font-medium text-ice">
                            {row.start}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line/50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
          <Reveal>
            <p className="ui-label text-ice">In detail</p>
            <h2 className="display mt-3 text-3xl text-cream sm:text-4xl">
              What each service actually covers.
            </h2>
          </Reveal>

          <div className="mt-12 space-y-5">
            {services.map((service, i) => {
              const info = meta[service.slug];
              const Icon = info?.icon ?? Code2;
              return (
                <Reveal key={service.slug} delay={Math.min(i * 0.03, 0.15)}>
                  <article
                    id={service.slug}
                    className="theme-panel scroll-mt-28 border border-line p-6 sm:p-8 lg:p-10"
                  >
                    <div className="grid gap-8 lg:grid-cols-12">
                      <div className="lg:col-span-7">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-ice/25 bg-ice/10 text-ice">
                            <Icon size={18} />
                          </span>
                          <p className="ui-label text-muted">
                            SRV.{service.number} · {info?.group}
                          </p>
                          <StatusBadge status={info?.status ?? "Active"} />
                        </div>
                        <h3 className="display mt-5 text-2xl text-cream sm:text-3xl">
                          {service.title}
                        </h3>
                        <p className="mt-4 text-[16px] leading-8 text-cream-dim/90">
                          {service.description}
                        </p>
                        <p className="mt-5 text-[13px] text-muted">
                          Typical timeline ·{" "}
                          <span className="font-medium text-cream">
                            {info?.timeline}
                          </span>
                        </p>
                      </div>
                      <div className="lg:col-span-5">
                        <div className="rounded-[var(--radius)] border border-line bg-ink/35 p-5">
                          <p className="ui-label text-ice">Outcomes</p>
                          <ul className="mt-4 space-y-3">
                            {service.outcomes.map((item) => (
                              <li
                                key={item}
                                className="flex gap-3 text-[14px] leading-6 text-cream-dim"
                              >
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ice" />
                                {item}
                              </li>
                            ))}
                          </ul>
                          <Link
                            href="/contact"
                            className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-ice hover:text-cream"
                          >
                            Ask about this service
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
