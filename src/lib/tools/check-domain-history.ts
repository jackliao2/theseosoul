import * as cheerio from "cheerio";
import { Agent, fetch as undiciFetch } from "undici";
import { cacheGet, cacheSet } from "@/lib/audit/cache";
import { checkAuditRateLimit } from "@/lib/audit/limit";
import { lookupWhois } from "@/lib/audit/whois";
import {
  KIND_LABELS,
  type DomainHistoryChapter,
  type DomainHistoryKind,
  type DomainHistoryResponse,
  type DomainHistoryResult,
  type DomainHistorySnapshot,
  type DomainHistoryVerdictId,
  type DomainHistoryYear,
} from "@/lib/tools/domain-history-types";

const GAP_MONTHS = 13;
const MAX_HTML_SAMPLES = 10;
const CDX_TIMEOUT_MS = 18_000;
const HTML_TIMEOUT_MS = 8_000;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const CACHE_KEY_PREFIX = "domain-history:v2:";

const http1Agent = new Agent({
  allowH2: false,
  connectTimeout: 10_000,
  headersTimeout: 18_000,
  bodyTimeout: 20_000,
});

type CdxRow = {
  timestamp: string;
  original: string;
  statuscode: string;
  digest: string;
  mimetype: string;
};

function bareDomain(domain: string): string {
  return domain.replace(/^www\./i, "").toLowerCase();
}

function parseTs(ts: string): Date {
  const y = Number(ts.slice(0, 4));
  const m = Number(ts.slice(4, 6)) - 1;
  const d = Number(ts.slice(6, 8) || "1");
  return new Date(Date.UTC(y, m, d));
}

function labelTs(ts: string): string {
  return `${ts.slice(0, 4)}.${ts.slice(4, 6)}`;
}

function monthsBetween(a: string, b: string): number {
  const da = parseTs(a);
  const db = parseTs(b);
  return (
    (db.getUTCFullYear() - da.getUTCFullYear()) * 12 +
    (db.getUTCMonth() - da.getUTCMonth())
  );
}

function durationLabel(start: string, end: string): string {
  const months = Math.max(0, monthsBetween(start, end));
  if (months < 1) return "Same month";
  if (months < 12) return `About ${months} month${months === 1 ? "" : "s"}`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (!rem) return `About ${years} year${years === 1 ? "" : "s"}`;
  return `About ${years}y ${rem}m`;
}

function waybackUrl(timestamp: string, original: string): string {
  return `https://web.archive.org/web/${timestamp}/${original}`;
}

function waybackRawUrl(timestamp: string, original: string): string {
  return `https://web.archive.org/web/${timestamp}id_/${original}`;
}

