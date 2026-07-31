"use client";

import type { ReactNode, MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  focusHomeAudit,
  HOME_AUDIT_HASH,
} from "@/lib/focus-home-audit";

/** “Free audit” CTA — reliably lands on the homepage URL field. */
export function AuditCtaLink({
  className,
  children,
  onNavigate,
}: {
  className?: string;
  children: ReactNode;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const href = `/#${HOME_AUDIT_HASH}`;

  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    onNavigate?.();
    if (pathname === "/") {
      e.preventDefault();
      focusHomeAudit("smooth");
    }
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
