"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Script from "next/script";

const GA_MEASUREMENT_ID = "G-6GC0B6V6TB";
const CONSENT_STORAGE_KEY = "theseosoul:analytics-consent:v1";
const OPEN_PREFERENCES_EVENT = "theseosoul:open-analytics-preferences";

type ConsentChoice = "granted" | "denied";

const consentListeners = new Set<() => void>();
let inMemoryChoice: ConsentChoice | null = null;

type GoogleAnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  [key: `ga-disable-${string}`]: boolean | undefined;
};

function readStoredChoice(): ConsentChoice | null {
  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored === "granted" || stored === "denied") {
      inMemoryChoice = stored;
      return stored;
    }
    return inMemoryChoice;
  } catch {
    return inMemoryChoice;
  }
}

function storeChoice(choice: ConsentChoice) {
  inMemoryChoice = choice;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // The choice still applies for this page when storage is unavailable.
  }

  consentListeners.forEach((listener) => listener());
}

function subscribeToConsent(listener: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key !== CONSENT_STORAGE_KEY && event.key !== null) return;
    inMemoryChoice =
      event.newValue === "granted" || event.newValue === "denied"
        ? event.newValue
        : null;
    listener();
  }

  consentListeners.add(listener);
  window.addEventListener("storage", handleStorage);
  // Reconcile the server's privacy-safe `undefined` snapshot after hydration.
  window.queueMicrotask(listener);

  return () => {
    consentListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function setGoogleAnalyticsDisabled(disabled: boolean) {
  const analyticsWindow = window as unknown as GoogleAnalyticsWindow;
  analyticsWindow[`ga-disable-${GA_MEASUREMENT_ID}`] = disabled;

  if (analyticsWindow.gtag) {
    analyticsWindow.gtag("consent", "update", {
      analytics_storage: disabled ? "denied" : "granted",
    });
  }
}

function clearGoogleAnalyticsCookies() {
  const cookieNames = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0]?.trim())
    .filter(
      (name): name is string =>
        Boolean(name) && /^(?:_ga(?:_|$)|_gid$|_gat(?:_|$))/.test(name)
    );

  if (cookieNames.length === 0) return;

  const hostnameParts = window.location.hostname.split(".");
  const domains = new Set<string | null>([null, window.location.hostname]);

  for (let index = 0; index <= hostnameParts.length - 2; index += 1) {
    domains.add(`.${hostnameParts.slice(index).join(".")}`);
  }

  for (const name of cookieNames) {
    for (const domain of domains) {
      const domainAttribute = domain ? `; Domain=${domain}` : "";
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domainAttribute}`;
    }
  }
}

export function AnalyticsConsent() {
  const choice = useSyncExternalStore<ConsentChoice | null | undefined>(
    subscribeToConsent,
    readStoredChoice,
    () => undefined
  );
  const [preferencesManuallyOpen, setPreferencesManuallyOpen] = useState(false);
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const preferencesOpen = choice === null || preferencesManuallyOpen;

  useEffect(() => {
    if (choice === undefined) return;

    const disabled = choice !== "granted";
    setGoogleAnalyticsDisabled(disabled);
    if (disabled) clearGoogleAnalyticsCookies();
  }, [choice]);

  useEffect(() => {
    function openPreferences() {
      returnFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setPreferencesManuallyOpen(true);
      window.requestAnimationFrame(() => firstButtonRef.current?.focus());
    }

    window.addEventListener(OPEN_PREFERENCES_EVENT, openPreferences);
    return () =>
      window.removeEventListener(OPEN_PREFERENCES_EVENT, openPreferences);
  }, []);

  useEffect(() => {
    if (!preferencesOpen || choice === null || choice === undefined) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setPreferencesManuallyOpen(false);
      returnFocusRef.current?.focus();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [choice, preferencesOpen]);

  function recordChoice(nextChoice: ConsentChoice) {
    // Apply a withdrawal synchronously so no later event on this page is sent.
    setGoogleAnalyticsDisabled(nextChoice === "denied");
    if (nextChoice === "denied") clearGoogleAnalyticsCookies();

    storeChoice(nextChoice);
    setPreferencesManuallyOpen(false);
    returnFocusRef.current?.focus();
  }

  return (
    <>
      {choice === "granted" ? (
        <>
          <Script
            id="google-analytics-loader"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('consent', 'default', { analytics_storage: 'granted' });
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </>
      ) : null}

      {choice !== undefined && preferencesOpen ? (
        <div className="no-print pointer-events-none fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-5">
          <section
            role="dialog"
            aria-modal="false"
            aria-labelledby="analytics-consent-title"
            aria-describedby="analytics-consent-description"
            className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-slate-300 bg-[color:var(--surface)] p-4 shadow-2xl shadow-slate-950/20 dark:border-slate-600 sm:flex sm:items-center sm:gap-6 sm:p-5"
          >
            <div className="min-w-0 flex-1">
              <h2
                id="analytics-consent-title"
                className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white"
              >
                Help us improve TheSeoSoul?
              </h2>
              <p
                id="analytics-consent-description"
                className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300"
              >
                With your permission, Google Analytics measures visits and site
                usage. It stays completely off until you allow it. Essential
                site features work either way.{" "}
                <Link
                  href="/privacy#cookies"
                  className="font-semibold text-teal-800 underline decoration-teal-700/30 underline-offset-2 dark:text-teal-300"
                >
                  Privacy details
                </Link>
              </p>
            </div>
            <div className="mt-4 grid shrink-0 grid-cols-2 gap-2 sm:mt-0 sm:flex">
              <button
                ref={firstButtonRef}
                type="button"
                onClick={() => recordChoice("denied")}
                className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => recordChoice("granted")}
                className="min-h-11 rounded-lg bg-teal-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
              >
                Allow analytics
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export function AnalyticsChoicesButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT))}
      className={className}
    >
      Review analytics choice
    </button>
  );
}
