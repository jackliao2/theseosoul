import Link from "next/link";
import { SiteBrand } from "@/components/brand/site-mark";
import { AuditCtaLink } from "@/components/layout/audit-cta-link";
import { SITE_EMAIL, SITE_NAME } from "@/lib/audit/types";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-[color:var(--surface)] dark:border-slate-700">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <SiteBrand size="md" />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Free technical SEO audits with shareable report URLs — honest
            checks, no signup.
          </p>
          <a
            href={`mailto:${SITE_EMAIL}`}
            className="mt-3 inline-block text-sm font-medium text-teal-700 hover:underline dark:text-teal-300"
          >
            {SITE_EMAIL}
          </a>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Product
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <AuditCtaLink className="hover:text-teal-700 dark:hover:text-teal-300">
                Free SEO Audit
              </AuditCtaLink>
            </li>
            <li>
              <Link
                href="/tools"
                className="hover:text-teal-700 dark:hover:text-teal-300"
              >
                Free tools
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="hover:text-teal-700 dark:hover:text-teal-300"
              >
                Guides & blog
              </Link>
            </li>
            <li>
              <Link
                href="/tools/domain-history"
                className="hover:text-teal-700 dark:hover:text-teal-300"
              >
                Domain history
              </Link>
            </li>
            <li>
              <Link
                href="/tools/seo-ladder"
                className="hover:text-teal-700 dark:hover:text-teal-300"
              >
                SEO site ladder
              </Link>
            </li>
            <li>
              <Link
                href="/tools/adsense-readiness-checker"
                className="hover:text-teal-700 dark:hover:text-teal-300"
              >
                AdSense readiness
              </Link>
            </li>
            <li>
              <Link
                href="/tools/sitemap-checker"
                className="hover:text-teal-700 dark:hover:text-teal-300"
              >
                Sitemap checker
              </Link>
            </li>
            <li>
              <Link
                href="/tools/ssl-checker"
                className="hover:text-teal-700 dark:hover:text-teal-300"
              >
                SSL days checker
              </Link>
            </li>
            <li>
              <Link
                href="/tools/robots-txt-checker"
                className="hover:text-teal-700 dark:hover:text-teal-300"
              >
                Robots.txt checker
              </Link>
            </li>
            <li>
              <Link
                href="/audit/theseosoul.com"
                className="hover:text-teal-700 dark:hover:text-teal-300"
              >
                Example report
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Company
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <Link
                href="/about"
                className="hover:text-teal-700 dark:hover:text-teal-300"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-teal-700 dark:hover:text-teal-300"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/#faq"
                className="hover:text-teal-700 dark:hover:text-teal-300"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href="/#pro"
                className="hover:text-teal-700 dark:hover:text-teal-300"
              >
                Pro (coming)
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Legal
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <Link
                href="/privacy"
                className="hover:text-teal-700 dark:hover:text-teal-300"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="hover:text-teal-700 dark:hover:text-teal-300"
              >
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
        © {new Date().getFullYear()} {SITE_NAME}. Free technical SEO inspection.
      </div>
    </footer>
  );
}
