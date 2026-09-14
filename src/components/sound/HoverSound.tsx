"use client";

import { useEffect } from "react";

export function HoverSound() {
  useEffect(() => {
    let ctx: AudioContext | null = null;
    let unlocked = false;
    let last = 0;
    let lastEl: Element | null = null;

    const isSignal = () =>
      document.documentElement.dataset.theme !== "modern";

    const allowed = () => {
      if (!isSignal()) return false;
      if (window.matchMedia("(pointer: coarse)").matches) return false;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return false;
      return true;
    };

    const getCtx = () => {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      if (!ctx) ctx = new AC();
      return ctx;
    };

    const beep = (ac: AudioContext) => {
      const t = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "square";
      osc.frequency.value = 1320;
      gain.gain.value = 0.05;
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t);
      osc.stop(t + 0.045);
    };

    const play = () => {
      if (!allowed() || !unlocked || !ctx) return;
      const now = performance.now();
      if (now - last < 70) return;
      if (ctx.state === "suspended") {
        void ctx.resume();
        return;
      }
      last = now;
      beep(ctx);
    };

    const clickable = (node: EventTarget | null) => {
      if (!(node instanceof Element)) return null;
      const el = node.closest("a[href], button, [role='button']");
      if (!el || el.getAttribute("aria-disabled") === "true") return null;
      if (el instanceof HTMLButtonElement && el.disabled) return null;
      return el;
    };

    const onOver = (e: PointerEvent) => {
      if (!isSignal()) return;
      if (e.pointerType && e.pointerType !== "mouse") return;
      const el = clickable(e.target);
      if (!el) {
        lastEl = null;
        return;
      }
      if (el === lastEl) return;
      lastEl = el;
      play();
    };

    const unlock = () => {
      if (!allowed()) return;

      const ac = getCtx();
      if (!ac) return;

      void ac.resume();

      if (!unlocked) {
        const gain = ac.createGain();
        gain.gain.value = 0;
        const osc = ac.createOscillator();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start();
        osc.stop(ac.currentTime + 0.02);
        unlocked = true;
      }

      if (ac.state === "suspended") {
        void ac.resume().then(() => {
          if (ac.state === "running" && lastEl && isSignal()) play();
        });
      }
    };

    const onTheme = () => {
      if (!isSignal() && ctx?.state === "running") {
        void ctx.suspend();
      }
    };

    window.addEventListener("pointerdown", unlock, { capture: true });
    window.addEventListener("click", unlock, { capture: true });
    window.addEventListener("keydown", unlock, { capture: true });
    window.addEventListener("aureon-theme", onTheme);
    document.addEventListener("pointerover", onOver);

    return () => {
      window.removeEventListener("pointerdown", unlock, { capture: true });
      window.removeEventListener("click", unlock, { capture: true });
      window.removeEventListener("keydown", unlock, { capture: true });
      window.removeEventListener("aureon-theme", onTheme);
      document.removeEventListener("pointerover", onOver);
      void ctx?.close();
    };
  }, []);

  return null;
}
