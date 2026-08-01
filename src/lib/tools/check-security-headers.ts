import { analyzeSecurity } from "@/lib/audit/extras";
import { FetchTimeoutError, fetchHtml } from "@/lib/audit/fetch";

export { FetchTimeoutError };

const EXTRA_HEADERS = [
  "permissions-policy",
  "cross-origin-opener-policy",
  "cross-origin-resource-policy",
] as const;

const LABELS: Record<string, string> = {
  "strict-transport-security": "Strict-Transport-Security (HSTS)",
  "content-security-policy": "Content-Security-Policy",
  "x-content-type-options": "X-Content-Type-Options",
  "x-frame-options": "X-Frame-Options",
  "referrer-policy": "Referrer-Policy",
  "permissions-policy": "Permissions-Policy",
  "cross-origin-opener-policy": "Cross-Origin-Opener-Policy",
  "cross-origin-resource-policy": "Cross-Origin-Resource-Policy",
};

export type SecurityHeaderRow = {
  id: string;
  label: string;
  header: string;
  present: boolean;
  value: string | null;
  weight: "core" | "extra";
};

export type SecurityHeadersResult = {
  success: true;
  domain: string;
  requestedUrl: string;
  finalUrl: string;
  status: number;
  https: boolean;
  score: number;
  summary: string;
  rows: SecurityHeaderRow[];
};

export async function checkSecurityHeaders(
  url: string,
  domain: string
): Promise<SecurityHeadersResult> {
  const { finalUrl, status, headers } = await fetchHtml(url);
  const https = (() => {
    try {
      return new URL(finalUrl).protocol === "https:";
    } catch {
      return false;
    }
  })();

  const security = analyzeSecurity(headers, https);

  const coreRows: SecurityHeaderRow[] = security.checks.map((check) => {
    const header =
      check.id === "hsts"
        ? "strict-transport-security"
        : check.id === "xcto"
          ? "x-content-type-options"
          : check.id === "csp"
            ? "content-security-policy"
            : check.id === "xfo"
              ? "x-frame-options"
              : "referrer-policy";
    return {
      id: check.id,
      label: LABELS[header] ?? check.label,
      header,
      present: check.present,
      value: headers[header] ?? null,
      weight: "core",
    };
  });

  const extraRows: SecurityHeaderRow[] = EXTRA_HEADERS.map((header) => ({
    id: header,
    label: LABELS[header] ?? header,
    header,
    present: Boolean(headers[header]),
    value: headers[header] ?? null,
    weight: "extra",
  }));

  const rows = [...coreRows, ...extraRows];
  const missingCore = coreRows.filter((r) => !r.present).length;

  let summary = `Security header score ${security.score}/100.`;
  if (!https) {
    summary =
      "Page is not on HTTPS — enable TLS before relying on HSTS or most browser security headers.";
  } else if (missingCore === 0) {
    summary = `Core security headers look solid (${security.score}/100). Review CSP values for strength next.`;
  } else {
    summary = `${missingCore} core header(s) missing. Score ${security.score}/100 — start with HSTS, X-Content-Type-Options, and a framing policy.`;
  }

  return {
    success: true,
    domain,
    requestedUrl: url,
    finalUrl,
    status,
    https,
    score: security.score,
    summary,
    rows,
  };
}
