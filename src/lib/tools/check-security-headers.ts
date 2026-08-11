import { FetchTimeoutError, fetchHtml } from "@/lib/audit/fetch";

export { FetchTimeoutError };

export type GradeStatus = "pass" | "warn" | "fail" | "info";

export type SecurityHeaderRow = {
  id: string;
  label: string;
  header: string;
  present: boolean;
  value: string | null;
  weight: "core" | "extra";
  status: GradeStatus;
  why: string;
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

function parseMaxAge(hsts: string): number | null {
  const match = hsts.match(/max-age\s*=\s*(\d+)/i);
  if (!match) return null;
  return Number(match[1]);
}

function gradeHsts(value: string | null, https: boolean): Omit<
  SecurityHeaderRow,
  "id" | "label" | "header" | "weight"
> {
  if (!https) {
    return {
      present: Boolean(value),
      value,
      status: "fail",
      why: "HSTS only applies over HTTPS — fix TLS first.",
    };
  }
  if (!value) {
    return {
      present: false,
      value: null,
      status: "fail",
      why: "Missing HSTS — browsers will not force HTTPS on return visits.",
    };
  }
  const maxAge = parseMaxAge(value);
  const hasSub = /includesubdomains/i.test(value);
  const hasPreload = /preload/i.test(value);
  if (maxAge == null) {
    return {
      present: true,
      value,
      status: "fail",
      why: "HSTS present but missing max-age.",
    };
  }
  if (maxAge < 15_552_000) {
    return {
      present: true,
      value,
      status: "warn",
      why: `max-age=${maxAge} is under 15552000 (180 days). Raise it for lasting HTTPS enforcement.${hasSub ? "" : " Consider includeSubDomains."}`,
    };
  }
  const extras = [
    hasSub ? "includeSubDomains" : null,
    hasPreload ? "preload" : null,
  ]
    .filter(Boolean)
    .join(", ");
  return {
    present: true,
    value,
    status: "pass",
    why: extras
      ? `Strong HSTS (max-age=${maxAge}; ${extras}).`
      : `Good HSTS (max-age=${maxAge}). Optional: includeSubDomains / preload.`,
  };
}

function gradeXcto(value: string | null): Omit<
  SecurityHeaderRow,
  "id" | "label" | "header" | "weight"
> {
  if (!value) {
    return {
      present: false,
      value: null,
      status: "fail",
      why: "Missing — set X-Content-Type-Options: nosniff.",
    };
  }
  if (value.trim().toLowerCase() === "nosniff") {
    return {
      present: true,
      value,
      status: "pass",
      why: "Correct nosniff value.",
    };
  }
  return {
    present: true,
    value,
    status: "fail",
    why: `Value should be nosniff (got “${value}”).`,
  };
}

function gradeCsp(value: string | null): Omit<
  SecurityHeaderRow,
  "id" | "label" | "header" | "weight"
> {
  if (!value || !value.trim()) {
    return {
      present: Boolean(value),
      value: value || null,
      status: "fail",
      why: "Missing or empty CSP — XSS and injection defenses are weak.",
    };
  }
  const lower = value.toLowerCase();
  if (/^\s*\*\s*$/.test(value) || /default-src\s+\*/i.test(value)) {
    // default-src * alone is weak; if other directives tighten, still warn
    if (
      /default-src\s+\*/i.test(value) &&
      !/script-src\s/i.test(value) &&
      !/object-src\s/i.test(value)
    ) {
      return {
        present: true,
        value,
        status: "fail",
        why: "CSP allows default-src * with no tighter script/object policy.",
      };
    }
  }
  if (lower.includes("unsafe-inline") && lower.includes("unsafe-eval")) {
    return {
      present: true,
      value,
      status: "warn",
      why: "CSP present but uses both unsafe-inline and unsafe-eval — limited XSS protection.",
    };
  }
  if (!/default-src|script-src|frame-ancestors/i.test(value)) {
    return {
      present: true,
      value,
      status: "warn",
      why: "CSP present but missing common directives (default-src / script-src / frame-ancestors).",
    };
  }
  return {
    present: true,
    value,
    status: "pass",
    why: "CSP present with useful directives. Review values for your app’s threat model.",
  };
}

function gradeFraming(
  xfo: string | null,
  csp: string | null
): Omit<SecurityHeaderRow, "id" | "label" | "header" | "weight"> {
  const ancestors = csp?.match(/frame-ancestors\s+([^;]+)/i)?.[1]?.trim();
  if (ancestors) {
    const a = ancestors.toLowerCase();
    if (a.includes("'none'") || a === "none") {
      return {
        present: true,
        value: `CSP frame-ancestors ${ancestors}`,
        status: "pass",
        why: "Framing blocked via CSP frame-ancestors 'none'.",
      };
    }
    if (a.includes("'self'") || a.includes("self")) {
      return {
        present: true,
        value: `CSP frame-ancestors ${ancestors}`,
        status: "pass",
        why: "Framing limited via CSP frame-ancestors.",
      };
    }
    return {
      present: true,
      value: `CSP frame-ancestors ${ancestors}`,
      status: "warn",
      why: "frame-ancestors allows additional origins — confirm that is intentional.",
    };
  }

  if (!xfo) {
    return {
      present: false,
      value: null,
      status: "fail",
      why: "No X-Frame-Options and no CSP frame-ancestors — clickjacking risk.",
    };
  }
  const v = xfo.trim().toUpperCase();
  if (v === "DENY" || v === "SAMEORIGIN") {
    return {
      present: true,
      value: xfo,
      status: "pass",
      why: `X-Frame-Options: ${v} is solid (prefer CSP frame-ancestors for modern browsers).`,
    };
  }
  if (v.startsWith("ALLOW-FROM")) {
    return {
      present: true,
      value: xfo,
      status: "warn",
      why: "ALLOW-FROM is obsolete — use CSP frame-ancestors instead.",
    };
  }
  return {
    present: true,
    value: xfo,
    status: "warn",
    why: `Unusual X-Frame-Options value: ${xfo}`,
  };
}

function gradeReferrer(value: string | null): Omit<
  SecurityHeaderRow,
  "id" | "label" | "header" | "weight"
> {
  if (!value) {
    return {
      present: false,
      value: null,
      status: "warn",
      why: "Missing Referrer-Policy — browsers may leak full URLs to third parties.",
    };
  }
  const v = value.trim().toLowerCase();
  if (v === "unsafe-url") {
    return {
      present: true,
      value,
      status: "fail",
      why: "unsafe-url leaks full URLs cross-origin — prefer strict-origin-when-cross-origin.",
    };
  }
  const good = [
    "no-referrer",
    "same-origin",
    "strict-origin",
    "strict-origin-when-cross-origin",
    "no-referrer-when-downgrade",
    "origin",
    "origin-when-cross-origin",
  ];
  if (good.includes(v)) {
    return {
      present: true,
      value,
      status: "pass",
      why: `Referrer-Policy: ${value}`,
    };
  }
  return {
    present: true,
    value,
    status: "warn",
    why: `Unrecognized Referrer-Policy value: ${value}`,
  };
}

function gradeExtra(
  header: string,
  value: string | null
): Omit<SecurityHeaderRow, "id" | "label" | "header" | "weight"> {
  if (!value) {
    return {
      present: false,
      value: null,
      status: "info",
      why: "Optional modern header — nice to have, not scored as critical.",
    };
  }
  if (header === "cross-origin-opener-policy") {
    const ok = /same-origin/i.test(value);
    return {
      present: true,
      value,
      status: ok ? "pass" : "warn",
      why: ok
        ? "COOP helps isolate browsing context."
        : "COOP present — prefer same-origin when possible.",
    };
  }
  return {
    present: true,
    value,
    status: "pass",
    why: "Present.",
  };
}

function pointsFor(status: GradeStatus, weight: "core" | "extra"): number {
  if (weight === "extra") {
    if (status === "pass") return 2;
    if (status === "warn") return 1;
    return 0;
  }
  if (status === "pass") return 16;
  if (status === "warn") return 8;
  if (status === "info") return 12;
  return 0;
}

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

  const hsts = headers["strict-transport-security"] ?? null;
  const xcto = headers["x-content-type-options"] ?? null;
  const csp = headers["content-security-policy"] ?? null;
  const xfo = headers["x-frame-options"] ?? null;
  const rp = headers["referrer-policy"] ?? null;

  const framing = gradeFraming(xfo, csp);

  const rows: SecurityHeaderRow[] = [
    {
      id: "hsts",
      label: "Strict-Transport-Security (HSTS)",
      header: "strict-transport-security",
      weight: "core",
      ...gradeHsts(hsts, https),
    },
    {
      id: "xcto",
      label: "X-Content-Type-Options",
      header: "x-content-type-options",
      weight: "core",
      ...gradeXcto(xcto),
    },
    {
      id: "csp",
      label: "Content-Security-Policy",
      header: "content-security-policy",
      weight: "core",
      ...gradeCsp(csp),
    },
    {
      id: "xfo",
      label: "Framing (XFO / frame-ancestors)",
      header: xfo ? "x-frame-options" : "content-security-policy",
      weight: "core",
      ...framing,
    },
    {
      id: "rp",
      label: "Referrer-Policy",
      header: "referrer-policy",
      weight: "core",
      ...gradeReferrer(rp),
    },
    {
      id: "permissions-policy",
      label: "Permissions-Policy",
      header: "permissions-policy",
      weight: "extra",
      ...gradeExtra(
        "permissions-policy",
        headers["permissions-policy"] ?? null
      ),
    },
    {
      id: "cross-origin-opener-policy",
      label: "Cross-Origin-Opener-Policy",
      header: "cross-origin-opener-policy",
      weight: "extra",
      ...gradeExtra(
        "cross-origin-opener-policy",
        headers["cross-origin-opener-policy"] ?? null
      ),
    },
    {
      id: "cross-origin-resource-policy",
      label: "Cross-Origin-Resource-Policy",
      header: "cross-origin-resource-policy",
      weight: "extra",
      ...gradeExtra(
        "cross-origin-resource-policy",
        headers["cross-origin-resource-policy"] ?? null
      ),
    },
  ];

  // Core max 5*16=80, https 14, extras 3*2=6 → 100
  let raw = https ? 14 : 0;
  const max = 14 + 5 * 16 + 3 * 2;
  for (const row of rows) {
    raw += pointsFor(row.status, row.weight);
  }
  const score = Math.round((raw / max) * 100);

  const fails = rows.filter((r) => r.status === "fail").length;
  const warns = rows.filter((r) => r.status === "warn").length;

  let summary = `Security header score ${score}/100.`;
  if (!https) {
    summary =
      "Page is not on HTTPS — enable TLS before relying on HSTS or most browser security headers.";
  } else if (fails === 0 && warns === 0) {
    summary = `Core headers grade well (${score}/100). Values look intentional, not just present.`;
  } else if (fails === 0) {
    summary = `${warns} warning(s) on header values. Score ${score}/100 — tighten HSTS max-age, CSP, or framing next.`;
  } else {
    summary = `${fails} failing check(s), ${warns} warning(s). Score ${score}/100 — fix missing or weak core headers first.`;
  }

  return {
    success: true,
    domain,
    requestedUrl: url,
    finalUrl,
    status,
    https,
    score,
    summary,
    rows,
  };
}
