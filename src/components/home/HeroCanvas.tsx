"use client";

import { useEffect, useRef } from "react";

function palette() {
  const theme = document.documentElement.dataset.theme;
  if (theme === "modern") {
    return {
      grid: "rgba(94, 234, 212, 0.14)",
      ice: "rgba(94, 234, 212, 0.85)",
      gold: "rgba(94, 234, 212, 0.5)",
      glow: "rgba(94, 234, 212, 0.14)",
      cursor: "rgba(94, 234, 212, 0.12)",
    };
  }
  return {
    grid: "rgba(200, 255, 58, 0.12)",
    ice: "rgba(200, 255, 58, 0.8)",
    gold: "rgba(200, 255, 58, 0.45)",
    glow: "rgba(200, 255, 58, 0.12)",
    cursor: "rgba(200, 255, 58, 0.1)",
  };
}

export function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mouse = { x: 0.5, y: 0.42 };
    const target = { x: 0.5, y: 0.42 };
    let frame = 0;
    let raf = 0;
    let colors = palette();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      target.x = (e.clientX - rect.left) / rect.width;
      target.y = (e.clientY - rect.top) / rect.height;
    };

    const onTheme = () => {
      colors = palette();
    };

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      mouse.x += (target.x - mouse.x) * 0.045;
      mouse.y += (target.y - mouse.y) * 0.045;

      ctx.clearRect(0, 0, width, height);

      const vanishX = width * (0.52 + (mouse.x - 0.5) * 0.18);
      const vanishY = height * (0.18 + (mouse.y - 0.5) * 0.1);
      const t = reduce ? 0 : frame * 0.004;

      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 1;

      const rows = 18;
      for (let i = 0; i <= rows; i++) {
        const p = i / rows;
        const y = vanishY + (height - vanishY) * Math.pow(p, 1.35);
        ctx.globalAlpha = 0.15 + p * 0.55;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const cols = 22;
      for (let i = 0; i <= cols; i++) {
        const p = i / cols;
        const xBottom = p * width;
        ctx.globalAlpha = 0.12 + Math.abs(p - 0.5) * 0.2;
        ctx.beginPath();
        ctx.moveTo(vanishX, vanishY);
        ctx.lineTo(xBottom, height);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      const nodes = 28;
      for (let i = 0; i < nodes; i++) {
        const seed = i * 1.7;
        const nx = ((seed * 73.1) % 1) * width + Math.sin(t + seed) * 12;
        const ny =
          height * 0.28 +
          ((seed * 41.3) % 1) * height * 0.62 +
          Math.cos(t * 0.8 + seed) * 10;
        const r = 1.2 + (i % 4) * 0.45;
        ctx.fillStyle = i % 5 === 0 ? colors.gold : colors.ice;
        ctx.beginPath();
        ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.fill();
      }

      const glow = ctx.createRadialGradient(
        vanishX,
        vanishY,
        0,
        vanishX,
        vanishY,
        220,
      );
      glow.addColorStop(0, colors.glow);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      const cursor = ctx.createRadialGradient(
        mouse.x * width,
        mouse.y * height,
        0,
        mouse.x * width,
        mouse.y * height,
        160,
      );
      cursor.addColorStop(0, colors.cursor);
      cursor.addColorStop(1, "transparent");
      ctx.fillStyle = cursor;
      ctx.fillRect(0, 0, width, height);

      frame += 1;
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("aureon-theme", onTheme);
    canvas.addEventListener("pointermove", onMove);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("aureon-theme", onTheme);
      canvas.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
