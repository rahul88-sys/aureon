import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  body?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p className="ui-label mb-4 text-ice">{eyebrow}</p>
      <h2 className="display text-3xl leading-[1.05] text-cream sm:text-4xl lg:text-[2.85rem]">
        {title}
      </h2>
      {body ? (
        <p className="mt-5 text-[15px] leading-7 text-muted">{body}</p>
      ) : null}
    </div>
  );
}
