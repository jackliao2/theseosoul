import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  AUDIT_EXACT_URL_PARAM,
  MAX_AUDIT_URL_BYTES,
  auditCacheKey,
  auditHref,
  normalizeUrl,
  targetFromAuditRoute,
} from "@/lib/url";

describe("normalizeUrl", () => {
  it("defaults bare domains to HTTPS while preserving the exact host, path, and query", () => {
    assert.deepEqual(normalizeUrl("WWW.Example.com/Docs/?utm_source=test#section"), {
      url: "https://www.example.com/Docs/?utm_source=test",
      domain: "example.com",
      hostname: "www.example.com",
    });
  });

  it("preserves an explicitly requested HTTP scheme", () => {
    assert.equal(
      normalizeUrl("http://example.com/path").url,
      "http://example.com/path"
    );
  });

  it("rejects authentication codes in query parameters", () => {
    assert.throws(
      () => normalizeUrl("https://example.com/callback?code=secret"),
      /sensitive query parameter/i
    );
  });

  it("rejects input over the byte limit, including multibyte text", () => {
    const prefix = "https://example.com/";
    const exactLimit = `${prefix}${"x".repeat(MAX_AUDIT_URL_BYTES - prefix.length)}`;
    assert.equal(normalizeUrl(exactLimit).url, exactLimit);

    const oversized = `${prefix}${"é".repeat(MAX_AUDIT_URL_BYTES)}`;
    assert.throws(() => normalizeUrl(oversized), /longer than 4,096 bytes/i);
  });
});

describe("audit report routes", () => {
  it("round-trips an encoded percent through Next's decoded catch-all params", () => {
    const exactUrl = "https://example.com/100%25";
    const href = auditHref({ domain: "example.com", url: exactUrl });
    const reportUrl = new URL(href, "https://audit.example");
    const segments = reportUrl.pathname
      .slice("/audit/".length)
      .split("/")
      .map((segment) => decodeURIComponent(segment));

    assert.deepEqual(segments, ["example.com", "100%"]);
    assert.equal(
      targetFromAuditRoute(segments, {
        [AUDIT_EXACT_URL_PARAM]: reportUrl.searchParams.get(
          AUDIT_EXACT_URL_PARAM
        )!,
      }).url,
      exactUrl
    );
  });

  it("round-trips an encoded percent through Next's raw production params", () => {
    const exactUrl = "https://example.com/100%25";
    const href = auditHref({ domain: "example.com", url: exactUrl });
    const reportUrl = new URL(href, "https://audit.example");
    const segments = reportUrl.pathname.slice("/audit/".length).split("/");

    assert.equal(
      targetFromAuditRoute(segments, {
        [AUDIT_EXACT_URL_PARAM]: reportUrl.searchParams.get(
          AUDIT_EXACT_URL_PARAM
        )!,
      }).url,
      exactUrl
    );
  });

  for (const exactUrl of [
    "https://example.com/a%252Fb",
    "https://example.com/100%2525",
  ]) {
    it(`round-trips a double-encoded path: ${exactUrl}`, () => {
      const href = auditHref({ domain: "example.com", url: exactUrl });
      const reportUrl = new URL(href, "https://audit.example");
      const rawSegments = reportUrl.pathname.slice("/audit/".length).split("/");
      const decodedSegments = rawSegments.map((segment) =>
        decodeURIComponent(segment)
      );

      for (const segments of [rawSegments, decodedSegments]) {
        assert.equal(
          targetFromAuditRoute(segments, {
            [AUDIT_EXACT_URL_PARAM]: reportUrl.searchParams.get(
              AUDIT_EXACT_URL_PARAM
            )!,
          }).url,
          exactUrl
        );
      }
    });
  }

  it("rejects an exact URL marker that does not match the visible route", () => {
    assert.throws(
      () =>
        targetFromAuditRoute(["example.com", "safe"], {
          [AUDIT_EXACT_URL_PARAM]: "https://example.com/private",
        }),
      /does not match/i
    );
  });

  it("uses the full normalized URL as the cache identity", () => {
    assert.notEqual(
      auditCacheKey("https://www.example.com/path?a=1", "example.com"),
      auditCacheKey("http://example.com/path?a=1", "example.com")
    );
  });
});
