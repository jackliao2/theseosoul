import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { SITE_URL } from "@/lib/audit/types";
import {
  canonicalDomainHistoryParam,
  domainHistoryCanonicalUrl,
  domainHistoryPath,
  domainHistoryPathFromInput,
  isIndexableDomainHistory,
} from "@/lib/tools/domain-history-url";

describe("domain history report URLs", () => {
  it("strips www and paths down to the registrable host", () => {
    assert.equal(
      canonicalDomainHistoryParam("https://www.Example.com/about"),
      "example.com"
    );
    assert.equal(canonicalDomainHistoryParam("WWW.theseosoul.com"), "theseosoul.com");
  });

  it("builds a shareable path without encoding the dot", () => {
    assert.equal(domainHistoryPath("theseosoul.com"), "/tools/domain-history/theseosoul.com");
    assert.equal(
      domainHistoryPathFromInput("https://www.rothanne.de/"),
      "/tools/domain-history/rothanne.de"
    );
  });

  it("rejects junk that is not a public domain", () => {
    assert.equal(canonicalDomainHistoryParam(""), null);
    assert.equal(canonicalDomainHistoryParam("not a domain"), null);
    assert.equal(canonicalDomainHistoryParam("localhost"), null);
    assert.throws(() => domainHistoryPathFromInput("nope"), /valid domain/i);
  });

  it("indexes only the curated first-party example", () => {
    assert.equal(isIndexableDomainHistory("theseosoul.com"), true);
    assert.equal(isIndexableDomainHistory("www.theseosoul.com"), true);
    assert.equal(isIndexableDomainHistory("rothanne.de"), false);
    assert.equal(
      domainHistoryCanonicalUrl("theseosoul.com"),
      `${SITE_URL}/tools/domain-history/theseosoul.com`
    );
  });
});
