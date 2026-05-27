import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

/**
 * Global styling for MDX blog content. Server Components by default.
 * Keeps the warm-cafe look: serif headings, coffee links, readable body.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => (
      <h1 className="mt-2 mb-6 font-serif text-4xl font-semibold text-text-primary" {...props} />
    ),
    h2: (props) => (
      <h2 className="mt-10 mb-4 font-serif text-2xl font-semibold text-text-primary" {...props} />
    ),
    h3: (props) => (
      <h3 className="mt-8 mb-3 font-serif text-xl font-semibold text-text-primary" {...props} />
    ),
    p: (props) => <p className="my-4 leading-7 text-text-secondary" {...props} />,
    ul: (props) => <ul className="my-4 list-disc space-y-2 pl-6 text-text-secondary" {...props} />,
    ol: (props) => <ol className="my-4 list-decimal space-y-2 pl-6 text-text-secondary" {...props} />,
    li: (props) => <li className="leading-7" {...props} />,
    strong: (props) => <strong className="font-semibold text-text-primary" {...props} />,
    blockquote: (props) => (
      <blockquote
        className="my-6 border-l-4 border-coffee/40 bg-cream-2 py-2 pl-4 text-text-secondary italic"
        {...props}
      />
    ),
    a: ({ href = "#", ...props }: ComponentPropsWithoutRef<"a">) => {
      const isInternal = href.startsWith("/");
      const className = "font-medium text-coffee underline underline-offset-2 hover:opacity-80";
      return isInternal ? (
        <Link href={href} className={className} {...props} />
      ) : (
        <a href={href} className={className} {...props} />
      );
    },
    hr: () => <hr className="my-8 border-cream-3" />,
    ...components,
  };
}
