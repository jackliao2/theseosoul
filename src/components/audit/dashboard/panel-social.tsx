import type { AuditResult } from "@/lib/audit/types";

export function PanelSocial({ audit }: { audit: AuditResult }) {
  const { social } = audit;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
        Social
      </h2>
      <p className="text-sm text-slate-500">{social.message}</p>

      <TagBlock title="Open Graph" tags={social.openGraph.tags} empty="No OG tags" />
      <TagBlock
        title="Twitter Cards"
        tags={social.twitter.tags}
        empty="No Twitter Card tags"
      />
    </div>
  );
}

function TagBlock({
  title,
  tags,
  empty,
}: {
  title: string;
  tags: Record<string, string>;
  empty: string;
}) {
  const entries = Object.entries(tags);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
      <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">{empty}</p>
      ) : (
        <dl className="mt-3 space-y-2">
          {entries.map(([key, value]) => (
            <div key={key} className="grid gap-1 sm:grid-cols-[160px_1fr]">
              <dt className="text-xs font-medium text-slate-500">{key}</dt>
              <dd className="break-all text-sm text-slate-800 dark:text-slate-200">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
