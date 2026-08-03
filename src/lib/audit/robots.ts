import type { AiCrawlerCheck, CheckStatus, RobotsResult } from "@/lib/audit/types";
import { fetchText } from "@/lib/audit/fetch";

const AI_CRAWLERS = [
  { name: "GPTBot", userAgent: "GPTBot" },
  { name: "ClaudeBot", userAgent: "ClaudeBot" },
  { name: "Google-Extended", userAgent: "Google-Extended" },
  { name: "PerplexityBot", userAgent: "PerplexityBot" },
  { name: "Bytespider", userAgent: "Bytespider" },
] as const;

function parseRobotsRules(content: string): AiCrawlerCheck[] {
  const lines = content.split(/\r?\n/).map((l) => l.trim());
  const checks: AiCrawlerCheck[] = [];

  for (const crawler of AI_CRAWLERS) {
    let mentioned = false;
    let blocked = false;
    let inAgentBlock = false;

    for (const line of lines) {
      if (!line || line.startsWith("#")) continue;

      const uaMatch = line.match(/^user-agent:\s*(.+)$/i);
      if (uaMatch) {
        const agent = uaMatch[1].trim();
        inAgentBlock =
          agent === "*" ||
          agent.toLowerCase() === crawler.userAgent.toLowerCase();
        if (agent.toLowerCase() === crawler.userAgent.toLowerCase()) {
          mentioned = true;
        }
        continue;
      }

      if (!inAgentBlock) continue;

      const disallowMatch = line.match(/^disallow:\s*(.*)$/i);
      if (disallowMatch) {
        const path = disallowMatch[1].trim();
        if (path === "/" || path === "/*") {
          blocked = true;
          if (inAgentBlock) mentioned = true;
        }
      }
    }

    // Also catch explicit mentions anywhere
    if (
      content.toLowerCase().includes(crawler.userAgent.toLowerCase())
    ) {
      mentioned = true;
    }

    let status: CheckStatus = "pass";
    let message = `${crawler.name} is not explicitly blocked.`;

    if (blocked) {
      status = "fail";
      message = `${crawler.name} appears blocked in robots.txt.`;
    } else if (!mentioned) {
      status = "info";
      message = `${crawler.name} is not mentioned in robots.txt (defaults usually allow).`;
    } else {
      status = "pass";
      message = `${crawler.name} is mentioned and not fully blocked.`;
    }

    checks.push({
      name: crawler.name,
      userAgent: crawler.userAgent,
      mentioned,
      blocked,
      status,
      message,
    });
  }

  return checks;
}

function allowsGeneralIndexing(content: string): boolean {
  const lines = content.split(/\r?\n/).map((l) => l.trim());
  let inStar = false;

  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    const uaMatch = line.match(/^user-agent:\s*(.+)$/i);
    if (uaMatch) {
      inStar = uaMatch[1].trim() === "*";
      continue;
    }
    if (!inStar) continue;
    const disallowMatch = line.match(/^disallow:\s*(.*)$/i);
    if (disallowMatch) {
      const path = disallowMatch[1].trim();
      if (path === "/" || path === "/*") return false;
    }
  }

  return true;
}

function extractSitemaps(content: string): string[] {
  const found: string[] = [];
  for (const line of content.split(/\r?\n/)) {
    const match = line.trim().match(/^sitemap:\s*(.+)$/i);
    if (match?.[1]) found.push(match[1].trim());
  }
  return Array.from(new Set(found));
}

export async function analyzeRobots(origin: string): Promise<RobotsResult> {
  const url = new URL("/robots.txt", origin).toString();
  const content = await fetchText(url);

  if (!content) {
    return {
      present: false,
      url,
      content: null,
      allowsIndexing: null,
      sitemapDirectives: [],
      aiCrawlers: AI_CRAWLERS.map((c) => ({
        name: c.name,
        userAgent: c.userAgent,
        mentioned: false,
        blocked: false,
        status: "warn" as const,
        message: `Cannot verify ${c.name} — robots.txt not found.`,
      })),
      status: "warn",
      message: "robots.txt was not found or could not be fetched.",
    };
  }

  const aiCrawlers = parseRobotsRules(content);
  const allowsIndexing = allowsGeneralIndexing(content);
  const sitemapDirectives = extractSitemaps(content);
  const blockedCount = aiCrawlers.filter((c) => c.blocked).length;

  let status: CheckStatus = "pass";
  let message = "robots.txt is present and crawlable.";

  if (!allowsIndexing) {
    status = "fail";
    message = "robots.txt blocks all crawlers via User-agent: * Disallow: /";
  } else if (blockedCount > 0) {
    status = "warn";
    message = `${blockedCount} AI crawler(s) appear blocked in robots.txt.`;
  } else if (sitemapDirectives.length === 0) {
    status = "warn";
    message = "robots.txt present but no Sitemap: directive found.";
  }

  return {
    present: true,
    url,
    // Cap for response size; large enough for path/UA matching on typical files.
    content: content.slice(0, 100_000),
    allowsIndexing,
    sitemapDirectives,
    aiCrawlers,
    status,
    message,
  };
}
