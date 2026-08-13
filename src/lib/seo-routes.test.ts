import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NextRequest } from "next/server";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { INDEXABLE_AUDIT_DOMAINS, SITE_URL } from "@/lib/audit/types";
import { getAllPosts } from "@/lib/blog";
import { SITEMAP_STATIC_PATHS } from "@/lib/site-urls";
import { auditHref, normalizeUrl } from "@/lib/url";
import { proxy } from "@/proxy";

describe("search crawler routes", () => {
  it("publishes only the intended canonical URL inventory", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);
    const expectedCount =
      SITEMAP_STATIC_PATHS.length +
      getAllPosts().length +
      INDEXABLE_AUDIT_DOMAINS.length;

    assert.equal(entries.length, expectedCount);
    assert.equal(new Set(urls).size, entries.length);

    for (const url of urls) {
      assert.equal(new URL(url).origin, SITE_URL);
    }
  });

  it("uses real article dates and omits unverifiable sitemap hints", async () => {
    const entries = await sitemap();
    const postsByUrl = new Map(
      getAllPosts().map((post) => [
        `${SITE_URL}/blog/${post.slug}`,
        post.updated ?? post.date,
      ])
    );

    for (const entry of entries) {
      assert.equal("priority" in entry, false);
      assert.equal("changeFrequency" in entry, false);

      const expectedPostDate = postsByUrl.get(entry.url);
      if (expectedPostDate) {
        assert.equal(
          new Date(entry.lastModified!).toISOString(),
          new Date(expectedPostDate).toISOString()
        );
      } else {
        assert.equal("lastModified" in entry, false);
      }
    }
  });

  it("allows social audit images while keeping diagnostic APIs out of crawl", () => {
    const config = robots();
    const rules = Array.isArray(config.rules) ? config.rules[0] : config.rules;

    assert.equal("host" in config, false);
    assert.deepEqual(rules.allow, ["/", "/api/og-audit"]);
    assert.deepEqual(rules.disallow, ["/api/"]);
    assert.equal(config.sitemap, `${SITE_URL}/sitemap.xml`);
  });

  it("lets valid audit routes render normally", () => {
    const response = proxy(
      new NextRequest("https://theseosoul.com/audit/example.com/docs")
    );

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-middleware-next"), "1");
  });

  it("preserves valid exact audit URLs through the request boundary", () => {
    for (const exactUrl of [
      "http://example.com/",
      "https://example.com/docs?lang=en",
      "https://example.com/100%25",
    ]) {
      const href = auditHref(normalizeUrl(exactUrl));
      const response = proxy(new NextRequest(new URL(href, SITE_URL)));

      assert.equal(response.status, 200, exactUrl);
      assert.equal(response.headers.get("x-middleware-next"), "1", exactUrl);
    }
  });

  it("rewrites malformed audit routes to a real 404 before streaming", () => {
    const response = proxy(
      new NextRequest("https://theseosoul.com/audit/not-a-valid-target")
    );

    assert.equal(response.status, 404);
    assert.equal(
      new URL(response.headers.get("x-middleware-rewrite")!).pathname,
      "/_not-found"
    );
  });
});
