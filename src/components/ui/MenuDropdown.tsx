"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type Coords = { top: number; right: number };

export function MenuDropdown({
  open,
  onClose,
  trigger,
  children,
  className,
  widthClass = "w-56",
}: {
  open: boolean;
  onClose: () => void;
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  widthClass?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }

    const update = () => {
      const el = rootRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setCoords({
        top: r.bottom + 8,
        right: Math.max(8, window.innerWidth - r.right),
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {trigger}
      {mounted && open && coords
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              className={cn(
                "menu-dropdown fixed z-[300] overflow-hidden border border-line p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.55)]",
                widthClass,
              )}
              style={{ top: coords.top, right: coords.right }}
            >
              {children}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
