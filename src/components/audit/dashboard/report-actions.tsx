"use client";

import { useState } from "react";
import { Check, Copy, Download, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPrimaryAction,
  getSoulProfile,
} from "@/lib/audit/soul";
import type { AuditResult } from "@/lib/audit/types";
import { auditCanonicalUrl } from "@/lib/url";
import { cn } from "@/lib/utils";

export function ReportActions({ audit }: { audit: AuditResult }) {
  const [copied, setCopied] = useState<"link" | "json" | "summary" | null>(
    null
  );

  function flash(kind: "link" | "json" | "summary") {
    setCopied(kind);
    setTimeout(() => setCopied(null), 1600);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(auditCanonicalUrl(audit.domain));
      flash("link");
    } catch {
      // ignore
    }
  }

  async function copySummary() {
    const soul = getSoulProfile(audit);
    const priority = getPrimaryAction(audit);
    const lines = [
      `TheSeoSoul SEO Audit — ${audit.domain}`,
      `Score: ${audit.score}/100 (Grade ${audit.grade})`,
      `Site Soul: ${soul.name}`,
      soul.message,
      priority.urgent
        ? `Fix first: ${priority.title} — ${priority.fix}`
        : "Priority: No urgent issues today.",
      `URL: ${audit.url}`,
      `Title: ${audit.title.content ?? "N/A"} (${audit.title.length})`,
      `Description: ${audit.description.content ?? "N/A"} (${audit.description.length})`,
      `GEO: ${audit.geo.score}/100`,
      `Issues: ${audit.issues.length}`,
      `Fetched: ${audit.fetchedAt}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      flash("summary");
    } catch {
      // ignore
    }
  }

  async function share() {
    const url = auditCanonicalUrl(audit.domain);
    const soul = getSoulProfile(audit);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${audit.domain} SEO Audit`,
          text: `${audit.domain} scored ${audit.score}/100 (${audit.grade}). Site Soul: ${soul.name} — ${soul.message}`,
          url,
        });
        return;
      } catch {
        // fall through
      }
    }
    await copyLink();
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(audit, null, 2)], {
      type: "application/json",
    });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `${audit.domain}-seo-audit.json`;
    a.click();
    URL.revokeObjectURL(href);
    flash("json");
  }

  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        onClick={share}
        aria-label="Share report"
        className="h-8 w-8"
      >
        {copied === "link" ? (
          <Check className="h-4 w-4" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={copyLink}
        aria-label="Copy link"
        className="hidden h-8 w-8 sm:inline-flex"
      >
        <Link2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={copySummary}
        aria-label="Copy summary"
        className="h-8 w-8"
        title="Copy summary"
      >
        {copied === "summary" ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={downloadJson}
        aria-label="Download JSON"
        className={cn("h-8 w-8", "hidden sm:inline-flex")}
      >
        {copied === "json" ? (
          <Check className="h-4 w-4" />
        ) : (
          <Download className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
