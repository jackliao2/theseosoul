import tls from "node:tls";
import { Agent, fetch as undiciFetch } from "undici";
import { PROBE_CACHE_TTL_MS, cacheGet, cacheSet } from "@/lib/audit/cache";
import type { CheckStatus, DnsProbe, SslProbe } from "@/lib/audit/types";

const probeAgent = new Agent({
  allowH2: false,
  connectTimeout: 3_000,
  headersTimeout: 3_500,
  bodyTimeout: 4_000,
});

async function doh(name: string, type: string): Promise<string[]> {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2_800);
  try {
    const res = await undiciFetch(url, {
      signal: controller.signal,
      dispatcher: probeAgent,
      headers: { Accept: "application/dns-json" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      Answer?: Array<{ data?: string }>;
    };
    return (data.Answer ?? [])
      .map((a) => a.data?.replace(/\.$/, "").trim())
      .filter((d): d is string => Boolean(d));
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

function emptyDns(message: string): DnsProbe {
  return {
    available: false,
    a: [],
    aaaa: [],
    mx: [],
    ns: [],
    spf: null,
    dmarc: null,
    status: "warn",
    message,
  };
}

export async function probeDns(domain: string): Promise<DnsProbe> {
  const bare = domain.replace(/^www\./, "").toLowerCase();
  const cacheKey = `dns:${bare}`;
  const cached = cacheGet<DnsProbe>(cacheKey);
  if (cached) return cached;

  try {
    const [a, aaaa, mxRaw, ns, txt, dmarcRecords] = await Promise.all([
      doh(bare, "A"),
      doh(bare, "AAAA"),
      doh(bare, "MX"),
      doh(bare, "NS"),
      doh(bare, "TXT"),
      doh(`_dmarc.${bare}`, "TXT"),
    ]);

    const mx = mxRaw
      .map((row) => row.replace(/^\d+\s+/, "").replace(/\.$/, ""))
      .filter(Boolean)
      .slice(0, 6);

    const flatTxt = txt.map((t) => t.replace(/^"|"$/g, ""));
    const spf = flatTxt.find((t) => /^v=spf1\b/i.test(t)) ?? null;
    const dmarc =
      dmarcRecords
        .map((t) => t.replace(/^"|"$/g, ""))
        .find((t) => /^v=DMARC1\b/i.test(t)) ?? null;

    const available = a.length + aaaa.length + mx.length + ns.length > 0;
    let status: CheckStatus = "pass";
    let message = "DNS records loaded via Cloudflare DoH.";

    if (!available) {
      status = "warn";
      message = "DNS lookup returned no records.";
    } else if (mx.length > 0 && !spf) {
      status = "warn";
      message = "MX present but no SPF TXT — email spoofing risk.";
    } else if (mx.length > 0 && !dmarc) {
      status = "info";
      message = "MX present; consider adding DMARC at _dmarc.";
    }

    const result: DnsProbe = {
      available,
      a: a.slice(0, 6),
      aaaa: aaaa.slice(0, 4),
      mx,
      ns: ns.slice(0, 6),
      spf,
      dmarc,
      status,
      message,
    };
    cacheSet(cacheKey, result, PROBE_CACHE_TTL_MS);
    return result;
  } catch {
    return emptyDns("DNS probe failed — skipped without blocking the audit.");
  }
}

export async function probeSsl(hostname: string): Promise<SslProbe> {
  const host = hostname.toLowerCase();
  const cacheKey = `ssl:${host}`;
  const cached = cacheGet<SslProbe>(cacheKey);
  if (cached) return cached;

  const result = await new Promise<SslProbe>((resolve) => {
    const socket = tls.connect(
      {
        host: hostname,
        servername: hostname,
        port: 443,
        rejectUnauthorized: false,
        timeout: 3_000,
      },
      () => {
        const cert = socket.getPeerCertificate();
        socket.end();

        if (!cert || !cert.valid_to) {
          resolve({
            available: false,
            validTo: null,
            daysRemaining: null,
            issuer: null,
            status: "warn",
            message: "Could not read TLS certificate.",
          });
          return;
        }

        const validTo = new Date(cert.valid_to);
        const daysRemaining = Math.floor(
          (validTo.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
        );
        const issuerObj = cert.issuer as { O?: string; CN?: string } | undefined;
        const issuer = issuerObj?.O || issuerObj?.CN || null;

        let status: CheckStatus = "pass";
        let message = `TLS certificate valid · expires in ${daysRemaining} days.`;
        if (daysRemaining < 0) {
          status = "fail";
          message = "TLS certificate has expired.";
        } else if (daysRemaining <= 21) {
          status = "warn";
          message = `TLS certificate expires soon (${daysRemaining} days).`;
        }

        resolve({
          available: true,
          validTo: validTo.toISOString(),
          daysRemaining,
          issuer,
          status,
          message,
        });
      }
    );

    socket.on("error", () => {
      resolve({
        available: false,
        validTo: null,
        daysRemaining: null,
        issuer: null,
        status: "warn",
        message: "TLS probe failed.",
      });
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve({
        available: false,
        validTo: null,
        daysRemaining: null,
        issuer: null,
        status: "warn",
        message: "TLS probe timed out.",
      });
    });
  });

  cacheSet(
    cacheKey,
    result,
    result.available ? PROBE_CACHE_TTL_MS : 30 * 60 * 1000
  );
  return result;
}
