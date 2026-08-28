import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogMarkdown } from "@/components/blog/blog-markdown";
import {
  ContentEyebrow,
  ContentPage,
  ContentTitle,
} from "@/components/layout/content-page";
import { getAllSlugs, getPost } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/audit/types";

type Props = { params: Promise<{ slug: string }> };

const EDITORIAL_TEAM_NAME = "TheSeoSoul editorial team";
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

  const pageUrl = `${SITE_URL}/blog/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
        image: post.cover ? `${SITE_URL}${post.cover}` : undefined,
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

      <div className="mt-14 border-t border-slate-200 pt-8 dark:border-slate-700">
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
            more guides
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
