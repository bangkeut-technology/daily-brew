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
    slug: 'live-checkin-alerts-on-telegram',
    title: 'Live check-in alerts: a Telegram toggle for owners who want every clock-in',
    description:
      "Turn on a single setting and DailyBrew sends a Telegram ping the moment any staff member clocks in or out. Espresso+ feature, off by default — the noise profile is intentional.",
    date: '2026-05-29',
    tags: ['telegram', 'notifications', 'feature'],
  },
  {
    slug: 'the-new-device-alert',
    title: 'The new-device alert: when a check-in looks fine but isn\'t',
    description:
      "DailyBrew pings the owner the moment a staff member clocks in from a phone they've never used before. Here's why first-time-on-this-device is the right trigger — and what to do when an alert lands.",
    date: '2026-05-29',
    tags: ['anomaly-detection', 'feature', 'narrative'],
  },
  {
    slug: 'the-buddy-punching-tax',
    title: 'The buddy punching tax: what time theft really costs a small café',
    description:
      "Nucleus Research pegs buddy punching at 2.2% of payroll, and 75% of businesses are affected. Here's what that looks like on a 5-person café budget — and why face recognition and GPS aren't the right fix.",
    date: '2026-05-29',
    tags: ['buddy-punching', 'cost', 'small-business'],
  },
  {
    slug: 'three-factor-attendance',
    title: 'Three-factor attendance: how modern login security came to the time clock',
    description:
      "Your email doesn't trust your password alone. Here's why device, network, and a physical tap make buddy punching mechanically impossible — without a single biometric.",
    date: '2026-05-27',
    tags: ['three-factor', 'buddy-punching', 'narrative'],
  },
];
