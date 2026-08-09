import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

const components: Components = {
  h2: ({ children }) => (
    <h2 className="mt-12 scroll-mt-24 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 scroll-mt-24 font-display text-xl font-semibold text-slate-900 dark:text-slate-50">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mt-4 text-[17px] leading-[1.75] text-slate-700 dark:text-slate-300">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 text-[17px] leading-relaxed text-slate-700 dark:text-slate-300">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-[17px] leading-relaxed text-slate-700 dark:text-slate-300">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-900 dark:text-slate-100">
      {children}
    </strong>
  ),
  a: ({ href, children }) => {
    const url = href ?? "#";
    const external = /^https?:\/\//i.test(url);
    if (external) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-teal-800 underline decoration-teal-700/30 underline-offset-2 hover:decoration-teal-700 dark:text-teal-300"
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={url}
        className="font-semibold text-teal-800 underline decoration-teal-700/30 underline-offset-2 hover:decoration-teal-700 dark:text-teal-300"
      >
        {children}
      </Link>
    );
  },
  code: ({ className, children }) => {
    const isBlock = Boolean(className);
    if (isBlock) {
      return (
        <code className="block overflow-x-auto rounded-md bg-slate-950 px-4 py-3 font-mono text-[13px] leading-relaxed text-slate-100">
          {children}
        </code>
      );
    }
    return (
      <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-slate-800 dark:bg-slate-800 dark:text-slate-100">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mt-5 overflow-x-auto rounded-md border border-slate-800 bg-slate-950 p-0">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-2 border-teal-700/50 pl-4 text-[17px] italic leading-relaxed text-slate-600 dark:border-teal-400/40 dark:text-slate-300">
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr className="my-10 border-slate-200 dark:border-slate-700" />
  ),
  img: ({ src, alt }) => {
    if (!src) return null;
    return (
      // eslint-disable-next-line @next/next/no-img-element -- markdown URLs vary
      <img
        src={src}
        alt={alt || ""}
        className="mt-8 h-auto w-full rounded-xl border border-slate-200 dark:border-slate-700"
        loading="lazy"
      />
    );
  },
  figure: ({ children }) => (
    <figure className="mt-8">{children}</figure>
  ),
  figcaption: ({ children }) => (
    <figcaption className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
      {children}
    </figcaption>
  ),

  table: ({ children }) => (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm text-slate-700 dark:text-slate-300">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-slate-300 px-3 py-2 font-semibold text-slate-900 dark:border-slate-600 dark:text-slate-50">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-slate-200 px-3 py-2 align-top dark:border-slate-700">
      {children}
    </td>
  ),
};

export function BlogMarkdown({ content }: { content: string }) {
  return (
    <div className="blog-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
