import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server.js";
import { NextRequest } from "next/server";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { INDEXABLE_AUDIT_DOMAINS, SITE_URL } from "@/lib/audit/types";
import { getAllPosts } from "@/lib/blog";
import { SITEMAP_STATIC_PATHS } from "@/lib/site-urls";
import { auditHref, normalizeUrl } from "@/lib/url";
import { config as proxyConfig, proxy } from "@/proxy";

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

  it("retires confirmed parking and parameter-spam routes with 410", () => {
    for (const legacyPath of [
      "/__media__/js/netsoltrademark.php?d=spam.example",
      "/search.php?uid=old-parking-id",
      "/page.php?theseosoul=old-parking-id",
      "/Build_a_Web_Site.cfm?kt=207",
      "/phpmyadmin/error.php",
      "/rmgdsc/rprivacypolicy.php",
    ]) {
      const response = proxy(new NextRequest(new URL(legacyPath, SITE_URL)));

      assert.equal(response.status, 410, legacyPath);
      assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
    }
  });

  it("runs the proxy only for audit and confirmed legacy pollution routes", () => {
    for (const path of [
      "/audit/example.com",
      "/__media__/js/netsoltrademark.php?d=spam.example",
      "/phpmyadmin/error.php",
      "/rmgdsc/rprivacypolicy.php",
      "/search.php?uid=old-parking-id",
    ]) {
      assert.equal(
        unstable_doesMiddlewareMatch({ config: proxyConfig, url: path }),
        true,
        path
      );
    }

    for (const path of [
      "/2010/03/steady-seo-checkups-essential/",
      "/tools/search.php",
      "/search.php/extra",
      "/apple-icon",
      "/_next/static/chunks/app.js",
    ]) {
      assert.equal(
        unstable_doesMiddlewareMatch({ config: proxyConfig, url: path }),
        false,
        path
      );
    }
  });

  it("does not retire genuine legacy SEO paths without redirect evidence", () => {
    const response = proxy(
      new NextRequest(
        `${SITE_URL}/2010/03/steady-seo-checkups-essential/`
      )
    );

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-middleware-next"), "1");
  });
});
