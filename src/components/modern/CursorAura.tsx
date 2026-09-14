"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme/ThemeToggle";

type Bubble = {
  id: number;
  x: number;
  y: number;
  size: number;
  dx: number;
  dy: number;
  delay: number;
  hue: "mint" | "sky" | "aqua" | "lilac" | "peach" | "lime";
};

export function CursorAura() {
  const modern = useTheme() === "modern";
  const [ready, setReady] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const glowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  useEffect(() => {
    if (!modern) {
      setReady(false);
      setBubbles([]);
      return;
    }

    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    setReady(true);

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const glow = { x: mouse.x, y: mouse.y };
    const ring = { x: mouse.x, y: mouse.y };
    let raf = 0;
    let hovering = false;
    let visible = false;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      visible = true;

      const target = e.target;
      hovering =
        target instanceof Element &&
        Boolean(
          target.closest(
            "a, button, [role='button'], input, textarea, select, label",
          ),
        );
    };

    const onLeave = () => {
      visible = false;
    };

    const spawnBubbles = (x: number, y: number) => {
      const hues: Bubble["hue"][] = [
        "mint",
        "sky",
        "aqua",
        "lilac",
        "peach",
        "lime",
      ];
      const batch: Bubble[] = Array.from({ length: 9 }, (_, i) => {
        idRef.current += 1;
        const angle =
          -Math.PI / 2 + (i - 4) * 0.28 + (Math.random() - 0.5) * 0.5;
        const dist = 24 + Math.random() * 56;
        return {
          id: idRef.current,
          x,
          y,
          size: 9 + Math.random() * 18,
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist - (20 + Math.random() * 34),
          delay: i * 22,
          hue: hues[i % hues.length],
        };
      });

      setBubbles((prev) => [...prev.slice(-24), ...batch]);

      window.setTimeout(() => {
        const ids = new Set(batch.map((b) => b.id));
        setBubbles((prev) => prev.filter((b) => !ids.has(b.id)));
      }, 950);
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      if (e.button !== 0) return;

      spawnBubbles(e.clientX, e.clientY);

      const layer = layerRef.current;
      if (!layer) return;

      const ripple = document.createElement("span");
      ripple.className = "cursor-click-ripple";
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      layer.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 700);
    };

    const tick = () => {
      glow.x += (mouse.x - glow.x) * 0.08;
      glow.y += (mouse.y - glow.y) * 0.08;
      ring.x += (mouse.x - ring.x) * 0.2;
      ring.y += (mouse.y - ring.y) * 0.2;

      const g = glowRef.current;
      const r = ringRef.current;
      const s = spotRef.current;
      const glowScale = hovering ? 1.2 : 1;
      const ringScale = hovering ? 1.4 : 1;
      const spotScale = hovering ? 0.55 : 1;

      if (g) {
        g.style.opacity = visible ? (hovering ? "0.5" : "0.34") : "0";
        g.style.transform = `translate3d(${glow.x}px, ${glow.y}px, 0) translate(-50%, -50%) scale(${glowScale})`;
      }

      if (r) {
        r.style.opacity = visible ? (hovering ? "0.85" : "0.5") : "0";
        r.style.borderColor = hovering
          ? "rgba(125, 211, 252, 0.5)"
          : "rgba(79, 209, 197, 0.25)";
        r.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%) scale(${ringScale})`;
      }

      if (s) {
        s.style.opacity = visible ? (hovering ? "0.95" : "0.65") : "0";
        s.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%) scale(${spotScale})`;
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [modern]);

  if (!modern || !ready) return null;

  return (
    <div
      ref={layerRef}
      className="cursor-aura pointer-events-none fixed inset-0 z-[70] hidden overflow-hidden md:block"
      aria-hidden
    >
      <div
        ref={glowRef}
        className="cursor-aura-glow absolute left-0 top-0 h-[300px] w-[300px] rounded-full opacity-0 will-change-transform"
      />
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-9 w-9 rounded-full border border-ice/25 opacity-0 will-change-transform"
      />
      <div
        ref={spotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-cream/90 opacity-0 shadow-[0_0_10px_rgba(125,211,252,0.75)] will-change-transform"
      />

      {bubbles.map((b) => (
        <span
          key={b.id}
          className={`cursor-click-bubble cursor-click-bubble--${b.hue}`}
          style={{
            left: b.x,
            top: b.y,
            width: b.size,
            height: b.size,
            animationDelay: `${b.delay}ms`,
            ["--bx" as string]: `${b.dx}px`,
            ["--by" as string]: `${b.dy}px`,
          }}
        />
      ))}
    </div>
  );
}
