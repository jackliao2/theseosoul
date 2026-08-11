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
