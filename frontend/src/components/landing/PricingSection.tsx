"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Check, X, Crown, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { BasilBookBrand } from "@/components/shared/BasilBookBrand";

/** Feature `key`s select `pricing.<plan>.features.<key>`; prices stay raw. */
const freeFeatures = [
  { key: "employees10", included: true },
  { key: "qrCheckIn", included: true },
  { key: "shifts", included: true },
  { key: "closures", included: true },
  { key: "dashboard", included: true },
  { key: "log", included: true },
  { key: "darkMode", included: true },
  { key: "multiLang", included: true },
  { key: "leaveRequests", included: false },
  { key: "ipRestriction", included: false },
  { key: "geofencing", included: false },
] as const;

const espressoFeatures = [
  { key: "employees20" },
  { key: "everythingFree" },
  { key: "leaveRequests" },
  { key: "ipRestriction" },
  { key: "deviceVerification" },
  { key: "geofencing" },
  { key: "perDaySchedules" },
  { key: "manager" },
  // The only entry whose copy embeds the brand wordmark.
  { key: "basilbook", brand: true },
  { key: "notifications" },
  { key: "dailySummary" },
  { key: "trial14" },
] as const;

/**
 * Every listed feature is live — sub-QR stations, per-QR settings and per-QR
 * assignment all shipped (see /console/qr-codes). They were previously flagged
 * "Roadmap" here, which told buyers a shipped plan benefit didn't exist yet.
 */
const doubleEspressoFeatures = [
  { key: "unlimitedEmployees" },
  { key: "everythingEspresso" },
  { key: "unlimitedManagers" },
  { key: "prioritySupport" },
  { key: "multipleQrStations" },
  { key: "perQrGeofence" },
  { key: "perQrAssignment" },
  { key: "perQrManager" },
] as const;

const PRICES = {
  free: "$0",
  espresso: {
    monthly: { price: "$19.99", periodKey: "month" },
    yearly: { price: "$199", periodKey: "year", perMonth: "$16.58" },
  },
  doubleEspresso: {
    monthly: { price: "$39.99", periodKey: "month" },
    yearly: { price: "$399", periodKey: "year", perMonth: "$33.25" },
  },
} as const;

