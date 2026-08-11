import { FetchTimeoutError, fetchHtml, traceRedirects } from "@/lib/audit/fetch";
import { probeSsl } from "@/lib/audit/probe";
import type { CheckStatus, RedirectHop } from "@/lib/audit/types";

export { FetchTimeoutError };

export type SslCheckResult = {
  success: true;
  domain: string;
  hostname: string;
  requestedUrl: string;
  finalUrl: string | null;
  httpsFinal: boolean;
  available: boolean;
  validTo: string | null;
  daysRemaining: number | null;
  issuer: string | null;
  status: CheckStatus;
  summary: string;
  redirectHops: RedirectHop[];
};

export async function checkSsl(
  url: string,
  domain: string,
  hostname: string
): Promise<SslCheckResult> {
  const ssl = await probeSsl(hostname);
  let finalUrl: string | null = null;
  let httpsFinal = false;
  let redirectHops: RedirectHop[] = [];

  try {
    const httpsUrl = new URL(url);
    httpsUrl.protocol = "https:";
    const traced = await traceRedirects(httpsUrl.toString());
    redirectHops = traced.redirectChain;
    finalUrl = traced.finalUrl;
    httpsFinal = traced.finalUrl.startsWith("https:");
  } catch {
    try {
      const fetched = await fetchHtml(
        url.startsWith("http") ? url : `https://${hostname}/`
      );
      finalUrl = fetched.finalUrl;
      httpsFinal = fetched.finalUrl.startsWith("https:");
      redirectHops = fetched.redirectChain;
    } catch {
      finalUrl = null;
      httpsFinal = false;
    }
  }

  let summary = ssl.message;
  if (ssl.available && ssl.daysRemaining != null) {
    if (ssl.daysRemaining < 0) {
      summary = `Certificate expired ${Math.abs(ssl.daysRemaining)} day(s) ago${ssl.issuer ? ` · issuer ${ssl.issuer}` : ""}.`;
    } else if (ssl.status === "fail") {
      // Preserve hostname/chain trust failures reported by the TLS probe even
      // when the certificate's date range itself has not expired.
      summary = ssl.message;
    } else if (ssl.daysRemaining <= 21) {
      summary = `Certificate expires in ${ssl.daysRemaining} day(s)${ssl.issuer ? ` · ${ssl.issuer}` : ""}. Renew soon to avoid browser warnings.`;
    } else {
      summary = `Certificate valid for ${ssl.daysRemaining} more day(s)${ssl.issuer ? ` · ${ssl.issuer}` : ""}.`;
    }
  }
  if (!httpsFinal && finalUrl) {
    summary += " Final URL is not HTTPS after redirects.";
  }

  return {
    success: true,
    domain,
    hostname,
    requestedUrl: url,
    finalUrl,
    httpsFinal,
    available: ssl.available,
    validTo: ssl.validTo,
    daysRemaining: ssl.daysRemaining,
    issuer: ssl.issuer,
    status: ssl.status,
    summary,
    redirectHops,
  };
}
