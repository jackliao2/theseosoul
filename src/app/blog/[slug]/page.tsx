import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { BlogMarkdown } from "@/components/blog/blog-markdown";
import { EditorialTrustBox } from "@/components/blog/editorial-trust-box";
import {
  ContentEyebrow,
  ContentPage,
  ContentTitle,
} from "@/components/layout/content-page";
import { getAllPosts, getAllSlugs, getPost } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/audit/types";

type Props = { params: Promise<{ slug: string }> };

const EDITORIAL_TEAM_NAME = "TheSeoSoul Technical SEO & Infrastructure Team";
const EDITORIAL_TEAM_URL = `${SITE_URL}/about`;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Guide not found" };
  const path = `/blog/${post.slug}`;
  const ogImages = post.cover
    ? [{ url: post.cover, width: 1600, height: 900, alt: post.coverAlt }]
    : undefined;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: path },
    authors: [{ name: EDITORIAL_TEAM_NAME, url: EDITORIAL_TEAM_URL }],
    creator: EDITORIAL_TEAM_NAME,
    publisher: SITE_NAME,
    keywords: post.tags,
    openGraph: {
      locale: "en_US",
      siteName: SITE_NAME,
      title: post.title,
      description: post.description,
      url: path,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [EDITORIAL_TEAM_URL],
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.cover ? [post.cover] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  // Find up to 3 related posts based on tag overlap, falling back to other recent posts
  const relatedPosts = allPosts
    .filter((p) => p.slug !== post.slug)
    .map((p) => {
      const sharedTags =
        p.tags?.filter((t) => post.tags?.includes(t)).length ?? 0;
      return { post: p, relevance: sharedTags };
    })
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3)
    .map((item) => item.post);

  const pageUrl = `${SITE_URL}/blog/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
        image: post.cover ? `${SITE_URL}${post.cover}` : undefined,
        inLanguage: "en-US",
        isAccessibleForFree: true,
        author: {
          "@type": "Organization",
          "@id": `${EDITORIAL_TEAM_URL}#editorial-team`,
          name: EDITORIAL_TEAM_NAME,
          url: EDITORIAL_TEAM_URL,
        },
        publisher: {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: SITE_NAME,
          url: SITE_URL,
        },
        mainEntityOfPage: pageUrl,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Guides",
            item: `${SITE_URL}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: pageUrl,
          },
        ],
      },
    ],
  };

  return (
    <ContentPage>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <ContentEyebrow>
        <Link href="/blog" className="hover:underline">
          Guides
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        {post.tags?.[0] ?? "SEO"}
      </ContentEyebrow>
      <ContentTitle>{post.title}</ContentTitle>
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        <span>
          By{" "}
          <Link
            href="/about"
            rel="author"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            {EDITORIAL_TEAM_NAME}
          </Link>
        </span>
        <span aria-hidden>·</span>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span aria-hidden>·</span>
        <span>{post.readingMinutes} min read</span>
        {post.updated ? (
          <>
            <span aria-hidden>·</span>
            <span>Updated {formatDate(post.updated)}</span>
          </>
        ) : null}
      </div>

      {post.excerpt ? (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-teal-800/20 bg-teal-950/[0.035] p-4 text-sm leading-relaxed text-slate-700 dark:border-teal-400/20 dark:bg-teal-400/[0.04] dark:text-slate-200">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-teal-700 dark:text-teal-300" />
          <div>
            <strong className="font-semibold text-slate-900 dark:text-slate-100">
              Key Takeaway:{" "}
            </strong>
            {post.excerpt}
          </div>
        </div>
      ) : null}

      <p className="mt-5 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
        {post.description}
      </p>

      {post.cover ? (
        <figure className="mt-8 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
          <Image
            src={post.cover}
            alt={post.coverAlt ?? post.title}
            width={1600}
            height={900}
            className="h-auto w-full object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 720px"
          />
        </figure>
      ) : null}

      <article className="mt-10">
        <BlogMarkdown content={post.content} />
      </article>

      <EditorialTrustBox
        readingMinutes={post.readingMinutes}
        tags={post.tags}
        lastUpdated={post.updated ? formatDate(post.updated) : formatDate(post.date)}
      />

      {relatedPosts.length > 0 ? (
        <section className="mt-14 border-t border-slate-200 pt-10 dark:border-slate-700">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800 dark:text-teal-300">
            Topic cluster
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Related Technical Guides
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-[color:var(--surface)] p-4 transition-[border-color,background-color] hover:border-teal-700/40 hover:bg-teal-800/[0.02] dark:border-slate-800 dark:hover:border-teal-400/30 dark:hover:bg-teal-400/[0.04]"
              >
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                    {related.readingMinutes} min read
                  </div>
                  <h3 className="mt-1.5 font-display text-sm font-semibold text-slate-900 group-hover:text-teal-800 dark:text-slate-50 dark:group-hover:text-teal-300">
                    {related.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {related.excerpt ?? related.description}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-teal-800 dark:text-teal-300">
                  Read guide
                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-700">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Run the related checks for free —{" "}
          <Link
            href="/tools"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            tools hub
          </Link>
          {" · "}
          <Link
            href="/#home-audit-url"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            full technical audit
          </Link>
          {" · "}
          <Link
            href="/blog"
            className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            browse all guides
          </Link>
          .
        </p>
      </div>
    </ContentPage>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}
