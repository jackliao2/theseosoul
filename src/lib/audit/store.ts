/**
 * Recently-audited domain registry (local/dev persistence).
 * Sitemap indexing uses curated INDEXABLE_AUDIT_DOMAINS only —
 * not every domain ever audited (avoids thin-content scale).
 */

import { promises as fs } from "fs";
import path from "path";
import { INDEXABLE_AUDIT_DOMAINS } from "@/lib/audit/types";

const SEED_DOMAINS = [...INDEXABLE_AUDIT_DOMAINS];

const MAX_RECENT = 200;
const STORE_PATH = path.join(process.cwd(), "data", "audited-domains.json");

type StoreShape = {
  domains: string[];
  updatedAt: string;
};

const memory = new Set<string>(SEED_DOMAINS);
let hydrated = false;

async function hydrate(): Promise<void> {
  if (hydrated) return;
  hydrated = true;

  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as StoreShape;
    for (const d of parsed.domains ?? []) {
      if (typeof d === "string" && d.includes(".")) {
        memory.add(d.toLowerCase().replace(/^www\./, ""));
      }
    }
  } catch {
    // File may not exist yet — seed list is enough.
  }
}

async function persist(): Promise<void> {
  try {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    const payload: StoreShape = {
      domains: Array.from(memory).slice(-MAX_RECENT),
      updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(STORE_PATH, JSON.stringify(payload, null, 2), "utf8");
  } catch {
    // Persistence is best-effort (read-only FS on some hosts).
  }
}

export function rememberAudit(domain: string): void {
  const clean = domain.toLowerCase().replace(/^www\./, "");
  if (!clean.includes(".")) return;
  memory.add(clean);
  void persist();
}

/** All remembered domains (recent audits UI / local history). */
export async function getAuditedDomains(): Promise<string[]> {
  await hydrate();
  return Array.from(memory).sort();
}

/** Domains safe to list in sitemap / default-index. */
export function getIndexableAuditDomains(): string[] {
  return [...INDEXABLE_AUDIT_DOMAINS].sort();
}

export function isIndexableAuditDomain(domain: string): boolean {
  const clean = domain.toLowerCase().replace(/^www\./, "");
  return (INDEXABLE_AUDIT_DOMAINS as readonly string[]).includes(clean);
}
