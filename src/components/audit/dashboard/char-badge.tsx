import { cn } from "@/lib/utils";

export function CharBadge({
  length,
  max,
  status,
}: {
  length: number;
  max: number;
  status: "pass" | "fail" | "warn" | "info";
}) {
  const tone =
    status === "pass"
      ? "bg-emerald-500 text-white"
      : status === "warn"
        ? "bg-amber-500 text-white"
        : status === "fail"
          ? "bg-rose-500 text-white"
          : "bg-slate-500 text-white";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-bold tabular-nums",
        tone
      )}
    >
      {length}/{max}
    </span>
  );
}
