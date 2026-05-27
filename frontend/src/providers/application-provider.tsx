"use client";

import React from "react";

export interface ApplicationConfig {
  maxFreeEmployees: number;
  contactEmail: string;
  googleClientId: string;
  appleClientId: string;
  telegramBotUsername: string;
  gaMeasurementId: string;
}

const DEFAULTS: ApplicationConfig = {
  maxFreeEmployees: Number(process.env.NEXT_PUBLIC_MAX_FREE_EMPLOYEES ?? 10),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@mail.dailybrew.work",
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
  appleClientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID ?? "",
  telegramBotUsername: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "",
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
};

const ApplicationContext = React.createContext<ApplicationConfig>(DEFAULTS);

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  return <ApplicationContext.Provider value={DEFAULTS}>{children}</ApplicationContext.Provider>;
}

export function useApplication(): ApplicationConfig {
  return React.useContext(ApplicationContext);
}
