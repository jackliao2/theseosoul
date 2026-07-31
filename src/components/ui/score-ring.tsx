import { cn } from "@/lib/utils";

function scoreTone(score: number) {
  if (score >= 85) return "text-emerald-500";
  if (score >= 70) return "text-teal-500";
  if (score >= 50) return "text-amber-500";
  return "text-rose-500";
}

export function ScoreRing({
  score,
  size = "md",
  label,
  className,
}: {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}) {
  const dims =
    size === "lg" ? 144 : size === "sm" ? 72 : 112;
  const stroke = size === "lg" ? 10 : size === "sm" ? 6 : 8;
  const r = (dims - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = c - (clamped / 100) * c;
  const text =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: dims, height: dims }}
      role="img"
      aria-label={label ?? `Score ${clamped} out of 100`}
    >
      <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${dims} ${dims}`}>
        <circle
          cx={dims / 2}
          cy={dims / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-slate-100 dark:text-slate-800"
        />
        <circle
          cx={dims / 2}
          cy={dims / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn(
            "transition-[stroke-dashoffset] duration-700 ease-out",
            scoreTone(clamped)
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-display font-bold tabular-nums text-slate-900 dark:text-white",
            text
          )}
        >
          {clamped}
        </span>
        {size !== "sm" ? (
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            / 100
          </span>
        ) : null}
      </div>
    </div>
  );
}
