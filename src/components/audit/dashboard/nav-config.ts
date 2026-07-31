import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  FileSearch,
  Globe2,
  LayoutDashboard,
  Layers3,
  Sparkles,
  Type,
  CalendarClock,
} from "lucide-react";
import type { AuditTabId, LegacyAuditTabId } from "@/lib/audit/types";

export type NavItem = {
  id: AuditTabId;
  label: string;
  icon: LucideIcon;
  locked?: boolean;
};

export const AUDIT_NAV: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "issues", label: "Issues", icon: AlertTriangle },
  { id: "structure", label: "Structure", icon: Layers3 },
  { id: "keywords", label: "Keywords", icon: Type },
  { id: "signals", label: "Signals", icon: FileSearch },
  { id: "geo", label: "GEO", icon: Sparkles },
  { id: "domain", label: "Domain", icon: CalendarClock },
  { id: "insights", label: "Insights", icon: Globe2, locked: true },
];

const LEGACY_TAB_MAP: Record<LegacyAuditTabId, AuditTabId> = {
  density: "keywords",
  headings: "structure",
  images: "structure",
  links: "structure",
  social: "signals",
  hreflangs: "signals",
  structured: "signals",
  tech: "domain",
  whois: "domain",
  traffic: "insights",
  backlinks: "insights",
  serp: "insights",
  settings: "insights",
};

const PRIMARY_IDS = new Set<string>(AUDIT_NAV.map((i) => i.id));

export function resolveAuditTabId(value: string | null): AuditTabId {
  if (!value) return "overview";
  if (PRIMARY_IDS.has(value)) return value as AuditTabId;
  if (value in LEGACY_TAB_MAP) {
    return LEGACY_TAB_MAP[value as LegacyAuditTabId];
  }
  return "overview";
}

export function isAuditTabId(value: string | null): value is AuditTabId {
  return Boolean(value && PRIMARY_IDS.has(value));
}

/** @deprecated Prefer resolveAuditTabId — kept for older imports. */
export function normalizeTabParam(value: string | null): AuditTabId {
  return resolveAuditTabId(value);
}
