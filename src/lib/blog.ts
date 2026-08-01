import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export type BlogFrontmatter = {
  title: string;
  description: string;
  date: string;
  updated?: string;
  tags?: string[];
  /** Short card blurb; falls back to description */
  excerpt?: string;
};

export type BlogPostMeta = BlogFrontmatter & {
  slug: string;
  readingMinutes: number;
};

export type BlogPost = BlogPostMeta & {
  content: string;
};

function readingMinutesFrom(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(4, Math.round(words / 220));
}

function assertFrontmatter(
  data: Record<string, unknown>,
  slug: string
): BlogFrontmatter {
  const title = typeof data.title === "string" ? data.title : null;
  const description =
    typeof data.description === "string" ? data.description : null;
  const date = typeof data.date === "string" ? data.date : null;
  if (!title || !description || !date) {
    throw new Error(`Blog post ${slug} is missing title/description/date`);
  }
  return {
    title,
    description,
    date,
    updated: typeof data.updated === "string" ? data.updated : undefined,
    tags: Array.isArray(data.tags)
      ? data.tags.filter((t): t is string => typeof t === "string")
      : undefined,
    excerpt: typeof data.excerpt === "string" ? data.excerpt : undefined,
  };
}

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  const posts = files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const fm = assertFrontmatter(data as Record<string, unknown>, slug);
    return {
      ...fm,
      slug,
      readingMinutes: readingMinutesFrom(content),
    };
  });
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): BlogPost | null {
  const file = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const fm = assertFrontmatter(data as Record<string, unknown>, slug);
  return {
    ...fm,
    slug,
    content,
    readingMinutes: readingMinutesFrom(content),
  };
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}
