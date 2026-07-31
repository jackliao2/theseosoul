export type AdsenseCheckGroup =
  | "access"
  | "trust"
  | "content"
  | "monetization";

export type AdsenseCheckStatus = "pass" | "fix" | "review" | "info";

export type AdsenseCheckImpact = "critical" | "important" | "advisory";

export type AdsenseReadinessCheck = {
  id: string;
  group: AdsenseCheckGroup;
  title: string;
  status: AdsenseCheckStatus;
  impact: AdsenseCheckImpact;
  evidence: string;
  recommendation: string;
  url?: string;
};

export type AdsenseSamplePage = {
  url: string;
  title: string;
  words: number;
  h1Count: number;
  noindex: boolean;
  placeholder: boolean;
};

export type AdsenseTrustPage = {
  kind: "privacy" | "about" | "contact" | "terms";
  label: string;
  found: boolean;
  url: string | null;
};

export type AdsenseReadinessResult = {
  success: true;
  domain: string;
  origin: string;
  finalUrl: string;
  checkedAt: string;
  score: number;
  verdict: "Strong foundation" | "Some work needed" | "Not ready yet";
  summary: {
    passed: number;
    fixes: number;
    reviews: number;
    informational: number;
  };
  checks: AdsenseReadinessCheck[];
  trustPages: AdsenseTrustPage[];
  sampledPages: AdsenseSamplePage[];
  note: string;
};

export type AdsenseReadinessResponse =
  | AdsenseReadinessResult
  | { success: false; error: string };

export const ADSENSE_GROUPS: Array<{
  id: AdsenseCheckGroup;
  label: string;
  description: string;
}> = [
  {
    id: "access",
    label: "Access & crawl",
    description: "Can Google reach and understand the public site?",
  },
  {
    id: "trust",
    label: "Trust & transparency",
    description: "Can visitors identify the publisher and its data practices?",
  },
  {
    id: "content",
    label: "Content sample",
    description: "Does a bounded sample show useful, navigable content?",
  },
  {
    id: "monetization",
    label: "Monetization readiness",
    description: "Public ad setup signals plus checks only the owner can confirm.",
  },
];
