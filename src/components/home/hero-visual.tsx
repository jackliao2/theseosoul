/** Full-bleed product plane — audit dashboard preview under the hero CTA. */
export function HeroVisual() {
  return (
    <div
      aria-hidden
      className="pointer-events-none relative mt-10 w-full overflow-hidden sm:mt-14"
    >
      <div className="mx-auto w-[min(1120px,140%)] translate-y-2 px-2 sm:translate-y-0 sm:px-4">
        <div className="animate-float-slow overflow-hidden rounded-t-xl border border-slate-800/80 bg-[#0e1520] shadow-[0_-20px_80px_rgba(11,18,32,0.35)] dark:shadow-[0_-20px_80px_rgba(0,0,0,0.55)]">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
            <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
            <span className="h-2 w-2 rounded-full bg-[#28c840]" />
            <span className="ml-3 truncate font-mono text-[11px] text-slate-400">
              theseosoul.com/audit/stripe.com
            </span>
            <span className="ml-auto font-mono text-[10px] text-teal-300/90">
              91 · A · GEO 78
            </span>
          </div>

          <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[160px_1fr]">
            <div className="space-y-0.5 border-r border-white/10 bg-black/30 p-2.5 sm:p-3">
              {[
                ["Overview", true],
                ["Issues", false],
                ["Structure", false],
                ["Keywords", false],
                ["Signals", false],
                ["GEO", false],
                ["Domain", false],
              ].map(([item, active]) => (
                <div
                  key={String(item)}
                  className={
                    active
                      ? "rounded px-2 py-1.5 font-mono text-[11px] text-teal-200"
                      : "rounded px-2 py-1.5 font-mono text-[11px] text-slate-500"
                  }
                  style={
                    active
                      ? { background: "rgba(45,212,191,0.12)" }
                      : undefined
                  }
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="space-y-3 p-3 sm:p-4">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 56 56">
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      fill="none"
                      stroke="rgba(148,163,184,0.15)"
                      strokeWidth="5"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      fill="none"
                      stroke="#2dd4bf"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={138}
                      strokeDashoffset={12}
                      className="animate-ring-draw"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-display text-sm font-bold text-white">
                    91
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold text-white">
                    stripe.com
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                    TLS · DNS · RDAP · live HTML
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  ["Title", "48/60"],
                  ["Description", "152/160"],
                  ["TLS days", "120 left"],
                  ["Redirects", "1 hop"],
                  ["Schema", "4 types"],
                  ["llms.txt", "Found"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="border border-white/10 bg-white/[0.03] px-2.5 py-2"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-wide text-slate-400">
                      {k}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-slate-200">
                      {v}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[color:var(--background)] to-transparent" />
    </div>
  );
}