async function fetchText(url: string, timeoutMs: number): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await undiciFetch(url, {
      signal: controller.signal,
      dispatcher: http1Agent,
      headers: {
        "User-Agent": "TheSeoSoulDomainHistory/1.0 (+https://theseosoul.com)",
        Accept: "application/json,text/html,*/*",
      },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchCdx(
  domain: string
): Promise<{ rows: CdxRow[]; archiveOk: boolean }> {
  const hosts = [domain, `www.${domain}`];
  const rows: CdxRow[] = [];
  const seen = new Set<string>();
  let archiveOk = false;

  for (const host of hosts) {
    const url =
      `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(`${host}/`)}` +
      `&matchType=exact&output=json&fl=timestamp,original,statuscode,digest,mimetype` +
      `&filter=mimetype:text/html&collapse=timestamp:6`;
    try {
      const text = await fetchText(url, CDX_TIMEOUT_MS);
      const data = JSON.parse(text) as string[][];
      if (!Array.isArray(data)) continue;
      archiveOk = true;
      if (data.length < 2) continue;
      for (const row of data.slice(1)) {
        const [timestamp, original, statuscode, digest, mimetype] = row;
        if (!timestamp || !original) continue;
        const key = `${timestamp}:${digest}`;
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push({
          timestamp,
          original,
          statuscode: statuscode ?? "",
          digest: digest ?? "",
          mimetype: mimetype ?? "",
        });
      }
    } catch {
      // try next host
    }
  }

  return {
    rows: rows.sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    archiveOk,
  };
}

function classifyPage(input: {
  title: string;
  description: string;
  h1: string;
  text: string;
}): DomainHistoryKind {
  const blob = `${input.title} ${input.description} ${input.h1} ${input.text}`
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  if (!blob || blob.length < 12) return "empty";

  if (
    /page cannot be displayed|error\.|service provider|404 not found|not found|this site can.?t be reached|temporarily unavailable/.test(
      blob
    )
  ) {
    return "error";
  }

  if (
    /page has moved|moved permanently|click here to go there|redirecting/.test(
      blob
    )
  ) {
    return "redirect";
  }

  if (
    /domain (?:is |maybe )?for sale|inquire about this domain|buy this domain|this domain is|godaddy|sedo|hugedomains|afternic|dan\.com|related searches/.test(
      blob
    )
  ) {
    return "parking";
  }

  if (
    /leading .+ site on the net|connecting our visitors with providers|advertising products/.test(
      blob
    )
  ) {
    return "doorway";
  }

  if (
    /casino|poker|gambling|slot(?:s| machine)?|judi|togel|sabung|dewabola|granat\d*|adult dating|porn|xxx|viagra|cialis|pharmacy|obat kuat|deposit pulsa/.test(
      blob
    )
  ) {
    return "doorway";
  }

  const words = blob.split(/\s+/).filter(Boolean).length;
  if (words >= 40 || (input.title && words >= 18)) return "content";
  if (words < 12) return "empty";
  return "unknown";
}

function extractPage(html: string): {
  title: string;
  description: string;
  h1: string;
  text: string;
  excerpt: string;
  kind: DomainHistoryKind;
} {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();
  const title = $("title").first().text().replace(/\s+/g, " ").trim();
  const description = (
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    ""
  )
    .replace(/\s+/g, " ")
    .trim();
  const h1 = $("h1").first().text().replace(/\s+/g, " ").trim();
  const text = ($("main, article, body").first().text() || "")
    .replace(/\s+/g, " ")
    .trim();
  const excerpt = text.slice(0, 180);
  const kind = classifyPage({ title, description, h1, text });
  return { title, description, h1, text, excerpt, kind };
}

function pickSampleRows(rows: CdxRow[]): CdxRow[] {
  if (!rows.length) return [];
  const changePoints: CdxRow[] = [];
  let lastDigest = "";
  for (const row of rows) {
    if (row.digest && row.digest !== lastDigest) {
      changePoints.push(row);
      lastDigest = row.digest;
    }
  }
  if (!changePoints.length) changePoints.push(...rows);

  if (changePoints.length <= MAX_HTML_SAMPLES) return changePoints;

  const picked: CdxRow[] = [];
  const lastIndex = changePoints.length - 1;
  const slots = new Set<number>([0, lastIndex]);
  const midSlots = MAX_HTML_SAMPLES - 2;
  for (let i = 1; i <= midSlots; i++) {
    slots.add(Math.round((i * lastIndex) / (midSlots + 1)));
  }
  Array.from(slots)
    .sort((a, b) => a - b)
    .forEach((index) => picked.push(changePoints[index]));
  return picked;
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => run())
  );
  return results;
}

function yearActivity(rows: CdxRow[]): DomainHistoryYear[] {
  if (!rows.length) return [];
  const first = Number(rows[0].timestamp.slice(0, 4));
  const last = Number(rows[rows.length - 1].timestamp.slice(0, 4));
  const byYear = new Map<number, Set<string>>();
  for (const row of rows) {
    const year = Number(row.timestamp.slice(0, 4));
    const month = row.timestamp.slice(4, 6);
    if (!byYear.has(year)) byYear.set(year, new Set());
    byYear.get(year)!.add(month);
  }
  const years: DomainHistoryYear[] = [];
  for (let year = first; year <= last; year++) {
    years.push({ year, monthsActive: byYear.get(year)?.size ?? 0 });
  }
  return years;
}

function chapterFamily(
  kind: DomainHistoryKind
): "content" | "spam" | "idle" {
  if (kind === "content") return "content";
  if (kind === "doorway") return "spam";
  return "idle";
}

function dominantKind(group: DomainHistorySnapshot[]): DomainHistoryKind {
  const rank: DomainHistoryKind[] = [
    "doorway",
    "parking",
    "error",
    "redirect",
    "empty",
    "unknown",
    "content",
  ];
  for (const kind of rank) {
    if (group.some((item) => item.kind === kind)) return kind;
  }
  return group[0].kind;
}

