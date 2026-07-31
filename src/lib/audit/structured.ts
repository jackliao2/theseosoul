import type * as cheerio from "cheerio";
import type {
  HreflangItem,
  HreflangsResult,
  StructuredDataResult,
} from "@/lib/audit/types";

export function parseHreflangs(
  $: cheerio.CheerioAPI,
  baseUrl: string
): HreflangsResult {
  const items: HreflangItem[] = [];

  $('link[rel="alternate"][hreflang]').each((_, el) => {
    const lang = ($(el).attr("hreflang") || "").trim();
    const hrefRaw = ($(el).attr("href") || "").trim();
    if (!lang || !hrefRaw) return;

    let href = hrefRaw;
    try {
      href = new URL(hrefRaw, baseUrl).toString();
    } catch {
      // keep raw
    }

    items.push({ lang, href });
  });

  return {
    total: items.length,
    items,
    status: items.length > 0 ? "pass" : "info",
    message:
      items.length > 0
        ? `Found ${items.length} hreflang alternate(s).`
        : "No hreflang tags found.",
  };
}

function collectTypes(node: unknown, types: Set<string>): void {
  if (!node || typeof node !== "object") return;

  if (Array.isArray(node)) {
    for (const item of node) collectTypes(item, types);
    return;
  }

  const obj = node as Record<string, unknown>;
  const typeVal = obj["@type"];
  if (typeof typeVal === "string") types.add(typeVal);
  if (Array.isArray(typeVal)) {
    for (const t of typeVal) {
      if (typeof t === "string") types.add(t);
    }
  }

  for (const value of Object.values(obj)) {
    if (value && typeof value === "object") collectTypes(value, types);
  }
}

export function parseStructuredData(
  $: cheerio.CheerioAPI
): StructuredDataResult {
  const types = new Set<string>();
  const snippets: string[] = [];
  let jsonLdCount = 0;

  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text().trim();
    if (!raw) return;
    jsonLdCount += 1;
    snippets.push(raw.slice(0, 500));
    try {
      const parsed = JSON.parse(raw) as unknown;
      collectTypes(parsed, types);
    } catch {
      // invalid JSON-LD still counted as present
    }
  });

  const hasMicrodata =
    $("[itemscope]").length > 0 || $("[itemtype]").length > 0;

  if (hasMicrodata) {
    $("[itemtype]").each((_, el) => {
      const itemtype = ($(el).attr("itemtype") || "").trim();
      if (itemtype) {
        const short = itemtype.split("/").pop() || itemtype;
        types.add(short);
      }
    });
  }

  const typeList = Array.from(types).slice(0, 40);
  const present = jsonLdCount > 0 || hasMicrodata;

  let status: StructuredDataResult["status"] = "pass";
  let message = `Found ${jsonLdCount} JSON-LD block(s)${hasMicrodata ? " and microdata" : ""}.`;

  if (!present) {
    status = "warn";
    message = "No structured data (JSON-LD / microdata) detected.";
  }

  return {
    jsonLdCount,
    types: typeList,
    hasMicrodata,
    snippets: snippets.slice(0, 8),
    status,
    message,
  };
}
