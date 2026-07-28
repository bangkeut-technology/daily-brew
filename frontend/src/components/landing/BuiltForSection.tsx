"use client";

import { Utensils, CoffeeIcon, Wine, Soup, IceCreamCone, Store } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const venues = [
  { icon: <Utensils size={22} strokeWidth={1.6} />, key: "restaurants", accent: "#6B4226" },
  { icon: <CoffeeIcon size={22} strokeWidth={1.6} />, key: "cafes", accent: "#C17F3B" },
  { icon: <Wine size={22} strokeWidth={1.6} />, key: "barsPubs", accent: "#7C5C9B" },
  { icon: <Soup size={22} strokeWidth={1.6} />, key: "foodCourts", accent: "#3B6FA0" },
  { icon: <IceCreamCone size={22} strokeWidth={1.6} />, key: "bakeries", accent: "#4A7C59" },
  { icon: <Store size={22} strokeWidth={1.6} />, key: "smallTeams", accent: "#9B6B45" },
];

// The big numerals stay raw — "3", "< 5", "0" read the same in every locale
// we ship. Only the label and sub-label get translated.
const highlights = [
  { value: "3", key: "languages" },
  { value: "< 5", key: "setupTime" },
  { value: "0", key: "hardware" },
];

export function BuiltForSection() {
  const t = useTranslations("homepage.builtFor");

  return (
    <section className="mx-auto max-w-5xl px-6 py-24 md:px-8">
      <motion.div
        className="mb-14 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="mb-3 text-[13px] font-medium uppercase tracking-[2px] text-amber">{t("eyebrow")}</p>
        <h3 className="font-serif text-[30px] font-semibold leading-tight text-text-primary md:text-[36px]">
          {t("title")}
        </h3>
        <p className="mx-auto mt-3 max-w-lg text-[16px] text-text-secondary">
          {t("subtitle")}
        </p>
      </motion.div>

      <div className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {venues.map((v, i) => (
          <motion.div
            key={v.key}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-glass-border bg-glass-bg px-3 py-5 shadow-[0_2px_12px_rgba(107,66,38,0.04)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(107,66,38,0.08)]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
              style={{ background: `${v.accent}12`, color: v.accent }}
            >
              {v.icon}
            </div>
            <span className="text-center text-[14px] font-medium text-text-primary">
              {t(`venues.${v.key}`)}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="rounded-2xl border border-glass-border bg-glass-bg p-8 shadow-[0_2px_12px_rgba(107,66,38,0.05)] backdrop-blur-md"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-4">
          {highlights.map((h, i) => (
            <motion.div
              key={h.key}
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.1 }}
            >
              <p className="mb-1 text-[36px] font-bold leading-none text-coffee">{h.value}</p>
              <p className="mb-0.5 text-[15px] font-semibold text-text-primary">
                {t(`highlights.${h.key}.label`)}
              </p>
              <p className="text-[13.5px] text-text-tertiary">{t(`highlights.${h.key}.sub`)}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
