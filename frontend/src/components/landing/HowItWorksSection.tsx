"use client";

import { Building2, UserPlus, QrCode, BarChart3, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link as LocaleLink } from "@/i18n/navigation";

/**
 * Icon, number and accent are design; `key` selects the i18n pair
 * `homepage.howItWorks.steps.<key>.{title,desc}`.
 */
const steps = [
  { number: "01", icon: <Building2 size={24} strokeWidth={1.6} />, key: "create", accent: "#6B4226" },
  { number: "02", icon: <UserPlus size={24} strokeWidth={1.6} />, key: "addTeam", accent: "#4A7C59" },
  { number: "03", icon: <QrCode size={24} strokeWidth={1.6} />, key: "scan", accent: "#C17F3B" },
  { number: "04", icon: <BarChart3 size={24} strokeWidth={1.6} />, key: "track", accent: "#3B6FA0" },
];

export function HowItWorksSection() {
  const t = useTranslations("homepage.howItWorks");

  return (
    <section className="mx-auto max-w-5xl px-6 py-24 md:px-8">
      <motion.div
        className="mb-16 text-center"
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

      <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="absolute left-[calc(12.5%+36px)] right-[calc(12.5%+36px)] top-[36px] z-0 hidden h-px bg-cream-3 lg:block" />

        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            className="relative z-10 flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
          >
            <div className="relative mb-5">
              <div
                className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-transform duration-300 hover:scale-105"
                style={{ background: `${step.accent}12`, color: step.accent }}
              >
                {step.icon}
              </div>
              <span
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold text-white"
                style={{ background: step.accent }}
              >
                {step.number}
              </span>
            </div>

            <h4 className="mb-2 text-[16px] font-semibold text-text-primary">{t(`steps.${step.key}.title`)}</h4>
            <p className="max-w-[240px] text-[14.5px] leading-relaxed text-text-secondary">
              {t(`steps.${step.key}.desc`)}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <LocaleLink
          href="/how-it-works"
          className="inline-flex items-center gap-1.5 text-[15px] font-medium text-coffee no-underline transition-colors hover:text-coffee-light"
        >
          {t("learnMore")}
          <ChevronRight size={14} />
        </LocaleLink>
      </motion.div>
    </section>
  );
}