export function PricingSection() {
  const t = useTranslations("pricing");
  const [yearly, setYearly] = useState(true);
  const espressoPricing = yearly ? PRICES.espresso.yearly : PRICES.espresso.monthly;
  const doublePricing = yearly ? PRICES.doubleEspresso.yearly : PRICES.doubleEspresso.monthly;

  return (
    <section id="pricing" className="mx-auto max-w-5xl px-6 py-24 md:px-8">
      <motion.div
        className="mb-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="mb-3 text-[13px] font-medium uppercase tracking-[2px] text-amber">{t("eyebrow")}</p>
        <h3 className="font-serif text-[30px] font-semibold leading-tight text-text-primary md:text-[36px]">
          {t("title")}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-[16px] text-text-secondary">
          {t("subtitle")}
        </p>
      </motion.div>

      <motion.div
        className="mb-12 flex items-center justify-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="relative flex rounded-full bg-cream-3/70 p-0.5">
          <div
            className="absolute bottom-0.5 top-0.5 w-[calc(50%-2px)] rounded-full bg-coffee shadow-sm transition-all duration-300 ease-in-out"
            style={{ left: yearly ? "calc(50% + 2px)" : "2px" }}
          />
          <button
            type="button"
            onClick={() => setYearly(false)}
            className={cn(
              "relative z-10 cursor-pointer rounded-full border-none bg-transparent px-5 py-1.5 text-[15px] font-medium transition-colors duration-300",
              !yearly ? "text-white" : "text-text-secondary",
            )}
          >
            {t("toggle.monthly")}
          </button>
          <button
            type="button"
            onClick={() => setYearly(true)}
            className={cn(
              "relative z-10 cursor-pointer rounded-full border-none bg-transparent px-5 py-1.5 text-[15px] font-medium transition-colors duration-300",
              yearly ? "text-white" : "text-text-secondary",
            )}
          >
            {t("toggle.yearly")}
          </button>
        </div>
        {yearly ? (
          <motion.span
            className="rounded-full bg-green/10 px-2.5 py-0.5 text-[12.5px] font-semibold text-green"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {t("toggle.yearlyBadge")}
          </motion.span>
        ) : (
          <motion.button
            type="button"
            onClick={() => setYearly(true)}
            className="cursor-pointer border-none bg-transparent text-[13px] font-medium text-amber hover:underline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Switch to yearly and save
          </motion.button>
        )}
      </motion.div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {/* Free plan */}
        <motion.div
          className="relative flex flex-col overflow-hidden rounded-2xl border border-glass-border bg-glass-bg p-7 shadow-[0_2px_12px_rgba(107,66,38,0.05)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p className="mb-1 text-[16px] font-semibold text-text-primary">{t("free.name")}</p>
          <div className="mb-1 flex items-baseline gap-1">
            <span className="text-[42px] font-bold tracking-tight text-text-primary">{PRICES.free}</span>
            <span className="text-[15px] text-text-tertiary">{t("free.period")}</span>
          </div>
          <p className="mb-7 text-[14.5px] text-text-secondary">{t("free.subtitle")}</p>

          <ul className="mb-8 flex-1 space-y-3">
            {freeFeatures.map((f) => (
              <li key={f.key} className="flex items-center gap-2.5">
                {f.included ? (
                  <Check size={15} className="shrink-0 text-green" strokeWidth={2.5} />
                ) : (
                  <X size={15} className="shrink-0 text-text-tertiary/50" strokeWidth={2} />
                )}
                <span className={cn("text-[15px]", f.included ? "text-text-secondary" : "text-text-tertiary")}>
                  {t(`free.features.${f.key}`)}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href="/sign-up"
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-cream-3 bg-glass-bg px-4 py-3 text-[15px] font-medium text-text-primary no-underline backdrop-blur-sm transition-all duration-150 hover:bg-cream-3"
          >
            {t("free.cta")}
          </Link>
        </motion.div>

        {/* Espresso plan */}
        <motion.div
          className="group relative flex flex-col overflow-visible rounded-2xl border border-glass-border bg-glass-bg p-7 pt-10 shadow-[0_2px_12px_rgba(107,66,38,0.05)] ring-2 ring-amber/25 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(193,127,59,0.15)]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
            <span className="rounded-full bg-amber px-3.5 py-1 text-[12px] font-semibold uppercase tracking-wider text-white shadow-[0_2px_8px_rgba(193,127,59,0.3)]">
              {t("espresso.mostPopular")}
            </span>
          </div>
          <div className="absolute left-0 right-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-amber-light via-amber to-coffee opacity-80" />

          <div className="relative mb-1 flex items-center gap-2">
            <p className="text-[16px] font-semibold text-text-primary">{t("espresso.name")}</p>
            <Crown size={14} className="text-amber" />
          </div>
          <div className="relative mb-1 flex items-baseline gap-1">
            <span className="text-[42px] font-bold tracking-tight text-text-primary">{espressoPricing.price}</span>
            <span className="text-[15px] text-text-tertiary">{t(`period.${espressoPricing.periodKey}`)}</span>
          </div>
          {yearly && (
            <p className="relative mb-3 text-[13.5px] font-medium text-green">
              {t("espresso.perMonthHint", { price: PRICES.espresso.yearly.perMonth })}
            </p>
          )}
          <p className="relative mb-7 text-[14.5px] text-text-secondary">{t("espresso.subtitle")}</p>

          <ul className="relative mb-8 flex-1 space-y-3">
            {espressoFeatures.map((f) => (
              <li key={f.key} className="flex items-center gap-2.5">
                <Check size={15} className="shrink-0 text-green" strokeWidth={2.5} />
                <span className="text-[15px] text-text-secondary">
                  {"brand" in f
                    ? t.rich(`espresso.features.${f.key}`, {
                        brand: () => <BasilBookBrand className="text-[15px]" />,
                      })
                    : t(`espresso.features.${f.key}`)}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href="/sign-up"
            className="btn-shimmer relative flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none px-4 py-3 text-[15px] font-semibold text-white no-underline transition-all duration-150 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)]"
          >
            {t("espresso.cta")}
            <ChevronRight size={14} />
          </Link>
        </motion.div>

        {/* Double Espresso plan */}
        <motion.div
          className="relative flex flex-col overflow-visible rounded-2xl border border-glass-border bg-glass-bg p-7 pt-10 shadow-[0_2px_12px_rgba(107,66,38,0.05)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
            <span className="rounded-full bg-text-tertiary px-3.5 py-1 text-[12px] font-semibold uppercase tracking-wider text-white shadow-[0_2px_8px_rgba(174,157,149,0.3)]">
              {t("doubleEspresso.comingSoon")}
            </span>
          </div>
          <div className="absolute left-0 right-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-coffee via-coffee-light to-amber opacity-60" />

          <div className="relative mb-1 flex items-center gap-2">
            <p className="text-[16px] font-semibold text-text-primary">{t("doubleEspresso.name")}</p>
            <Crown size={14} className="text-coffee" />
          </div>
          <div className="relative mb-1 flex items-baseline gap-1">
            <span className="text-[42px] font-bold tracking-tight text-text-primary">{doublePricing.price}</span>
            <span className="text-[15px] text-text-tertiary">{t(`period.${doublePricing.periodKey}`)}</span>
          </div>
          {yearly && (
            <p className="relative mb-3 text-[13.5px] font-medium text-green">
              {t("doubleEspresso.perMonthHint", { price: PRICES.doubleEspresso.yearly.perMonth })}
            </p>
          )}
          <p className="relative mb-7 text-[14.5px] text-text-secondary">{t("doubleEspresso.subtitle")}</p>

          <ul className="relative mb-8 flex-1 space-y-3">
            {doubleEspressoFeatures.map((f) => (
              <li key={f.key} className="flex items-center gap-2.5">
                <Check size={15} className="shrink-0 text-green" strokeWidth={2.5} />
                <span className="text-[15px] text-text-secondary">
                  {t(`doubleEspresso.features.${f.key}`)}
                </span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            disabled
            className="relative flex cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border border-cream-3 bg-cream-3/60 px-4 py-3 text-[15px] font-medium text-text-tertiary no-underline"
          >
            Coming soon
          </button>
        </motion.div>
      </div>

      <motion.p
        className="mt-8 text-center text-[14px] text-text-tertiary"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {t("footnote")}
      </motion.p>
    </section>
  );
}
