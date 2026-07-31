import type * as cheerio from "cheerio";
import type { LinkItem, LinksResult } from "@/lib/audit/types";

export function parseLinks(
  $: cheerio.CheerioAPI,
  pageUrl: string
): LinksResult {
  let pageHost = "";
  try {
    pageHost = new URL(pageUrl).hostname.replace(/^www\./, "");
  } catch {
    pageHost = "";
  }

  const items: LinkItem[] = [];
  let internal = 0;
  let external = 0;
  let nofollow = 0;

  $("a[href]").each((_, el) => {
    const hrefRaw = ($(el).attr("href") || "").trim();
    if (
      !hrefRaw ||
      hrefRaw.startsWith("#") ||
      hrefRaw.startsWith("javascript:") ||
      hrefRaw.startsWith("mailto:") ||
      hrefRaw.startsWith("tel:")
    ) {
      return;
    }

    let href = hrefRaw;
    let host = "";
    try {
      const absolute = new URL(hrefRaw, pageUrl);
      href = absolute.toString();
      host = absolute.hostname.replace(/^www\./, "");
    } catch {
      return;
    }

    const isInternal = Boolean(pageHost) && host === pageHost;
    const rel = ($(el).attr("rel") || "").toLowerCase();
    const isNofollow = rel.includes("nofollow");
    if (isNofollow) nofollow += 1;
    if (isInternal) internal += 1;
    else external += 1;

    const text = $(el).text().replace(/\s+/g, " ").trim().slice(0, 120);

    items.push({
      href: href.slice(0, 400),
      text: text || href,
      internal: isInternal,
      nofollow: isNofollow,
    });
  });

  const total = items.length;
  let status: LinksResult["status"] = "pass";
  let message = `Found ${total} links (${internal} internal, ${external} external).`;

  if (total === 0) {
    status = "warn";
    message = "No hyperlinks found on the page.";
  }

  return {
    total,
    internal,
    external,
    nofollow,
    items: items.slice(0, 150),
    status,
    message,
  };
}
