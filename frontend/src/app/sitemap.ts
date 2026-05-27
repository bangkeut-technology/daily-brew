import type { MetadataRoute } from "next";
import { PAGES, SITE_URL, type IndexablePath } from "@/lib/seo";
import { getAllPosts } from "@/lib/blog";

type Freq = MetadataRoute.Sitemap[number]["changeFrequency"];

// Per-path crawl hints; anything unlisted falls back to monthly / 0.6.
const HINTS: Partial<Record<IndexablePath, { changeFrequency: Freq; priority: number }>> = {
  "/": { changeFrequency: "weekly", priority: 1.0 },
  "/features": { changeFrequency: "monthly", priority: 0.9 },
  "/how-it-works": { changeFrequency: "monthly", priority: 0.9 },
  "/pricing": { changeFrequency: "monthly", priority: 0.9 },
  "/demo": { changeFrequency: "monthly", priority: 0.8 },
  "/roles": { changeFrequency: "monthly", priority: 0.8 },
  "/guides": { changeFrequency: "monthly", priority: 0.8 },
  "/sign-up": { changeFrequency: "monthly", priority: 0.8 },
  "/sign-in": { changeFrequency: "monthly", priority: 0.5 },
  "/privacy": { changeFrequency: "monthly", priority: 0.4 },
  "/terms": { changeFrequency: "monthly", priority: 0.4 },
  "/refund": { changeFrequency: "monthly", priority: 0.4 },
  "/delete-account": { changeFrequency: "yearly", priority: 0.3 },
};

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = (Object.keys(PAGES) as IndexablePath[]).map((path) => {
    const hint = HINTS[path] ?? { changeFrequency: "monthly" as Freq, priority: 0.6 };
    return {
      url: `${SITE_URL}${path}`,
      changeFrequency: hint.changeFrequency,
      priority: hint.priority,
    };
  });

  const blogIndex = {
    url: `${SITE_URL}/blog`,
    changeFrequency: "weekly" as Freq,
    priority: 0.7,
  };

  const posts = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: "monthly" as Freq,
    priority: 0.6,
  }));

  return [...pages, blogIndex, ...posts];
}
