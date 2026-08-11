"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";

const KEY = "theseosoul-recent-audits";
const CHANGE_EVENT = "theseosoul:recent-audits-change";

type RecentAudit = { label: string; href: string };
let memorySnapshot: string | null = null;

function getRecentSnapshot() {
  try {
    const snapshot = localStorage.getItem(KEY);
    if (snapshot !== null) {
      memorySnapshot = snapshot;
      return snapshot;
    }
    return memorySnapshot;
  } catch {
    return memorySnapshot;
  }
}

function getServerRecentSnapshot() {
  return null;
}

function subscribeToRecentAudits(onStoreChange: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key !== KEY && event.key !== null) return;
    memorySnapshot = event.newValue;
    onStoreChange();
  }

  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

function notifyRecentAuditsChanged() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Read current entries and migrate the previous slug-only storage format. */
function readRecentList(raw: string | null): RecentAudit[] {
  if (!raw) return [];
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((item): RecentAudit[] => {
    if (typeof item === "string" && item.trim()) {
      return [{ label: item, href: `/audit/${item}` }];
    }
    if (
      item &&
      typeof item === "object" &&
      "label" in item &&
      "href" in item &&
      typeof item.label === "string" &&
      typeof item.href === "string" &&
      item.label.trim() &&
      item.href.startsWith("/audit/")
    ) {
      return [{ label: item.label, href: item.href }];
    }
    return [];
  });
}

/** Remember both the readable label and exact report href. */
export function rememberRecentAudit(label: string, href?: string) {
  try {
    const list = readRecentList(getRecentSnapshot());
    const safeHref = href?.startsWith("/audit/") ? href : `/audit/${label}`;
    const next = [
      { label, href: safeHref },
      ...list.filter((item) => item.href !== safeHref),
    ].slice(0, 8);
    memorySnapshot = JSON.stringify(next);
    try {
      localStorage.setItem(KEY, memorySnapshot);
    } catch {
      // Keep the in-memory value for this tab.
    }
    notifyRecentAuditsChanged();
  } catch {
    // ignore
  }
}

/** @deprecated use rememberRecentAudit */
export function rememberRecentDomain(domain: string) {
  rememberRecentAudit(domain);
}

export function RecentAudits() {
  const snapshot = useSyncExternalStore(
    subscribeToRecentAudits,
    getRecentSnapshot,
    getServerRecentSnapshot
  );
  const items = useMemo(() => {
    try {
      return readRecentList(snapshot);
    } catch {
      return [];
    }
  }, [snapshot]);

  function clearRecent() {
    memorySnapshot = null;
    try {
      localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
    notifyRecentAuditsChanged();
  }

  if (items.length === 0) return null;

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Recent
        </p>
        <button
          type="button"
          onClick={clearRecent}
          className="text-[11px] font-medium text-slate-400 underline-offset-2 hover:text-slate-700 hover:underline dark:text-slate-500 dark:hover:text-slate-300"
        >
          Clear recent
        </button>
      </div>
      <div className="mt-1.5 flex flex-wrap justify-center gap-1.5">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="max-w-[14rem] truncate rounded-md border border-slate-200 bg-white/80 px-2 py-0.5 text-xs font-medium text-slate-700 transition-colors hover:border-teal-700 hover:text-teal-800 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-300"
            title={item.label}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
