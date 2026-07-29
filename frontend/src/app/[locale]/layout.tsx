import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { LOCALES, routing } from "@/i18n/routing";
import { HtmlLangSync } from "@/components/HtmlLangSync";

/**
 * The namespaces the public pages actually read.
 *
 * The catalogue is shared with the console, and the console's half is the
 * larger one — handing the whole file to the client provider inlines it into
 * every prerendered marketing page, so a landing page ships ~2× the HTML for
 * strings no signed-out visitor can reach. Keep this list in step with the
 * `useTranslations` calls under `(marketing)` and `components/landing`.
 */
const MARKETING_NAMESPACES = [
  "faq",
  "features",
  "guides",
  "homepage",
  "marketing",
  "playbooks",
  "pricing",
  "routes",
] as const;

/**
 * Locale segment for the public marketing pages.
 *
 * Enumerating the locales here is what keeps every marketing route statically
 * generated — without it the `[locale]` param would force them to render on
 * demand, which is the one thing the cutover plan wants to avoid for SEO.
 */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Opts this subtree into static rendering; without it any `useTranslations`
  // below would mark the route dynamic.
  setRequestLocale(locale);

  // Client components need their strings serialized into the payload (the
  // landing sections use framer-motion, so several are client-side) — but only
  // the marketing slice of the catalogue. Server components still resolve
  // against the full set via `getTranslations`/`useTranslations`.
  const all = await getMessages();
  const messages = Object.fromEntries(
    MARKETING_NAMESPACES.filter((ns) => ns in all).map((ns) => [ns, all[ns]]),
  );

  return (
    <NextIntlClientProvider messages={messages}>
      <HtmlLangSync locale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}
