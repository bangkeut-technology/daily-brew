import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides on stopping buddy punching, NFC and QR clock-in, IP verification, and honest timesheets for cafés and small shops.",
  alternates: { canonical: "/blog" },
};

const dateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Blog", path: "/blog" }])} />
      <header className="mb-10">
        <h1 className="font-serif text-4xl font-semibold text-text-primary">Blog</h1>
        <p className="mt-3 text-text-secondary">
          Honest timesheets for cafés and small shops — buddy punching, NFC and QR clock-in,
          and verification done without biometrics or GPS.
        </p>
      </header>

      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="glass-card block p-6 no-underline transition-transform"
            >
              <time className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                {dateFormat.format(new Date(post.date))}
              </time>
              <h2 className="mt-2 font-serif text-xl font-semibold text-text-primary">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-text-secondary">{post.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
