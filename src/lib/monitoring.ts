/**
 * Optional Sentry reporting. No-ops when SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN
 * are unset so local and preview deploys stay zero-config.
 */

type Extra = Record<string, unknown>;

function dsn(): string | undefined {
  return process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || undefined;
}

export async function initMonitoring(): Promise<void> {
  const value = dsn();
  if (!value) return;
  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: value,
      environment:
        process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.08 : 0,
      sendDefaultPii: false,
    });
  } catch (error) {
    console.error("[monitoring] failed to init Sentry", error);
  }
}

export async function captureException(
  error: unknown,
  extra?: Extra
): Promise<void> {
  console.error(error);
  if (!dsn()) return;
  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error, extra ? { extra } : undefined);
  } catch {
    /* ignore reporter failures */
  }
}

export async function captureMessage(
  message: string,
  extra?: Extra
): Promise<void> {
  if (!dsn()) {
    console.warn(message, extra);
    return;
  }
  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureMessage(message, extra ? { extra } : undefined);
  } catch {
    /* ignore */
  }
}
