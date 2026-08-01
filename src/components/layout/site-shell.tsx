"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAudit = pathname.startsWith("/audit");

  return (
    <>
      <div className="no-print">
        <Header compact={isAudit} />
      </div>
      <main className="flex-1">{children}</main>
      {/* Keep footer on audit reports so curated examples still pass PageRank to About/Tools/Contact. */}
      <div className="no-print">
        <Footer />
      </div>
    </>
  );
}
