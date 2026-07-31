import { cn } from "@/lib/utils";

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

/**
 * Abstract mark: orbit ring + core — “audit pulse”, not letter monogram.
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
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[0.55rem] bg-[#0b1220] shadow-sm ring-1 ring-teal-900/25 dark:bg-[#102028] dark:ring-teal-400/40",
        logoSize[size],
        className
      )}
      aria-hidden
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(45,212,191,0.42),transparent_58%)]" />
      <svg
        viewBox="0 0 32 32"
        className="relative h-[72%] w-[72%]"
        fill="none"
      >
        <circle
          cx="16"
          cy="16"
          r="11"
          stroke="#5eead4"
          strokeWidth="1.6"
          strokeOpacity="0.35"
        />
        <path
          d="M16 5a11 11 0 0 1 9.5 5.5"
          stroke="#2dd4bf"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="16" cy="16" r="4.2" fill="#2dd4bf" />
        <circle cx="16" cy="16" r="1.6" fill="#0b1220" />
        <circle cx="25.5" cy="10.5" r="1.7" fill="#99f6e4" />
      </svg>
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
