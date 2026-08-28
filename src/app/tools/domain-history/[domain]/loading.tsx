import { LoaderCircle } from "lucide-react";

export default function DomainHistoryLoading() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <LoaderCircle className="h-6 w-6 animate-spin text-teal-700 dark:text-teal-300" />
      <p className="mt-4 font-display text-lg font-semibold text-slate-900 dark:text-white">
        Asking the Wayback Machine
      </p>
      <p className="mt-1 text-sm text-slate-500">
        CDX timeline, representative snapshots, then WHOIS contrast…
      </p>
    </div>
  );
}
