"use client";

import { Sun, Moon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";

/**
 * Icon-only theme toggle for the top bar. The labelled version lives on the
 * profile page — this variant is just a 36×36 hit area.
 */
export function ThemeToggleIcon() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? t("theme.light", "Light mode") : t("theme.dark", "Dark mode");

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-text-secondary transition-colors hover:bg-cream-3/40 hover:text-text-primary"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
