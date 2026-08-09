import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ContentEyebrow,
  ContentLead,
  ContentPage,
  ContentTitle,
} from "@/components/layout/content-page";
import { getAllPosts } from "@/lib/blog";
import { SITE_NAME } from "@/lib/audit/types";

const HUB_IMAGE = "/images/site/guides-hub.webp";
const HUB_ALT =
  "Abstract illustration of technical SEO guides and documentation";

export const metadata: Metadata = {
  title: "SEO & GEO Guides",
  description:
    "Practical technical SEO and GEO guides from TheSeoSoul — robots vs noindex, sitemaps, SSL, domain history, AdSense readiness, and honest free tools. No fake DA charts.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `SEO & GEO Guides · ${SITE_NAME}`,
    description:
      "Long-form guides on technical SEO, crawl control, GEO, and the free tools we ship.",
    url: "/blog",
    type: "website",
    images: [{ url: HUB_IMAGE, width: 1600, height: 900, alt: HUB_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: `SEO & GEO Guides · ${SITE_NAME}`,
    description:
      "Long-form guides on technical SEO, crawl control, GEO, and the free tools we ship.",
    images: [HUB_IMAGE],
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <ContentPage wide className="max-w-4xl">
      <ContentEyebrow>Guides</ContentEyebrow>
      <ContentTitle>SEO & GEO guides</ContentTitle>
      <ContentLead>
        Practical write-ups tied to real checks — not recycled “10 tips” fluff
        or invented authority scores. Use them with our{" "}
        <Link
          href="/tools"
          className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
        >
          free tools
        </Link>{" "}
        and{" "}
        <Link
          href="/#home-audit-url"
          className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
        >
          technical audit
        </Link>
        .
      </ContentLead>

      <figure className="mt-8 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <Image
          src={HUB_IMAGE}
          alt={HUB_ALT}
          width={1600}
          height={900}
          className="h-auto w-full object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 896px"
        />
      </figure>

      <ul className="mt-12 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-700 dark:border-slate-700">
        {posts.map((post) => (
          <li key={post.slug} className="py-8">
            <Link
              href={`/blog/${post.slug}`}
              className="group grid gap-4 sm:grid-cols-[11rem_1fr] sm:items-start"
            >
              {post.cover ? (
                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                  <Image
                    src={post.cover}
                    alt={post.coverAlt ?? post.title}
                    width={352}
                    height={198}
                    className="aspect-video h-auto w-full object-cover transition-opacity group-hover:opacity-90"
                    sizes="176px"
                  />
                </div>
              ) : (
                <div className="hidden sm:block" />
              )}
              <div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span aria-hidden>·</span>
                  <span>{post.readingMinutes} min read</span>
                  {post.tags?.[0] ? (
                    <>
                      <span aria-hidden>·</span>
                      <span>{post.tags[0]}</span>
                    </>
                  ) : null}
                </div>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-teal-800 dark:text-slate-50 dark:group-hover:text-teal-300">
                  {post.title}
                </h2>
                <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
                  {post.excerpt ?? post.description}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm text-slate-500 dark:text-slate-400">
        Questions?{" "}
        <a
          href="mailto:hello@theseosoul.com"
          className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
        >
          hello@theseosoul.com
        </a>
        {" · "}
        <a
          href="/llms.txt"
          className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
        >
          llms.txt
        </a>
      </p>
    </ContentPage>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}