function buildChapters(
  samples: DomainHistorySnapshot[]
): DomainHistoryChapter[] {
  if (!samples.length) return [];
  const groups: DomainHistorySnapshot[][] = [];
  let current: DomainHistorySnapshot[] = [samples[0]];

  for (let i = 1; i < samples.length; i++) {
    const prev = samples[i - 1];
    const next = samples[i];
    const gap = monthsBetween(prev.timestamp, next.timestamp);
    const prevFamily = chapterFamily(prev.kind);
    const nextFamily = chapterFamily(next.kind);
    const sameFamily = prevFamily === nextFamily && nextFamily !== "content";
    const sameKind = next.kind === prev.kind;
    // Idle eras often have multi-year gaps between parking/error captures.
    const gapLimit = sameFamily && nextFamily === "idle" ? 60 : GAP_MONTHS;
    if ((!sameKind && !sameFamily) || gap >= gapLimit) {
      groups.push(current);
      current = [next];
    } else {
      current.push(next);
    }
  }
  groups.push(current);

  return groups.map((group, index) => {
    const start = group[0].timestamp;
    const end = group[group.length - 1].timestamp;
    const kind = dominantKind(group);
    const titleHint =
      group.find((item) => item.title)?.title ??
      group.find((item) => item.h1)?.h1 ??
      null;
    const idleBlend =
      chapterFamily(kind) === "idle" &&
      new Set(group.map((item) => item.kind)).size > 1;
    return {
      id: `chapter-${index + 1}`,
      index: index + 1,
      kind,
      kindLabel: idleBlend ? "Idle / disrupted" : KIND_LABELS[kind],
      start,
      end,
      startLabel: labelTs(start),
      endLabel: labelTs(end),
      durationLabel: durationLabel(start, end),
      summary: idleBlend
        ? `Parking, errors, or empty hosts dominate this stretch.${titleHint ? ` Seen as “${titleHint.slice(0, 72)}”.` : ""}`
        : chapterSummary(kind, titleHint),
      snapshots: group,
    };
  });
}

function chapterSummary(
  kind: DomainHistoryKind,
  titleHint: string | null
): string {
  const tip = titleHint ? ` Seen as “${titleHint.slice(0, 72)}”.` : "";
  switch (kind) {
    case "content":
      return `Looked like a real content site.${tip}`;
    case "doorway":
      return `Thin or doorway-style pages — weak topical trust signal.${tip}`;
    case "parking":
      return `Domain parking / for-sale pages in this stretch.${tip}`;
    case "error":
      return `Host or DNS errors — the site was not serving useful content.${tip}`;
    case "redirect":
      return `Moved / redirect stubs rather than a stable homepage.${tip}`;
    case "empty":
      return `Snapshots with little readable text.${tip}`;
    default:
      return `Archive captured pages, but the role is unclear.${tip}`;
  }
}

function buildVerdict(input: {
  chapters: DomainHistoryChapter[];
  secondHand: boolean;
  hasRisky: boolean;
  hasParking: boolean;
  hasContent: boolean;
  firstLabel: string | null;
}): DomainHistoryResult["verdict"] {
  if (!input.chapters.length) {
    return {
      id: "no-trail" satisfies DomainHistoryVerdictId,
      label: "No public archive trail",
      detail:
        "Internet Archive has no usable homepage snapshots. That often means a clean unused domain — or a site that blocked archival crawlers.",
    };
  }
  if (input.hasRisky) {
    return {
      id: "risky-signals",
      label: "Risky historical signals",
      detail: input.secondHand
        ? "Archive pages show sensitive or spammy themes, and snapshots predate the current WHOIS registration — treat as a high-risk second-hand domain."
        : "Archive pages show sensitive or spammy themes. Verify carefully before building SEO equity on this name.",
    };
  }
  if (input.secondHand && (input.hasParking || !input.hasContent)) {
    return {
      id: "second-hand",
      label: "Second-hand domain",
      detail: `Archive activity starts in ${input.firstLabel ?? "an earlier year"}, before the current WHOIS creation date, with parking or dead periods in between.`,
    };
  }
  if (input.hasParking) {
    return {
      id: "parking-history",
      label: "Parking / idle history",
      detail:
        "This name spent time on for-sale or error pages. Fine for a fresh brand — less ideal if you hoped for clean aged content equity.",
    };
  }
  if (input.chapters.length > 1 || input.secondHand) {
    return {
      id: "mixed-reuse",
      label: "Reused over several eras",
      detail: input.secondHand
        ? "Multiple archive chapters and a WHOIS mismatch suggest ownership or purpose changes over time."
        : "The homepage role changed across archive chapters. Read the story below before assuming continuous brand equity.",
    };
  }
  return {
    id: "clean-content",
    label: "Mostly continuous content history",
    detail:
      "Sampled snapshots look like one content-oriented use. Still verify manually — Archive coverage is incomplete.",
  };
}

