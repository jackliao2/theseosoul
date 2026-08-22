import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assessAdsenseContentHeuristics,
  determineAdsenseReadinessOutcome,
} from "@/lib/tools/check-adsense-readiness";
import type {
  AdsenseReadinessCheck,
  AdsenseSamplePage,
} from "@/lib/tools/adsense-readiness-types";

const reference = {
  label: "Google guidance",
  url: "https://support.google.com/adsense/",
  relation: "Google guidance" as const,
};

function finding(
  id: string,
  signal: Pick<AdsenseReadinessCheck, "status" | "impact">
): AdsenseReadinessCheck {
  return {
    id,
    group: "content",
    title: id,
    status: signal.status,
    impact: signal.impact,
    evidence: "test evidence",
    recommendation: "test recommendation",
    reference,
  };
}

function sample(
  path: string,
  words: number,
  placeholder = false
): AdsenseSamplePage {
  return {
    url: `https://example.com/${path}`,
    title: path,
    words,
    h1Count: 1,
    noindex: false,
    placeholder,
  };
}

function assessmentChecks(
  assessment: ReturnType<typeof assessAdsenseContentHeuristics>
): AdsenseReadinessCheck[] {
  return [
    finding("site-purpose", assessment.sitePurpose),
    finding("homepage-content", assessment.homepageContent),
    finding("content-inventory", assessment.contentInventory),
    finding("sample-size", assessment.sampleSize),
    finding("content-depth", assessment.contentDepth),
    finding("deep-content", assessment.deepContent),
    finding("thin-pages", assessment.thinPages),
    finding("placeholders", assessment.placeholders),
    finding("privacy-disclosure", { status: "pass", impact: "critical" }),
    finding("trust-bundle", { status: "pass", impact: "critical" }),
  ];
}

describe("AdSense content heuristics", () => {
  it("uses length markers only to switch between advisory review and pass", () => {
    const assess = (homeWords: number, sampleWords: number) =>
      assessAdsenseContentHeuristics({
        homeTitle: "Focused Reference",
        homeWords,
        homePlaceholder: false,
        inventoryCount: 1,
        sampledPages: [sample("boundary", sampleWords)],
      });

    assert.equal(assess(299, 499).homepageContent.status, "review");
    assert.equal(assess(300, 499).homepageContent.status, "pass");
    assert.equal(assess(300, 499).contentDepth.status, "review");
    assert.equal(assess(300, 500).contentDepth.status, "pass");
    assert.equal(assess(300, 799).deepContent.status, "review");
    assert.equal(assess(300, 800).deepContent.status, "pass");

    for (const words of [299, 300, 499, 500, 799, 800]) {
      const assessment = assess(words, words);
      assert.notEqual(assessment.homepageContent.status, "fix");
      assert.notEqual(assessment.contentDepth.status, "fix");
      assert.notEqual(assessment.deepContent.status, "fix");
    }
  });

  it("keeps concise but complete content as advisory review, not a blocking fix", () => {
    const assessment = assessAdsenseContentHeuristics({
      homeTitle: "Concise Technical Reference",
      homeWords: 120,
      homePlaceholder: false,
      inventoryCount: 5,
      sampledPages: [
        sample("one", 140),
        sample("two", 160),
        sample("three", 180),
        sample("four", 200),
        sample("five", 220),
      ],
    });

    assert.deepEqual(assessment.homepageContent, {
      status: "review",
      impact: "advisory",
    });
    assert.deepEqual(assessment.contentDepth, {
      status: "review",
      impact: "advisory",
    });
    assert.deepEqual(assessment.deepContent, {
      status: "review",
      impact: "advisory",
    });
    assert.deepEqual(assessment.thinPages, {
      status: "review",
      impact: "advisory",
    });
    assert.deepEqual(assessment.contentInventory, {
      status: "review",
      impact: "advisory",
    });

    const outcome = determineAdsenseReadinessOutcome(
      assessmentChecks(assessment)
    );
    assert.equal(outcome.criticalFixes, 0);
    assert.equal(outcome.score, 100);
    assert.equal(outcome.verdict, "Strong foundation");
  });

  it("still blocks an explicitly unfinished homepage and placeholder page", () => {
    const assessment = assessAdsenseContentHeuristics({
      homeTitle: "Site Launch",
      homeWords: 80,
      homePlaceholder: true,
      inventoryCount: 1,
      sampledPages: [sample("draft", 120, true)],
    });

    assert.deepEqual(assessment.homepageContent, {
      status: "fix",
      impact: "critical",
    });
    assert.deepEqual(assessment.placeholders, {
      status: "fix",
      impact: "critical",
    });

    const outcome = determineAdsenseReadinessOutcome(
      assessmentChecks(assessment)
    );
    assert.equal(outcome.criticalFixes, 2);
    assert.ok(outcome.score <= 44);
    assert.equal(outcome.verdict, "Not ready yet");
  });

  it("treats a sampled page with no readable body as a critical defect", () => {
    const assessment = assessAdsenseContentHeuristics({
      homeTitle: "Useful Reference",
      homeWords: 90,
      homePlaceholder: false,
      inventoryCount: 1,
      sampledPages: [sample("blank", 0)],
    });

    assert.equal(assessment.blankPagesCount, 1);
    assert.deepEqual(assessment.thinPages, {
      status: "fix",
      impact: "critical",
    });
  });

  it("does not turn small but real page counts into an unofficial quota", () => {
    const assessment = assessAdsenseContentHeuristics({
      homeTitle: "Single-purpose Calculator",
      homeWords: 160,
      homePlaceholder: false,
      inventoryCount: 1,
      sampledPages: [sample("calculator", 180)],
    });

    assert.deepEqual(assessment.contentInventory, {
      status: "review",
      impact: "advisory",
    });
    assert.deepEqual(assessment.sampleSize, {
      status: "review",
      impact: "advisory",
    });

    const outcome = determineAdsenseReadinessOutcome(
      assessmentChecks(assessment)
    );
    assert.equal(outcome.criticalFixes, 0);
    assert.equal(outcome.verdict, "Strong foundation");
  });

  it("still fails when no eligible or sampleable public content exists", () => {
    const assessment = assessAdsenseContentHeuristics({
      homeTitle: "Empty Directory",
      homeWords: 80,
      homePlaceholder: false,
      inventoryCount: 0,
      sampledPages: [],
    });

    assert.deepEqual(assessment.contentInventory, {
      status: "fix",
      impact: "critical",
    });
    assert.deepEqual(assessment.sampleSize, {
      status: "fix",
      impact: "critical",
    });

    const outcome = determineAdsenseReadinessOutcome(
      assessmentChecks(assessment)
    );
    assert.equal(outcome.verdict, "Not ready yet");
  });
});
