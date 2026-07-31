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
  domainFromParam,
  isValidDomainParam,
} from "@/lib/url";

type PageProps = {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ t?: string; tab?: string }>;
};

/** ISR: refresh audit snapshots hourly for long-tail pages */
export const revalidate = 3600;
/** Vercel: Node serverless — needs TLS/DNS probes + cheerio (not Edge). */
export const runtime = "nodejs";
export const maxDuration = 60;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { domain: raw } = await params;
  let domain = raw;

  try {
    domain = domainFromParam(raw).domain;
  } catch {
    domain = decodeURIComponent(raw);
  }

  const title = `${domain} SEO Audit & Technical Analysis | ${SITE_NAME}`;
  const description = `Free technical SEO audit for ${domain}: on-page SEO, structure, GEO, TLS, DNS, and shareable /audit report.`;
  const canonical = auditCanonicalUrl(domain);
  const indexable = isIndexableAuditDomain(domain);

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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function AuditDomainPage({
  params,
  searchParams,
}: PageProps) {
  const { domain: raw } = await params;
  const sp = await searchParams;

  if (!isValidDomainParam(raw)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <AuditError
          error={{
            success: false,
            domain: decodeURIComponent(raw),
            url: null,
            error: "Please provide a valid public domain (e.g. shopify.com).",
            code: "INVALID_URL",
          }}
        />
      </div>
    );
  }

  const { domain } = domainFromParam(raw);
  const h = await headers();
  const audit = await runGuardedAudit(domain, clientIpFromHeaders(h), {
    fresh: Boolean(sp.t),
  });

  if (!audit.success) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <AuditError error={audit} />
        <p className="mt-4 text-center text-xs text-slate-500">
          Canonical: {SITE_URL}/audit/{domain}
        </p>
      </div>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${audit.domain} SEO Audit & Technical Analysis`,
            description: audit.summary,
            dateModified: audit.fetchedAt,
            author: { "@type": "Organization", name: SITE_NAME },
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
            mainEntityOfPage: auditCanonicalUrl(audit.domain),
            about: audit.url,
          }),
        }}
      />
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
            Loading audit dashboard…
          </div>
        }
      >
        <AuditDashboard audit={audit} />
      </Suspense>
    </>
  );
}
