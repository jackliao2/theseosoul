import { cn } from "@/lib/utils";
import {
  MARK_E,
  MARK_O,
  MARK_S,
  MARK_SPARK,
  MARK_VIEWBOX,
} from "@/components/brand/mark-geometry";

type Size = "sm" | "md" | "lg" | "hero";

const sizeClass: Record<Size, string> = {
  sm: "text-sm",
  md: "text-base sm:text-lg",
  lg: "text-2xl",
  hero: "text-4xl sm:text-5xl md:text-6xl",
};

const logoSize: Record<Size, string> = {
  sm: "h-7 w-7",
  md: "h-8 w-8 sm:h-9 sm:w-9",
  lg: "h-10 w-10",
  hero: "h-12 w-12 sm:h-14 sm:w-14",
};

/**
 * Wordmark: TheSeoSoul.
 * Uses CSS theme tokens (--ink / --accent) so it stays readable even if a
 * Tailwind dark: variant fails to apply.
 */
export function SiteWordmark({
  size = "md",
  className,
  withDomain,
}: {
  size?: Size;
  className?: string;
  withDomain?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-baseline justify-center font-display font-extrabold tracking-tight",
        sizeClass[size],
        className
      )}
    >
      <span className="text-[color:var(--ink)]">The</span>
      <span className="text-[color:var(--accent)]">Seo</span>
      <span className="text-[color:var(--ink)]">Soul</span>
      {withDomain ? (
        <span className="font-semibold text-slate-500 dark:text-slate-400">
          .com
        </span>
      ) : null}
    </span>
  );
}

/** Shared glyph: literal SEO lettering with a subtle soul spark inside O. */
export function MarkGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      className={className}
      fill="none"
      aria-hidden
    >
      <g
        stroke="#2dd4bf"
        strokeWidth="2.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={MARK_S} />
        <path d={MARK_E} />
        <path d={MARK_O} />
      </g>
      <path d={MARK_SPARK} fill="#ccfbf1" />
    </svg>
  );
}

/**
 * Brand mark: SEO lettering + a soul spark in the O.
 */
export function SiteLogo({
  size = "md",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[0.65rem] bg-[#0b1220] shadow-sm ring-1 ring-teal-900/20 dark:bg-[#0e1a22] dark:ring-teal-400/30",
        logoSize[size],
        className
      )}
      aria-hidden
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_76%_50%,rgba(45,212,191,0.24),transparent_45%)]" />
      <MarkGlyph className="relative h-[88%] w-[88%]" />
    </span>
  );
}

export function SiteBrand({
  size = "md",
  className,
  showWordmark = true,
}: {
  size?: Size;
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <SiteLogo size={size} />
      {showWordmark ? <SiteWordmark size={size} /> : null}
    </span>
  );
}
