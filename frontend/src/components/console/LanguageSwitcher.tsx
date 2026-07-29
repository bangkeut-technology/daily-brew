"use client";

import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/providers/language-provider";
import { CustomSelect, type SelectOption } from "@/components/shared/CustomSelect";
import { cn } from "@/lib/utils";

/**
 * Three supported locales. Labels stay in each language's *own* script — a
 * French user looking at a Khmer console must still be able to spot "Français".
 * Translating the labels into the active locale would defeat that.
 */
const LANGUAGES: SelectOption[] = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "km", label: "ភាសាខ្មែរ" },
];

const FALLBACK: SelectOption = LANGUAGES[0];

/**
 * Compact language picker for the console top bar, wired to {@link useLanguage}.
 *
 * The marketing pages switch language by URL (`/fr/pricing`); the console is
 * behind auth and client-rendered, so it switches in place and persists the
 * choice to sessionStorage instead.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  // i18next can briefly emit a BCP-47 tag with a region (e.g. "en-US"); fall
  // back to the language part before claiming we don't recognise it.
  const base = (locale ?? "en").split("-")[0];
  const active = LANGUAGES.find((l) => l.value === base) ?? FALLBACK;

  return (
    // Width lives on the wrapper so CustomSelect's portaled menu (which copies
    // the trigger's measured width) lines up under it.
    <div className={cn("w-[130px]", className)}>
      <CustomSelect
        value={active.value}
        onChange={changeLanguage}
        options={LANGUAGES}
        renderSelected={(opt) => (
          <span className="flex min-w-0 items-center gap-1.5">
            <Globe size={13} className="shrink-0 text-text-tertiary" aria-hidden />
            <span
              className="truncate"
              aria-label={t("common.languageSwitcher.ariaLabel", "Language")}
            >
              {opt.label}
            </span>
          </span>
        )}
      />
    </div>
  );
}
