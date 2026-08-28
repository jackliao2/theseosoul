"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  syncToolUrlQuery,
  useUrlQueryPrefill,
} from "@/components/tools/use-url-query-prefill";

/**
 * Shared lookup loop for URL tools: prefill from `?url=`, auto-run once when
 * that param is present, and keep the address bar in sync after a submit.
 */
export function useToolLookup(
  defaultUrl: string,
  lookup: (url: string) => Promise<void>
) {
  const [url, setUrl] = useUrlQueryPrefill(defaultUrl);
  const [loading, setLoading] = useState(false);
  const autoRan = useRef(false);
  const running = useRef(false);
  const lookupRef = useRef(lookup);

  useEffect(() => {
    lookupRef.current = lookup;
  }, [lookup]);

  const run = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || running.current) return;
      running.current = true;
      setUrl(trimmed);
      syncToolUrlQuery(trimmed);
      setLoading(true);
      try {
        await lookupRef.current(trimmed);
      } finally {
        running.current = false;
        setLoading(false);
      }
    },
    [setUrl]
  );

  useEffect(() => {
    if (autoRan.current) return;
    const queryUrl = new URLSearchParams(window.location.search).get("url")?.trim();
    if (!queryUrl) return;
    autoRan.current = true;
    void run(queryUrl);
  }, [run]);

  return { url, setUrl, loading, run };
}
