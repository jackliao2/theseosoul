"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { Check, Circle } from "lucide-react";
import {
  LADDER_ARCS,
  SEO_LADDER_STAGES,
  SEO_LADDER_STORAGE_KEY,
  proofKey,
  resolveLadderPosition,
  type LadderArcId,
  type LadderStage,
} from "@/lib/tools/seo-ladder";
import { getToolByHref } from "@/lib/tools/catalog";
import { cn } from "@/lib/utils";

const ARC_ORDER: LadderArcId[] = [
  "foundation",
  "traction",
  "monetize",
  "systems",
];
const CHANGE_EVENT = "theseosoul:seo-ladder-change";
let memorySnapshot = "";

function loadChecked(snapshot: string | null): Record<string, boolean> {
  if (!snapshot) return {};
  try {
    const parsed = JSON.parse(snapshot) as Record<string, boolean>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function getLadderSnapshot() {
  try {
    const snapshot = localStorage.getItem(SEO_LADDER_STORAGE_KEY);
    if (snapshot !== null) {
      memorySnapshot = snapshot;
      return snapshot;
    }
    return memorySnapshot;
  } catch {
    return memorySnapshot;
  }
}

function getServerLadderSnapshot() {
  return null;
}

function subscribeToLadder(onStoreChange: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === SEO_LADDER_STORAGE_KEY || event.key === null) {
      memorySnapshot = event.newValue ?? "";
      onStoreChange();
    }
  }

  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

function saveChecked(checked: Record<string, boolean>) {
  memorySnapshot = JSON.stringify(checked);
  try {
    localStorage.setItem(SEO_LADDER_STORAGE_KEY, memorySnapshot);
  } catch {
    /* keep the in-memory value for this tab */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function StageCard({
  stage,
  checked,
  isFocus,
  onToggle,
}: {
  stage: LadderStage;
  checked: Record<string, boolean>;
  isFocus: boolean;
  onToggle: (key: string) => void;
}) {
  const done = stage.proofs.every((_, i) => checked[proofKey(stage.id, i)]);
  const doneCount = stage.proofs.filter(
    (_, i) => checked[proofKey(stage.id, i)]
  ).length;

  return (
    <article
      id={`stage-${stage.id}`}
      className={cn(
        "relative scroll-mt-28 rounded-xl border px-4 py-4 transition-[border-color,box-shadow,background-color] sm:px-5 sm:py-5",
        isFocus
          ? "border-teal-700/45 bg-teal-800/[0.04] shadow-[0_0_0_1px_rgba(15,118,110,0.08)] dark:border-teal-400/40 dark:bg-teal-400/[0.06]"
          : done
            ? "border-slate-300/80 bg-[color:var(--surface)]/70 dark:border-slate-600"
            : "border-slate-300/60 bg-[color:var(--surface)]/40 dark:border-slate-700"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] font-semibold tabular-nums text-teal-800 dark:text-teal-300">
              Stage {stage.id}
            </span>
            {isFocus ? (
              <span className="rounded-md bg-teal-800 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-white dark:bg-teal-400 dark:text-slate-950">
                Focus
              </span>
            ) : null}
            {done ? (
              <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cleared
              </span>
            ) : null}
          </div>
          <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {stage.name}
          </h3>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {stage.summary}
          </p>
        </div>
        <p className="shrink-0 font-mono text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
          {doneCount}/{stage.proofs.length}
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {stage.proofs.map((proof, i) => {
          const key = proofKey(stage.id, i);
          const on = Boolean(checked[key]);
          return (
            <li key={key}>
              <label className="flex cursor-pointer gap-3 rounded-lg px-1 py-1.5 transition-colors hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.03]">
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                    on
                      ? "border-teal-700 bg-teal-800 text-white dark:border-teal-400 dark:bg-teal-400 dark:text-slate-950"
                      : "border-slate-300 bg-transparent dark:border-slate-600"
                  )}
                >
                  {on ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : (
                    <Circle className="h-3 w-3 opacity-0" aria-hidden />
                  )}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={on}
                  onChange={() => onToggle(key)}
                />
                <span
                  className={cn(
                    "text-sm leading-relaxed",
                    on
                      ? "text-slate-500 line-through decoration-slate-300 dark:text-slate-500 dark:decoration-slate-600"
                      : "text-slate-700 dark:text-slate-200"
                  )}
                >
                  {proof}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 border-t border-slate-200/80 pt-3 dark:border-slate-700/80">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            Next move:{" "}
          </span>
          {stage.nextMove}
        </p>
        {stage.sideSignal ? (
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Side note — {stage.sideSignal}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {stage.tools.map((tool) => {
            const mark = getToolByHref(tool.href)?.mark;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300/80 bg-[color:var(--surface)] px-2 py-1 text-xs font-semibold text-teal-900 transition-colors hover:border-teal-700/40 hover:bg-teal-800/[0.06] dark:border-slate-600 dark:text-teal-200 dark:hover:border-teal-400/40 dark:hover:bg-teal-400/[0.08]"
              >
                {mark ? (
                  <span
                    aria-hidden
                    className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-[#0b1220] px-1 font-mono text-[9px] font-bold tracking-wide text-teal-300 dark:bg-teal-400/15 dark:text-teal-300"
                  >
                    {mark}
                  </span>
                ) : null}
                {tool.label}
              </Link>
            );
          })}
        </div>
      </div>
    </article>
  );
}

export function SeoLadder() {
  const snapshot = useSyncExternalStore(
    subscribeToLadder,
    getLadderSnapshot,
    getServerLadderSnapshot
  );
  const checked = useMemo(() => loadChecked(snapshot), [snapshot]);
  const hydrated = snapshot !== null;

  const position = resolveLadderPosition(checked);
  const focus = SEO_LADDER_STAGES.find((s) => s.id === position.focusStage)!;
  const progressPct = Math.round(
    (position.checkedProofs / Math.max(position.totalProofs, 1)) * 100
  );

  function toggle(key: string) {
    saveChecked({ ...checked, [key]: !checked[key] });
  }

  function reset() {
    saveChecked({});
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="sticky top-16 z-20 -mx-1 rounded-xl border border-slate-300/70 bg-[color:var(--surface)]/90 px-4 py-3.5 shadow-sm backdrop-blur-md dark:border-slate-600 dark:bg-slate-950/85 sm:mx-0 sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Your map position
            </p>
            <p className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-slate-50 sm:text-xl">
              {position.completedThrough === 0
                ? "Start at Stage 1 — Live site"
                : position.completedThrough >= 10
                  ? "Stage 10 cleared — keep it durable"
                  : `Through Stage ${position.completedThrough} · focus Stage ${position.focusStage}`}
            </p>
            <p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-300">
              {position.completedThrough >= 10
                ? "Revisit proofs when the site changes. Durability is a practice."
                : focus.summary}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="font-mono text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
              {position.checkedProofs}/{position.totalProofs} proofs ·{" "}
              {progressPct}%
            </p>
            <div className="flex items-center gap-2">
              {position.completedThrough < 10 ? (
                <a
                  href={`#stage-${position.focusStage}`}
                  className="rounded-md bg-teal-800 px-3 py-1.5 text-xs font-semibold text-white dark:bg-teal-400 dark:text-slate-950"
                >
                  Jump to focus
                </a>
              ) : null}
              <button
                type="button"
                onClick={reset}
                className="rounded-md px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-teal-700 transition-[width] duration-300 ease-out dark:bg-teal-400"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <nav
        aria-label="Ladder arcs"
        className="flex flex-wrap gap-2 border-b border-slate-300/60 pb-4 dark:border-slate-700"
      >
        {ARC_ORDER.map((arcId) => {
          const arc = LADDER_ARCS[arcId];
          const stages = SEO_LADDER_STAGES.filter((s) => s.arc === arcId);
          const first = stages[0];
          return (
            <a
              key={arcId}
              href={`#arc-${arcId}`}
              className="rounded-lg border border-slate-300/70 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-teal-700/35 hover:text-teal-900 dark:border-slate-600 dark:text-slate-200 dark:hover:border-teal-400/35 dark:hover:text-teal-200"
            >
              {arc.label}
              <span className="ml-1.5 font-mono font-normal text-slate-400">
                {first.id}–{stages[stages.length - 1].id}
              </span>
            </a>
          );
        })}
      </nav>

      {ARC_ORDER.map((arcId) => {
        const arc = LADDER_ARCS[arcId];
        const stages = SEO_LADDER_STAGES.filter((s) => s.arc === arcId);
        return (
          <section
            key={arcId}
            id={`arc-${arcId}`}
            className="scroll-mt-36"
            aria-labelledby={`arc-title-${arcId}`}
          >
            <div className="mb-4 max-w-2xl">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-800/80 dark:text-teal-300/80">
                Arc
              </p>
              <h2
                id={`arc-title-${arcId}`}
                className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-slate-50"
              >
                {arc.label}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {arc.blurb}
              </p>
            </div>
            <div className="relative space-y-4 pl-0 sm:pl-6">
              <div
                aria-hidden
                className="pointer-events-none absolute bottom-4 left-[0.7rem] top-4 hidden w-px bg-gradient-to-b from-teal-700/40 via-slate-300 to-slate-300 dark:from-teal-400/40 dark:via-slate-700 dark:to-slate-700 sm:block"
              />
              {stages.map((stage) => (
                <div key={stage.id} className="relative sm:pl-2">
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-0 top-6 hidden h-2.5 w-2.5 -translate-x-[0.2rem] rounded-full border-2 sm:block",
                      position.focusStage === stage.id
                        ? "border-teal-700 bg-teal-700 dark:border-teal-400 dark:bg-teal-400"
                        : stage.proofs.every(
                              (_, i) => checked[proofKey(stage.id, i)]
                            )
                          ? "border-teal-700/50 bg-teal-700/30 dark:border-teal-400/50 dark:bg-teal-400/25"
                          : "border-slate-300 bg-[color:var(--surface)] dark:border-slate-600"
                    )}
                  />
                  <StageCard
                    stage={stage}
                    checked={checked}
                    isFocus={
                      hydrated &&
                      position.focusStage === stage.id &&
                      position.completedThrough < 10
                    }
                    onToggle={toggle}
                  />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
