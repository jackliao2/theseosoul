export type DomainHistoryKind =
  | "content"
  | "doorway"
  | "parking"
  | "error"
  | "redirect"
  | "empty"
  | "unknown";

export type DomainHistoryVerdictId =
  | "no-trail"
  | "clean-content"
  | "mixed-reuse"
  | "parking-history"
  | "second-hand"
  | "risky-signals";

export type DomainHistorySnapshot = {
  timestamp: string;
  dateLabel: string;
  waybackUrl: string;
  title: string | null;
  h1: string | null;
  description: string | null;
  excerpt: string | null;
  kind: DomainHistoryKind;
  kindLabel: string;
};

export type DomainHistoryChapter = {
  id: string;
  index: number;
  kind: DomainHistoryKind;
  kindLabel: string;
  start: string;
  end: string;
  startLabel: string;
  endLabel: string;
  durationLabel: string;
  summary: string;
  snapshots: DomainHistorySnapshot[];
};

export type DomainHistoryYear = {
  year: number;
  monthsActive: number;
};

export type DomainHistoryResult = {
  success: true;
  domain: string;
  checkedAt: string;
  verdict: {
    id: DomainHistoryVerdictId;
    label: string;
    detail: string;
  };
  stats: {
    firstSnapshot: string | null;
    firstLabel: string | null;
    lastSnapshot: string | null;
    lastLabel: string | null;
    activeMonths: number;
    uniqueVersions: number;
    chapterCount: number;
    sampledPages: number;
  };
  whois: {
    createdAt: string | null;
    createdLabel: string | null;
    registrar: string | null;
    ageYears: number | null;
    secondHand: boolean;
    message: string;
  };
  years: DomainHistoryYear[];
  chapters: DomainHistoryChapter[];
  flags: string[];
  note: string;
};

export type DomainHistoryResponse =
  | DomainHistoryResult
  | { success: false; error: string };

export const KIND_LABELS: Record<DomainHistoryKind, string> = {
  content: "Content site",
  doorway: "Doorway / thin affiliate",
  parking: "Parked / for sale",
  error: "Error / offline",
  redirect: "Moved / redirect stub",
  empty: "Little readable text",
  unknown: "Unclassified",
};
