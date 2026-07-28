import { defineRouting } from "next-intl/routing";

export const LOCALES = ["en", "fr", "km"] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * Marketing routes are localized by URL prefix — `/how-it-works`,
 * `/fr/how-it-works`, `/km/how-it-works` — so each language is separately
 * indexable and can carry hreflang. The SPA's client-only, sessionStorage
 * locale has no URL to point a crawler at; this replaces it for the public
 * pages (see decision 6 in docs/nextjs-migration-plan.md).
 *
 * `localePrefix: "as-needed"` keeps English on the bare paths, so every
 * existing marketing URL stays exactly where it is and no redirects are owed.
 */
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: "en",
  localePrefix: "as-needed",
  // Language is an explicit choice here, not a guess: auto-redirecting a
  // French browser away from a link someone shared makes shared URLs
  // unreliable, and the switcher is always one click away.
  localeDetection: false,
});

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
