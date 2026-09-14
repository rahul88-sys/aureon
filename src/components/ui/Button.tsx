import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "light";
  className?: string;
};

export function Button({
  href,
  children,
  variant = "primary",
  className,
}: ButtonProps) {
  const styles = {
    primary: "bg-cream text-ink hover:bg-ice",
    ghost:
      "border border-ice bg-transparent text-ice hover:bg-ice hover:text-ink",
    light: "bg-ice text-ink hover:bg-cream",
  } as const;

  return (
    <Link
      href={href}
      className={cn(
        "theme-control inline-flex items-center justify-center gap-2 px-5 py-2.5 ui-label transition-colors duration-200",
        styles[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
