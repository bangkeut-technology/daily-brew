"use client";

import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import commonEn from "@/locales/en/common.json";
import commonFr from "@/locales/fr/common.json";
import commonKm from "@/locales/km/common.json";

export const defaultNS = "common";

const resources = {
  en: { common: commonEn },
  fr: { common: commonFr },
  km: { common: commonKm },
};

function initialLocale(): string {
  if (typeof window === "undefined") return "en";
  return sessionStorage.getItem("locale") || "en";
}

if (!i18next.isInitialized) {
  void i18next.use(initReactI18next).init({
    resources,
    defaultNS,
    lng: initialLocale(),
    fallbackLng: "en",
    supportedLngs: ["en", "fr", "km"],
    ns: ["common"],
    interpolation: { escapeValue: false },
  });
}

export default i18next;
