"use client";

import { useEffect } from "react";

/**
 * Corrects `<html lang>` on the localized marketing routes.
 *
 * The root layout can't do this itself: reading the locale there (via
 * `getLocale()`) makes the whole tree dynamic, which drops every route —
 * including `/admin` and `/blog` — out of static generation. And splitting
 * into multiple root layouts would force a full page reload on every
 * marketing → console navigation, which is the main conversion path.
 *
 * So the served HTML carries `lang="en"` and this corrects it on hydration.
 * Screen readers and browser translation read the live DOM, so they get the
 * right value; crawlers get the language from the `hreflang` alternates in
 * the page metadata, which is the signal that actually matters for indexing.
 */
export function HtmlLangSync({ locale }: { locale: string }) {
  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = locale;
    return () => {
      document.documentElement.lang = previous;
    };
  }, [locale]);

  return null;
}
