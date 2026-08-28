"use client";

import { useState, useSyncExternalStore } from "react";

function subscribeToLocation(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function getLocationSearch() {
  return window.location.search;
}

function getServerLocationSearch() {
  return "";
}

/** Keep an editable URL field in sync with its initial `?url=` deep link. */
export function useUrlQueryPrefill(defaultUrl: string) {
  const search = useSyncExternalStore(
    subscribeToLocation,
    getLocationSearch,
    getServerLocationSearch
  );
  const queryUrl = new URLSearchParams(search).get("url")?.trim();
  const [editedUrl, setEditedUrl] = useState<string | null>(null);

  return [editedUrl ?? queryUrl ?? defaultUrl, setEditedUrl] as const;
}

/** Put the checked URL in the address bar without remounting the page. */
export function syncToolUrlQuery(url: string) {
  if (typeof window === "undefined") return;
  const next = new URL(window.location.href);
  const trimmed = url.trim();
  if (!trimmed) {
    if (!next.searchParams.has("url")) return;
    next.searchParams.delete("url");
  } else if (next.searchParams.get("url") === trimmed) {
    return;
  } else {
    next.searchParams.set("url", trimmed);
  }
  const suffix = `${next.search}${next.hash}`;
  window.history.replaceState(window.history.state, "", `${next.pathname}${suffix}`);
}
