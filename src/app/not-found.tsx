import Link from "next/link";
import { SITE_NAME } from "@/lib/audit/types";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <p className="font-display text-6xl font-bold text-teal-600/30">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold text-slate-900 dark:text-white">
        Page not found
      </h1>
      <p className="mt-3 text-slate-600 dark:text-slate-400">
        That URL isn’t on {SITE_NAME}. Try a free audit instead.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-lg bg-teal-600 px-5 text-sm font-semibold text-white hover:bg-teal-500"
        >
          Go home
        </Link>
        <Link
          href="/#home-audit-url"
          className="inline-flex h-11 items-center rounded-lg border border-slate-300 px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
        >
          Free audit
        </Link>
      </div>
    </div>
  );
}
