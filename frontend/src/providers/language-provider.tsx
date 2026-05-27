"use client";

import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/providers/auth-provider";
import "@/lib/i18n";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    const locale = user?.locale || sessionStorage.getItem("locale") || "en";
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
