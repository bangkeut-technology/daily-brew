import type { MetadataRoute } from "next";
import { PAGES, SITE_URL, type IndexablePath } from "@/lib/seo";
import { LOCALES } from "@/i18n/routing";
import { getAllPosts } from "@/lib/blog";
import { INDUSTRIES } from "@/lib/industries";
import { COMPETITORS } from "@/lib/competitors";

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

/** `/x` for English, `/fr/x` and `/km/x` for the rest. */
function localizedUrl(path: string, locale: string): string {
  if (locale === "en") return `${SITE_URL}${path}`;
  return `${SITE_URL}/${locale}${path === "/" ? "" : path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Marketing pages are indexable in all three languages. Each entry declares
  // its siblings so crawlers group the variants instead of treating them as
  // duplicates — the sitemap counterpart to the hreflang tags in the metadata.
  const pages = (Object.keys(PAGES) as IndexablePath[]).flatMap((path) => {
    const hint = HINTS[path] ?? { changeFrequency: "monthly" as Freq, priority: 0.6 };
    const languages = Object.fromEntries(
      LOCALES.map((locale) => [locale, localizedUrl(path, locale)]),
    );

    return LOCALES.map((locale) => ({
      url: localizedUrl(path, locale),
      changeFrequency: hint.changeFrequency,
      // Translations rank below the English original rather than competing
      // with it for the same query.
      priority: locale === "en" ? hint.priority : Math.max(0.1, hint.priority - 0.2),
      alternates: { languages },
    }));
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

  const industries = INDUSTRIES.map((industry) => ({
    url: `${SITE_URL}/${industry.slug}`,
    changeFrequency: "monthly" as Freq,
    priority: 0.7,
  }));

  const competitors = COMPETITORS.map((competitor) => ({
    url: `${SITE_URL}/${competitor.slug}`,
    changeFrequency: "monthly" as Freq,
    priority: 0.6,
  }));

  return [...pages, ...industries, ...competitors, blogIndex, ...posts];
}
