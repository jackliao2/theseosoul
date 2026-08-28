import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  ContentEyebrow,
  ContentPage,
  ContentTitle,
} from "@/components/layout/content-page";
import { DomainHistoryForm } from "@/components/tools/domain-history-form";
import { DomainHistoryReport } from "@/components/tools/domain-history-report";
import { DomainHistoryShare } from "@/components/tools/domain-history-share";
import { ToolError } from "@/components/tools/url-tool-form";
import { SITE_NAME, SITE_URL } from "@/lib/audit/types";
import { clientIpFromHeaders } from "@/lib/audit/limit";
import { runGuardedDomainHistory } from "@/lib/tools/check-domain-history";
import {
  canonicalDomainHistoryParam,
  domainHistoryCanonicalUrl,
  domainHistoryPath,
  isIndexableDomainHistory,
} from "@/lib/tools/domain-history-url";
import { createSocialMetadata } from "@/lib/social-metadata";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

type PageProps = {
  params: Promise<{ domain: string }>;
};

function resolvedDomain(raw: string): string | null {
  return canonicalDomainHistoryParam(raw);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { domain: raw } = await params;
  const domain = resolvedDomain(raw);
  if (!domain) {
    return {
      title: "Domain history",
      robots: { index: false, follow: false },
    };
  }

  const path = domainHistoryPath(domain);
  const indexable = isIndexableDomainHistory(domain);
  const title = `${domain} domain history — Wayback & WHOIS`;
  const description = `Archive chapters, parking eras, and WHOIS contrast for ${domain}. Public Wayback + RDAP — shareable report, no signup.`;

  return {
    title: { absolute: `${title} | ${SITE_NAME}` },
    description,
    alternates: { canonical: path },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
    ...createSocialMetadata({
      title: `${domain} domain history`,
      description,
      url: path,
    }),
  };
}

export default async function DomainHistoryReportPage({ params }: PageProps) {
  const { domain: raw } = await params;
  const domain = resolvedDomain(raw);
  if (!domain) notFound();

  let decodedRaw = raw;
  try {
    decodedRaw = decodeURIComponent(raw);
  } catch {
    decodedRaw = raw;
  }
  if (decodedRaw.toLowerCase() !== domain) {
    redirect(domainHistoryPath(domain));
  }

  const h = await headers();
  const result = await runGuardedDomainHistory(
    domain,
    clientIpFromHeaders(h)
  );
  const share = domainHistoryCanonicalUrl(domain);
  const indexable = isIndexableDomainHistory(domain);

  return (
    <ContentPage wide className="max-w-6xl py-10 sm:py-12">
      {indexable && result.success ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: `${domain} domain history`,
              description: result.verdict.detail,
              url: share,
              dateModified: result.checkedAt,
              isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
              about: domain,
            }).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}

      <ContentEyebrow>
        <Link href="/tools" className="hover:underline">
          Free tools
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        <Link href="/tools/domain-history" className="hover:underline">
          Domain history
        </Link>
      </ContentEyebrow>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <ContentTitle>{domain} domain history</ContentTitle>
        <DomainHistoryShare url={share} />
      </div>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
        Wayback chapters plus WHOIS contrast for{" "}
        <span className="font-medium text-slate-800 dark:text-slate-100">
          {domain}
        </span>
        . Send this URL — it is the report.
      </p>

      <div className="mt-8">
        <DomainHistoryForm initialDomain={domain} />
      </div>

      <div className="mt-8">
        {result.success ? (
          <DomainHistoryReport result={result} />
        ) : (
          <ToolError>{result.error}</ToolError>
        )}
      </div>

      <p className="mt-8 text-sm text-slate-500">
        <Link
          href="/tools/domain-history"
          className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
        >
          How the checker works
        </Link>
        {" · "}
        <Link
          href={`/audit/${domain}`}
          className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
        >
          Live technical audit
        </Link>
        {" · "}
        <Link
          href="/blog/domain-history-before-you-buy"
          className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
        >
          Buying an aged domain
        </Link>
      </p>
    </ContentPage>
  );
}
