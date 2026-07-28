"use client";

import React from "react";

export interface ApplicationConfig {
  maxFreeEmployees: number;
  contactEmail: string;
  googleClientId: string;
  appleClientId: string;
  telegramBotUsername: string;
  gaMeasurementId: string;
  /** 'sandbox' switches Paddle.js to its test environment. */
  paddleEnvironment: string;
  paddleClientSideToken: string;
  paddlePriceIdEspressoMonthly: string;
  paddlePriceIdEspressoAnnual: string;
  paddlePriceIdDoubleEspressoMonthly: string;
  paddlePriceIdDoubleEspressoAnnual: string;
}

const DEFAULTS: ApplicationConfig = {
  maxFreeEmployees: Number(process.env.NEXT_PUBLIC_MAX_FREE_EMPLOYEES ?? 10),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@mail.dailybrew.work",
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
  appleClientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID ?? "",
  telegramBotUsername: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "",
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
  paddleEnvironment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT ?? "production",
  paddleClientSideToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_SIDE_TOKEN ?? "",
  paddlePriceIdEspressoMonthly: process.env.NEXT_PUBLIC_PADDLE_PRICE_ESPRESSO_MONTHLY ?? "",
  paddlePriceIdEspressoAnnual: process.env.NEXT_PUBLIC_PADDLE_PRICE_ESPRESSO_ANNUAL ?? "",
  paddlePriceIdDoubleEspressoMonthly:
    process.env.NEXT_PUBLIC_PADDLE_PRICE_DOUBLE_ESPRESSO_MONTHLY ?? "",
  paddlePriceIdDoubleEspressoAnnual:
    process.env.NEXT_PUBLIC_PADDLE_PRICE_DOUBLE_ESPRESSO_ANNUAL ?? "",
};

const ApplicationContext = React.createContext<ApplicationConfig>(DEFAULTS);

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  return <ApplicationContext.Provider value={DEFAULTS}>{children}</ApplicationContext.Provider>;
}

export function useApplication(): ApplicationConfig {
  return React.useContext(ApplicationContext);
}
