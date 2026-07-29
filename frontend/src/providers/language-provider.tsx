"use client";

import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/providers/auth-provider";
import "@/lib/i18n";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    // An explicit choice (the top bar's LanguageSwitcher → sessionStorage)
    // wins over the profile-stored locale. The other order looks equivalent
    // but isn't: switching language after sign-in would silently snap back to
    // the profile default on this provider's next render.
    const locale = sessionStorage.getItem("locale") || user?.locale || "en";
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
    sessionStorage.setItem("locale", locale);
  }, [user, i18n]);

  return <>{children}</>;
}

export function useLanguage() {
  const { i18n } = useTranslation();

  const changeLanguage = useCallback(
    (locale: string) => {
      void i18n.changeLanguage(locale);
      sessionStorage.setItem("locale", locale);
    },
    [i18n],
  );

  return { locale: i18n.language, changeLanguage };
}
