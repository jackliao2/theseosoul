import { SITE_HOST, SITE_URL } from "@/lib/audit/types";
import { getIndexableSiteUrls } from "@/lib/site-urls";

/** Public IndexNow key — also hosted at /{key}.txt (required by the protocol). */
export const INDEXNOW_KEY = "48ec7a83ba98487ab08e89470dea3fa4";

export function indexNowKeyLocation(baseUrl: string = SITE_URL): string {
  return `${baseUrl.replace(/\/$/, "")}/${INDEXNOW_KEY}.txt`;
}

export async function submitIndexNow(
  urls: string[],
  options?: { host?: string; baseUrl?: string }
): Promise<{ ok: boolean; status: number; body: string }> {
  const baseUrl = (options?.baseUrl ?? SITE_URL).replace(/\/$/, "");
  const host = options?.host ?? SITE_HOST;
  const unique = Array.from(
    new Set(
      urls
        .map((url) => url.trim())
        .filter((url) => {
          try {
            const parsed = new URL(url);
            return parsed.hostname.replace(/^www\./, "") === host;
          } catch {
            return false;
          }
        })
    )
  );

  if (!unique.length) {
    return { ok: false, status: 400, body: "No valid same-host URLs to submit" };
  }

  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: indexNowKeyLocation(baseUrl),
      urlList: unique.slice(0, 10_000),
    }),
  });

  const body = await response.text();
  return {
    ok: response.ok || response.status === 202,
    status: response.status,
    body: body || response.statusText,
  };
}

export async function submitSitemapToIndexNow() {
  return submitIndexNow(getIndexableSiteUrls());
}
