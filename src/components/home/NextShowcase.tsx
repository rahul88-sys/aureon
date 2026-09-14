"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Boxes,
  ImageIcon,
  Layers,
  Route,
  Server,
  Sparkles,
  Zap,
} from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/modern/SpotlightCard";
import { useTheme } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

const LiveClock = dynamic(() => import("./LiveClock"), {
  ssr: false,
  loading: () => (
    <span className="inline-block h-7 w-28 animate-pulse rounded-full bg-white/10" />
  ),
});

function BuildPulse() {
  const [data, setData] = useState<{
    routes: number;
    features: number;
    stack: string;
  } | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setData({
        routes: 12,
        features: 9,
        stack: "Next.js App Router",
      });
    }, 450);
    return () => window.clearTimeout(id);
  }, []);

  if (!data) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-[var(--radius-sm)] bg-white/5"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="modern-stat">
        <p className="text-xl font-semibold text-cream">{data.routes}</p>
        <p className="ui-label mt-1 text-muted">Routes</p>
      </div>
      <div className="modern-stat">
        <p className="text-xl font-semibold text-cream">{data.features}</p>
        <p className="ui-label mt-1 text-muted">Features</p>
      </div>
      <div className="modern-stat">
        <p className="text-[13px] font-semibold leading-5 text-cream">
          {data.stack}
        </p>
        <p className="ui-label mt-1 text-muted">Runtime</p>
      </div>
    </div>
  );
}

const features = [
  {
    title: "App Router",
    body: "Layouts, nested routes, and streaming UI.",
    icon: Route,
    tag: "next/navigation",
  },
  {
    title: "Server Actions",
    body: "Forms that talk to the server without a custom API call.",
    icon: Server,
    tag: "use server",
  },
  {
    title: "next/image",
    body: "Optimized media with lazy loading and sizing.",
    icon: ImageIcon,
    tag: "Image",
  },
  {
    title: "Dynamic import",
    body: "Heavy widgets load only when needed.",
    icon: Boxes,
    tag: "next/dynamic",
  },
  {
    title: "Metadata API",
    body: "SEO titles, Open Graph, sitemap, robots.",
    icon: Layers,
    tag: "generateMetadata",
  },
  {
    title: "Loading & errors",
    body: "Instant skeletons and recovery UI per route.",
    icon: Zap,
    tag: "loading.tsx",
  },
];

export function NextShowcase() {
  const modern = useTheme() === "modern";
  if (!modern) return null;

  return (
    <section className="relative overflow-hidden border-t border-line/50">
      <div className="pointer-events-none absolute inset-0">
        <div className="modern-orb modern-orb-b opacity-40" />
      </div>
      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Reveal>
          <p className="modern-chip theme-control inline-flex items-center gap-2 border border-line ui-label text-ice">
            <Sparkles size={12} />
            Built with Next.js — on this site
          </p>
          <h2 className="display mt-5 max-w-3xl text-3xl text-cream sm:text-5xl sm:leading-[1.08]">
            The website is the demo.
          </h2>
          <p className="mt-5 max-w-2xl text-[16px] leading-8 text-cream-dim/90">
            Aureon’s own marketing site uses the same Next.js toolkit we ship for
            clients — so you can feel the quality before we write a line of your
            product.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-12">
          <Reveal className="lg:col-span-7" delay={0.05}>
            <SpotlightCard className="theme-panel h-full border border-line p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="ui-label text-ice">Live surface</p>
                <LiveClock />
              </div>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-cream">
                Dynamic islands · async UI · real time
              </h3>
              <p className="mt-3 max-w-xl text-[14px] leading-7 text-muted">
                A client clock loaded with <code className="text-ice">next/dynamic</code>,
                plus a short async pulse for stats — the same pattern we use in
                product dashboards.
              </p>
              <div className="mt-6">
                <BuildPulse />
              </div>
              <div className="relative mt-8 overflow-hidden rounded-[var(--radius)] border border-line">
                <Image
                  src="/media/next-bento.svg"
                  alt="Abstract Next.js delivery visual"
                  width={960}
                  height={420}
                  className="h-auto w-full"
                />
              </div>
            </SpotlightCard>
          </Reveal>

          <Reveal className="lg:col-span-5" delay={0.1}>
            <div className="grid h-full gap-4">
              {features.slice(0, 3).map((item) => {
                const Icon = item.icon;
                return (
                  <SpotlightCard
                    key={item.title}
                    className="theme-panel border border-line p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-ice/25 bg-ice/10 text-ice">
                        <Icon size={18} />
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-cream">{item.title}</h3>
                          <span className="rounded-full border border-line px-2 py-0.5 text-[10px] text-muted">
                            {item.tag}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[13px] leading-6 text-muted">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </SpotlightCard>
                );
              })}
            </div>
          </Reveal>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.slice(3).map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={0.06 + i * 0.04}>
                <SpotlightCard className="theme-panel h-full border border-line p-5">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-gold/30 bg-gold/10 text-gold">
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-4 font-semibold text-cream">{item.title}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-muted">{item.body}</p>
                  <p className="ui-label mt-4 text-ice">{item.tag}</p>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.12}>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-ice/20 bg-gradient-to-r from-ice/10 via-transparent to-gold/10 px-6 py-5">
            <p className="max-w-xl text-[15px] leading-7 text-cream-dim">
              Want this level of craft on your product? We build the same stack
              for client work — App Router, actions, images, and calm UX.
            </p>
            <Link
              href="/contact"
              className={cn(
                "theme-control inline-flex items-center justify-center bg-cream px-5 py-2.5 ui-label text-ink transition hover:bg-ice",
              )}
            >
              Start a project
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
