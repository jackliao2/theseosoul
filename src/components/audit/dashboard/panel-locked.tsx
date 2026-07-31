import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PanelLocked({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
        {title}
      </h2>
      <div className="rounded-xl border border-dashed border-slate-300 px-5 py-8 text-center dark:border-slate-700">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
          <Lock className="h-4 w-4" />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
          Coming later · paid data
        </p>
        <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          {description}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Button asChild size="sm">
            <Link href="/#home-audit-url">Run free audit</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/#pro">See roadmap</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
