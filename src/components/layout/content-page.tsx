import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Soft shell for About / Contact / Legal — no harsh hero-to-ink gradient. */
export function ContentPage({
  children,
  className,
  wide,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem]"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% -10%, color-mix(in oklab, var(--accent) 14%, transparent), transparent 70%), linear-gradient(180deg, color-mix(in oklab, var(--surface) 80%, transparent) 0%, transparent 100%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-40" />
      <div
        className={cn(
          "relative mx-auto px-4 py-14 sm:px-6 sm:py-16",
          wide ? "max-w-4xl" : "max-w-3xl",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function ContentEyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
      {children}
    </div>
  );
}

export function ContentTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
      {children}
    </h1>
  );
}

export function ContentLead({ children }: { children: ReactNode }) {
  return (
    <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
      {children}
    </p>
  );
}
