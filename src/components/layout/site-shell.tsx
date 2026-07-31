"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isTool = pathname.startsWith("/audit");

  return (
    <>
      <Header compact={isTool} />
      <main className="flex-1">{children}</main>
      {isTool ? null : <Footer />}
    </>
  );
}
