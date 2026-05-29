import { SITE_URL } from "@/lib/seo";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** Optional tags for internal-linking / filtering. */
  tags?: string[];
}

/**
 * Blog post registry — the source of truth for the index and sitemap.
 * Each entry has a matching `app/blog/<slug>/page.mdx` holding the body.
 * Add a post: create the MDX file + append an entry here.
 *
 * Roadmap (docs/nextjs-migration-plan.md → SEO strategy §6): 12 anchor posts.
 */
export const POSTS: BlogPost[] = [
  {
    slug: "three-factor-attendance",
    title: "Three-factor attendance: how modern login security came to the time clock",
    description:
      "Your email doesn't trust your password alone. Here's why device, network, and a physical tap make buddy punching mechanically impossible — without a single biometric.",
    date: "2026-05-27",
    tags: ["three-factor", "buddy-punching", "narrative"],
  },
];

export function getAllPosts(): BlogPost[] {
  return [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function postUrl(slug: string): string {
  return `${SITE_URL}/blog/${slug}`;
}
