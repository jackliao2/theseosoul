"use client";

import { useState } from "react";
import { Check, Copy, Download, Link2, Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPrimaryAction,
  getSoulProfile,
} from "@/lib/audit/soul";
import type { AuditResult } from "@/lib/audit/types";
import { auditCanonicalUrl, auditShareSlug } from "@/lib/url";
import { cn } from "@/lib/utils";

type FlashKind = "link" | "json" | "summary";

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export function ReportActions({ audit }: { audit: AuditResult }) {
  const [copied, setCopied] = useState<FlashKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const shareUrl = auditCanonicalUrl(audit);
  const slug = auditShareSlug(audit);

  function flash(kind: FlashKind) {
    setCopied(kind);
    setError(null);
    setTimeout(() => setCopied(null), 1600);
  }

  function fail(message: string) {
    setError(message);
    setTimeout(() => setError(null), 2800);
  }

  async function copyLink() {
    const ok = await writeClipboard(shareUrl);
    if (ok) flash("link");
    else fail("Couldn’t copy link — select the URL bar instead.");
  }

  async function copySummary() {
    const soul = getSoulProfile(audit);
    const priority = getPrimaryAction(audit);
    const lines = [
      `TheSeoSoul SEO Audit — ${slug}`,
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
      `Report: ${shareUrl}`,
    ];
    const ok = await writeClipboard(lines.join("\n"));
    if (ok) flash("summary");
    else fail("Couldn’t copy summary.");
  }

  async function share() {
    const soul = getSoulProfile(audit);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${slug} SEO Audit`,
          text: `${slug} scored ${audit.score}/100 (${audit.grade}). Site Soul: ${soul.name} — ${soul.message}`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
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
    a.download = `${slug.replace(/\//g, "-")}-seo-audit.json`;
    a.click();
    URL.revokeObjectURL(href);
    flash("json");
  }

  function printReport() {
    window.print();
  }

  return (
    <div className="relative flex items-center gap-0.5 no-print">
      <Button
        variant="ghost"
        size="icon"
        onClick={share}
        aria-label="Share report"
        title="Share"
        className="h-9 w-9 sm:h-8 sm:w-8"
      >
        {copied === "link" ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={copyLink}
        aria-label="Copy link"
        title="Copy link"
        className="h-9 w-9 sm:h-8 sm:w-8"
      >
        {copied === "link" ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={copySummary}
        aria-label="Copy summary"
        title="Copy summary"
        className="h-9 w-9 sm:h-8 sm:w-8"
      >
        {copied === "summary" ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={printReport}
        aria-label="Print or save as PDF"
        title="Print / PDF"
        className="h-9 w-9 sm:h-8 sm:w-8"
      >
        <Printer className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={downloadJson}
        aria-label="Download JSON"
        title="Download JSON"
        className={cn("h-9 w-9 sm:h-8 sm:w-8", "hidden sm:inline-flex")}
      >
        {copied === "json" ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <Download className="h-4 w-4" />
        )}
      </Button>

      {copied || error ? (
        <p
          role="status"
          className={cn(
            "absolute right-0 top-full z-10 mt-1 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium shadow-sm",
            error
              ? "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-200"
              : "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
          )}
        >
          {error
            ? error
            : copied === "link"
              ? "Link copied"
              : copied === "summary"
                ? "Summary copied"
                : "JSON downloaded"}
        </p>
      ) : null}
    </div>
  );
}