export async function checkDomainHistory(
  domainInput: string
): Promise<DomainHistoryResult> {
  const domain = bareDomain(domainInput);
  const cacheKey = `${CACHE_KEY_PREFIX}${domain}`;
  const cached = cacheGet<DomainHistoryResult>(cacheKey);
  if (cached) return cached;

  const [cdx, whois] = await Promise.all([
    fetchCdx(domain),
    lookupWhois(domain),
  ]);
  if (!cdx.archiveOk) {
    throw new Error(
      "Internet Archive did not respond in time. Retry this report in a minute."
    );
  }
  const rows = cdx.rows;

  const sampleRows = pickSampleRows(rows);
  const fetched = await mapPool(sampleRows, 3, async (row) => {
    try {
      const html = await fetchText(
        waybackRawUrl(row.timestamp, row.original),
        HTML_TIMEOUT_MS
      );
      const page = extractPage(html);
      const snapshot: DomainHistorySnapshot = {
        timestamp: row.timestamp,
        dateLabel: labelTs(row.timestamp),
        waybackUrl: waybackUrl(row.timestamp, row.original),
        title: page.title || null,
        h1: page.h1 || null,
        description: page.description || null,
        excerpt: page.excerpt || null,
        kind: page.kind,
        kindLabel: KIND_LABELS[page.kind],
      };
      return snapshot;
    } catch {
      const snapshot: DomainHistorySnapshot = {
        timestamp: row.timestamp,
        dateLabel: labelTs(row.timestamp),
        waybackUrl: waybackUrl(row.timestamp, row.original),
        title: null,
        h1: null,
        description: null,
        excerpt: null,
        kind: "unknown",
        kindLabel: KIND_LABELS.unknown,
      };
      return snapshot;
    }
  });

  const samples = fetched.sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp)
  );
  const chapters = buildChapters(samples);
  const years = yearActivity(rows);
  const uniqueVersions = new Set(rows.map((row) => row.digest).filter(Boolean))
    .size;
  const first = rows[0] ?? null;
  const last = rows[rows.length - 1] ?? null;

  const createdMs = whois.createdAt ? Date.parse(whois.createdAt) : NaN;
  const firstMs = first ? parseTs(first.timestamp).getTime() : NaN;
  const secondHand =
    Number.isFinite(createdMs) &&
    Number.isFinite(firstMs) &&
    firstMs < createdMs - 90 * 24 * 60 * 60 * 1000;

  const hasParking = chapters.some((chapter) => chapter.kind === "parking");
  const hasContent = chapters.some((chapter) => chapter.kind === "content");
  const hasRisky = samples.some((sample) =>
    /casino|poker|gambling|slot|judi|togel|granat\d*|porn|xxx|viagra|cialis|pharmacy|obat kuat/i.test(
      `${sample.title ?? ""} ${sample.excerpt ?? ""} ${sample.h1 ?? ""}`
    )
  );

  const flags: string[] = [];
  if (secondHand) flags.push("Archive predates current WHOIS creation date");
  if (hasParking) flags.push("Parked or for-sale pages appear in history");
  if (chapters.some((c) => c.kind === "doorway")) {
    flags.push("Doorway / thin affiliate style pages appear");
  }
  if (chapters.some((c) => c.kind === "error")) {
    flags.push("Long stretches served errors or dead hosting");
  }
  if (hasRisky) flags.push("Sensitive or spam-adjacent wording in samples");

  const verdict = buildVerdict({
    chapters,
    secondHand,
    hasRisky,
    hasParking,
    hasContent,
    firstLabel: first ? labelTs(first.timestamp) : null,
  });

  const result: DomainHistoryResult = {
    success: true,
    domain,
    checkedAt: new Date().toISOString(),
    verdict,
    stats: {
      firstSnapshot: first?.timestamp ?? null,
      firstLabel: first ? labelTs(first.timestamp) : null,
      lastSnapshot: last?.timestamp ?? null,
      lastLabel: last ? labelTs(last.timestamp) : null,
      activeMonths: rows.length,
      uniqueVersions,
      chapterCount: chapters.length,
      sampledPages: samples.length,
    },
    whois: {
      createdAt: whois.createdAt,
      createdLabel: whois.createdAt
        ? whois.createdAt.slice(0, 7).replace("-", ".")
        : null,
      registrar: whois.registrar,
      ageYears: whois.ageYears,
      secondHand,
      message: whois.message,
    },
    years,
    chapters,
    flags,
    note: "Built from Internet Archive CDX + a bounded sample of Wayback HTML and public RDAP WHOIS. Coverage is incomplete; this is due-diligence evidence, not a guarantee the domain is safe to buy.",
  };

  cacheSet(cacheKey, result, CACHE_TTL_MS);
  return result;
}

/** Rate-limit + error wrapper for shareable /tools/domain-history/[domain] pages. */
export async function runGuardedDomainHistory(
  domainInput: string,
  clientIp: string
): Promise<DomainHistoryResponse> {
  const domain = bareDomain(domainInput);

  if (domain.includes(".")) {
    const limited = checkAuditRateLimit(clientIp, domain);
    if (!limited.ok) {
      const who =
        limited.reason === "domain" ? `this domain (${domain})` : "your IP";
      return {
        success: false,
        error: `Too many lookups for ${who}. Try again in ~${limited.retryAfterSec}s.`,
      };
    }
  }

  try {
    return await checkDomainHistory(domain);
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Domain history check failed",
    };
  }
}
