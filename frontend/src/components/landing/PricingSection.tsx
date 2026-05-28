"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Check, X, Crown, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { BasilBookBrand } from "@/components/shared/BasilBookBrand";

const freePlan = {
  name: "Free",
  price: "$0",
  period: "forever",
  subtitle: "For small teams getting started",
  features: [
    { text: "Up to 10 employees", included: true },
    { text: "Workspace QR code check-in", included: true },
    { text: "Shift management", included: true },
    { text: "Closure periods", included: true },
    { text: "Owner & employee dashboard", included: true },
    { text: "Attendance log", included: true },
    { text: "Dark mode", included: true },
    { text: "Multi-language (EN/FR/KM)", included: true },
    { text: "Leave requests", included: false },
    { text: "IP restriction", included: false },
    { text: "Geofencing", included: false },
  ] as { text: string; included: boolean }[],
};

const espressoPlan = {
  name: "Espresso",
  monthly: { price: "$14.99", period: "/month" },
  yearly: { price: "$149", period: "/year", savings: "Save $30.88", monthly: "$12.42" },
  subtitle: "For growing restaurants",
  features: [
    { text: "Up to 20 employees" },
    { text: "Everything in Free" },
    { text: "Leave request management" },
    { text: "IP restriction for check-in & out" },
    { text: "Device verification for check-in & out" },
    { text: "Geofencing for check-in & out" },
    { text: "Per-day shift schedules" },
    { text: "Manager role with granular permissions (up to 2)" },
    {
      text: (
        <>
          <BasilBookBrand className="text-[15px]" /> integration + API
        </>
      ),
    },
    { text: "Push & email notifications" },
    { text: "Daily attendance summary" },
    { text: "14-day free trial" },
  ] as { text: ReactNode }[],
};

const doubleEspressoPlan = {
  name: "Double Espresso",
  monthly: { price: "$39.99", period: "/month" },
  yearly: { price: "$399", period: "/year", savings: "Save $80.88", monthly: "$33.25" },
  subtitle: "For large operations",
  features: [
    { text: "Unlimited employees", roadmap: false },
    { text: "Everything in Espresso", roadmap: false },
    { text: "Unlimited managers", roadmap: false },
    { text: "Priority support", roadmap: false },
    { text: "Multiple QR stations", roadmap: true },
    { text: "Per-QR geofence & settings", roadmap: true },
    { text: "Employee assignment per QR", roadmap: true },
    { text: "Per-QR manager assignment", roadmap: true },
    { text: "White-label branding", roadmap: true },
  ] as { text: string; roadmap: boolean }[],
};

