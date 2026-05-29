/**
 * Blog post registry for the legacy SPA. Source of truth for the index
 * (assets/src/routes/blog/index.tsx) and the dynamic post route
 * (assets/src/routes/blog/$slug.tsx). Each entry must have a matching
 * TSX body under `./routes/blog/posts/<slug>.tsx` mapped in $slug.tsx.
 *
 * Mirrors the Next.js side at frontend/src/lib/blog.ts. Keep them in sync
 * until the Phase 6 cutover retires the SPA.
 */
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  tags?: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'three-factor-attendance',
    title: 'Three-factor attendance: how modern login security came to the time clock',
    description:
      "Your email doesn't trust your password alone. Here's why device, network, and a physical tap make buddy punching mechanically impossible — without a single biometric.",
    date: '2026-05-27',
    tags: ['three-factor', 'buddy-punching', 'narrative'],
  },
];
