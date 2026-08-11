import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { AuditDashboard } from "@/components/audit/dashboard/audit-dashboard";
import { AuditError } from "@/components/audit/audit-error";
import { runGuardedAudit } from "@/lib/audit/guard";
import { clientIpFromHeaders } from "@/lib/audit/limit";
import { isIndexableAuditDomain } from "@/lib/audit/store";
import { SITE_NAME, SITE_URL } from "@/lib/audit/types";
import {
  auditCanonicalUrl,
  auditShareSlug,
  targetFromAuditRoute,
} from "@/lib/url";

type PageProps = {
  params: Promise<{ target: string[] }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

/** ISR: refresh audit snapshots hourly for long-tail pages */
export const revalidate = 3600;
/** Vercel: Node serverless — needs TLS/DNS probes + cheerio (not Edge). */
export const runtime = "nodejs";
export const maxDuration = 60;

function targetLabel(segments: string[]): string {
  // Dynamic route params have already been decoded by Next.js.
  return segments.join("/");
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { target } = await params;
  const sp = await searchParams;
  let domain = target[0] ?? "site";
  let label = domain;
  let canonical = `${SITE_URL}/audit/${domain}`;
  let cleanIndexableHomepage = false;

  try {
    const normalized = targetFromAuditRoute(target, sp);
    const parsed = new URL(normalized.url);
    domain = normalized.domain;
    const slug = auditShareSlug(normalized);
    label = slug;
    canonical = auditCanonicalUrl(normalized);
    cleanIndexableHomepage =
      parsed.protocol === "https:" &&
      parsed.hostname === normalized.domain &&
      parsed.pathname === "/" &&
      !parsed.search;
  } catch {
    label = targetLabel(target);
  }

  const title = `${label} SEO Audit & Technical Analysis | ${SITE_NAME}`;
  const description = `Free technical SEO audit for ${label}: on-page SEO, structure, GEO, TLS, DNS, and shareable /audit report.`;
  const indexable =
    isIndexableAuditDomain(domain) && cleanIndexableHomepage;
  const ogImage = `${SITE_URL}/api/og-audit?target=${encodeURIComponent(label)}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function AuditTargetPage({
  params,
  searchParams,
}: PageProps) {
  const { target } = await params;
  const sp = await searchParams;
  const rawLabel = targetLabel(target);

  let normalized: ReturnType<typeof targetFromAuditRoute>;
  try {
    normalized = targetFromAuditRoute(target, sp);
  } catch (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <AuditError
          error={{
            success: false,
            domain: rawLabel,
            url: null,
            error:
              error instanceof Error
                ? error.message
                : "Please provide a valid public URL (e.g. shopify.com or example.com/blog).",
            code: "INVALID_URL",
          }}
        />
      </div>
    );
  }

  const h = await headers();
  const audit = await runGuardedAudit(
    normalized.url,
    clientIpFromHeaders(h),
    { fresh: Boolean(sp.t) }
  );

  if (!audit.success) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <AuditError error={audit} />
        <p className="mt-4 text-center text-xs text-slate-500">
          Canonical: {auditCanonicalUrl(normalized)}
        </p>
      </div>
    );
  }

  const share = auditCanonicalUrl(normalized);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${auditShareSlug(normalized)} SEO Audit & Technical Analysis`,
            description: audit.summary,
            dateModified: audit.fetchedAt,
            author: { "@type": "Organization", name: SITE_NAME },
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
            },
            mainEntityOfPage: share,
            about: normalized.url,
          }).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
            Loading audit dashboard…
          </div>
        }
      >
        <AuditDashboard audit={audit} requestedUrl={normalized.url} />
      </Suspense>
    </>
  );
}
