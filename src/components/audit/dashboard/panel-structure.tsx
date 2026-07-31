"use client";

import { useMemo, useState } from "react";
import type { AuditResult, HeadingItem } from "@/lib/audit/types";
import { cn } from "@/lib/utils";

type Sub = "headings" | "images" | "links";

type TreeNode = HeadingItem & { children: TreeNode[] };

function buildHeadingTree(items: HeadingItem[]): TreeNode[] {
  const roots: TreeNode[] = [];
  const stack: TreeNode[] = [];

  for (const item of items) {
    const node: TreeNode = { ...item, children: [] };
    while (stack.length && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }
    if (stack.length === 0) {
      roots.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }
    stack.push(node);
  }

  return roots;
}

function HeadingBranch({
  nodes,
  depth = 0,
}: {
  nodes: TreeNode[];
  depth?: number;
}) {
  if (!nodes.length) return null;

  return (
    <ul className={cn(depth > 0 && "ml-3 border-l border-slate-200 dark:border-slate-700")}>
      {nodes.map((node, idx) => (
        <li key={`${node.level}-${idx}-${node.text.slice(0, 24)}`} className="relative">
          {depth > 0 ? (
            <span className="absolute -left-px top-3 h-px w-3 bg-slate-200 dark:bg-slate-700" />
          ) : null}
          <div
            className={cn(
              "flex items-start gap-2 py-1.5 pr-2",
              depth > 0 ? "pl-3" : "pl-1"
            )}
          >
            <span
              className={cn(
                "mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold",
                node.level === 1
                  ? "bg-teal-800 text-white dark:bg-teal-500 dark:text-slate-950"
                  : node.level === 2
                    ? "bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              )}
            >
              H{node.level}
            </span>
            <span
              className={cn(
                "min-w-0 text-sm leading-snug text-slate-800 dark:text-slate-200",
                node.level === 1 && "font-semibold",
                node.level === 3 && "text-slate-600 dark:text-slate-400"
              )}
            >
              {node.text}
            </span>
          </div>
          <HeadingBranch nodes={node.children} depth={depth + 1} />
        </li>
      ))}
    </ul>
  );
}

export function PanelStructure({ audit }: { audit: AuditResult }) {
  const [sub, setSub] = useState<Sub>("headings");
  const { headings, images, links } = audit;
  const tree = useMemo(() => buildHeadingTree(headings.items), [headings.items]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          Structure
        </h2>
        <div className="flex rounded-md border border-slate-200 p-0.5 text-xs dark:border-slate-700">
          {(
            [
              ["headings", `Outline ${headings.items.length}`],
              ["images", `Images ${images.total}`],
              ["links", `Links ${links.total}`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSub(id)}
              className={cn(
                "rounded px-2.5 py-1 font-semibold transition-colors",
                sub === id
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {sub === "headings" ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              H1 {headings.h1Count}
            </span>
            {" · "}
            H2 {headings.h2Count} · H3 {headings.h3Count}
            {" — "}
            {headings.message}
          </p>
          <div className="rounded-lg border border-slate-200 px-2 py-1 dark:border-slate-800">
            {tree.length ? (
              <HeadingBranch nodes={tree} />
            ) : (
              <p className="px-2 py-8 text-center text-sm text-slate-500">
                No headings found.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {sub === "images" ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">
            {images.withAlt}/{images.total} with alt · {images.missingAlt} missing
          </p>
          <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full table-fixed text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase text-slate-500 dark:bg-slate-950">
                <tr>
                  <th className="w-[48%] px-2 py-1.5">Src</th>
                  <th className="w-[40%] px-2 py-1.5">Alt</th>
                  <th className="w-[12%] px-2 py-1.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {images.items.slice(0, 60).map((img, i) => (
                  <tr
                    key={`${img.src}-${i}`}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="truncate px-2 py-1.5 text-slate-600">
                      {img.src || "—"}
                    </td>
                    <td className="truncate px-2 py-1.5">{img.alt ?? "—"}</td>
                    <td className="px-2 py-1.5">
                      {img.missingAlt ? (
                        <span className="text-rose-600">Missing</span>
                      ) : (
                        <span className="text-emerald-600">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {sub === "links" ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">
            {links.internal} internal · {links.external} external ·{" "}
            {links.nofollow} nofollow
          </p>
          <ul className="rounded-lg border border-slate-200 dark:border-slate-800">
            {links.items.slice(0, 80).map((link, i) => (
              <li
                key={`${link.href}-${i}`}
                className="border-b border-slate-100 px-2.5 py-1.5 text-xs last:border-0 dark:border-slate-800"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={
                      link.internal
                        ? "text-[10px] font-bold uppercase text-teal-700"
                        : "text-[10px] font-bold uppercase text-slate-500"
                    }
                  >
                    {link.internal ? "in" : "out"}
                  </span>
                  {link.nofollow ? (
                    <span className="text-[10px] font-bold uppercase text-amber-600">
                      nf
                    </span>
                  ) : null}
                  <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                    {link.text || "(no text)"}
                  </span>
                </div>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 block truncate text-[11px] text-teal-700 hover:underline dark:text-teal-400"
                >
                  {link.href}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