export function PricingSection() {
  const [yearly, setYearly] = useState(true);
  const espressoPricing = yearly ? espressoPlan.yearly : espressoPlan.monthly;
  const doublePricing = yearly ? doubleEspressoPlan.yearly : doubleEspressoPlan.monthly;

  return (
    <section id="pricing" className="mx-auto max-w-5xl px-6 py-24 md:px-8">
      <motion.div
        className="mb-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="mb-3 text-[13px] font-medium uppercase tracking-[2px] text-amber">Pricing</p>
        <h3 className="font-serif text-[30px] font-semibold leading-tight text-text-primary md:text-[36px]">
          Simple, transparent pricing
        </h3>
        <p className="mx-auto mt-3 max-w-md text-[16px] text-text-secondary">
          Start free. Upgrade when you need more.
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
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setYearly(true)}
            className={cn(
              "relative z-10 cursor-pointer rounded-full border-none bg-transparent px-5 py-1.5 text-[15px] font-medium transition-colors duration-300",
              yearly ? "text-white" : "text-text-secondary",
            )}
          >
            Yearly
          </button>
        </div>
        {yearly ? (
          <motion.span
            className="rounded-full bg-green/10 px-2.5 py-0.5 text-[12.5px] font-semibold text-green"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            Save with yearly billing
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
          <p className="mb-1 text-[16px] font-semibold text-text-primary">{freePlan.name}</p>
          <div className="mb-1 flex items-baseline gap-1">
            <span className="text-[42px] font-bold tracking-tight text-text-primary">{freePlan.price}</span>
            <span className="text-[15px] text-text-tertiary">{freePlan.period}</span>
          </div>
          <p className="mb-7 text-[14.5px] text-text-secondary">{freePlan.subtitle}</p>

          <ul className="mb-8 flex-1 space-y-3">
            {freePlan.features.map((f) => (
              <li key={f.text} className="flex items-center gap-2.5">
                {f.included ? (
                  <Check size={15} className="shrink-0 text-green" strokeWidth={2.5} />
                ) : (
                  <X size={15} className="shrink-0 text-text-tertiary/50" strokeWidth={2} />
                )}
                <span className={cn("text-[15px]", f.included ? "text-text-secondary" : "text-text-tertiary")}>
                  {f.text}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href="/sign-up"
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-cream-3 bg-glass-bg px-4 py-3 text-[15px] font-medium text-text-primary no-underline backdrop-blur-sm transition-all duration-150 hover:bg-cream-3"
          >
            Get started
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
              Most popular
            </span>
          </div>
          <div className="absolute left-0 right-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-amber-light via-amber to-coffee opacity-80" />

          <div className="relative mb-1 flex items-center gap-2">
            <p className="text-[16px] font-semibold text-text-primary">{espressoPlan.name}</p>
            <Crown size={14} className="text-amber" />
          </div>
          <div className="relative mb-1 flex items-baseline gap-1">
            <span className="text-[42px] font-bold tracking-tight text-text-primary">{espressoPricing.price}</span>
            <span className="text-[15px] text-text-tertiary">{espressoPricing.period}</span>
          </div>
          {yearly && (
            <p className="relative mb-3 text-[13.5px] font-medium text-green">
              That&apos;s just {espressoPlan.yearly.monthly}/month
            </p>
          )}
          <p className="relative mb-7 text-[14.5px] text-text-secondary">{espressoPlan.subtitle}</p>

          <ul className="relative mb-8 flex-1 space-y-3">
            {espressoPlan.features.map((f, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <Check size={15} className="shrink-0 text-green" strokeWidth={2.5} />
                <span className="text-[15px] text-text-secondary">{f.text}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/sign-up"
            className="btn-shimmer relative flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none px-4 py-3 text-[15px] font-semibold text-white no-underline transition-all duration-150 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)]"
          >
            Start with Espresso
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
              Coming soon
            </span>
          </div>
          <div className="absolute left-0 right-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-coffee via-coffee-light to-amber opacity-60" />

          <div className="relative mb-1 flex items-center gap-2">
            <p className="text-[16px] font-semibold text-text-primary">{doubleEspressoPlan.name}</p>
            <Crown size={14} className="text-coffee" />
          </div>
          <div className="relative mb-1 flex items-baseline gap-1">
            <span className="text-[42px] font-bold tracking-tight text-text-primary">{doublePricing.price}</span>
            <span className="text-[15px] text-text-tertiary">{doublePricing.period}</span>
          </div>
          {yearly && (
            <p className="relative mb-3 text-[13.5px] font-medium text-green">
              That&apos;s just {doubleEspressoPlan.yearly.monthly}/month
            </p>
          )}
          <p className="relative mb-7 text-[14.5px] text-text-secondary">{doubleEspressoPlan.subtitle}</p>

          <ul className="relative mb-8 flex-1 space-y-3">
            {doubleEspressoPlan.features.map((f) => (
              <li key={f.text} className="flex items-center gap-2.5">
                <Check
                  size={15}
                  className={cn("shrink-0", f.roadmap ? "text-text-tertiary" : "text-green")}
                  strokeWidth={2.5}
                />
                <span className={cn("text-[15px]", f.roadmap ? "text-text-tertiary" : "text-text-secondary")}>
                  {f.text}
                  {f.roadmap && (
                    <span className="ml-1.5 rounded-full bg-cream-3/60 px-1.5 py-px text-[11px] font-medium text-text-tertiary">
                      Roadmap
                    </span>
                  )}
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
        No credit card required to start. Upgrade anytime from your dashboard.
      </motion.p>
    </section>
  );
}
