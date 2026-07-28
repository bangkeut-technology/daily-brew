"use client";

import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOCALES, type Locale } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

const LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  km: "ខ្មែរ",
};

/**
 * Language switcher for the marketing pages.
 *
 * Unlike the console's switcher — which flips a client-side i18next
 * instance — this one *navigates*, because the marketing locale lives in the
 * URL. Switching on `/fr/pricing` takes you to `/pricing`, so the address bar
 * always matches what's on screen and the page stays shareable.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const active = useLocale() as Locale;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Globe size={14} className="shrink-0 text-text-tertiary" aria-hidden />
      <div role="group" aria-label="Language" className="flex items-center gap-0.5">
        {LOCALES.map((locale) => (
          <button
            key={locale}
            type="button"
            lang={locale}
            aria-current={locale === active ? "true" : undefined}
            title={LABELS[locale]}
            onClick={() =>
              // `usePathname` here is already locale-stripped and has dynamic
              // segments resolved (`/restaurants`, not `/[slug]`), so replacing
              // with a different locale keeps you on the same page.
              router.replace(pathname, { locale })
            }
            className={cn(
              "rounded px-1.5 py-0.5 text-[13px] font-medium uppercase transition-colors",
              locale === active
                ? "text-coffee"
                : "text-text-tertiary hover:text-text-secondary",
            )}
          >
            {locale}
          </button>
        ))}
      </div>
    </div>
  );
}
