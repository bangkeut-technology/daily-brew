import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { LOCALES, routing } from "@/i18n/routing";
import { HtmlLangSync } from "@/components/HtmlLangSync";

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

  // The provider hands the same catalogue to client components (the landing
  // sections use framer-motion, so several are client-side).
  return (
    <NextIntlClientProvider>
      <HtmlLangSync locale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}
