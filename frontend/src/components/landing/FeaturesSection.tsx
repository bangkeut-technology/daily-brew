"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  QrCode,
  Users,
  Clock,
  LayoutDashboard,
  Coffee,
  Shield,
  MapPin,
  CalendarDays,
  Bell,
  Smartphone,
  ShieldCheck,
  ArrowRightLeft,
  Crown,
  ChevronRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { BasilBookBrand } from "@/components/shared/BasilBookBrand";
import { Link as LocaleLink } from "@/i18n/navigation";

interface FeatureShape {
  key: string;
  icon: ReactNode;
  accent: string;
  /** Render the brand wordmark before the translated suffix instead of a plain title. */
  titlePrefixBrand?: "basilbook";
}

const coreFeatures: FeatureShape[] = [
  { key: "qrCheckin", icon: <QrCode size={22} strokeWidth={1.8} />, accent: "#C17F3B" },
  { key: "employeeManagement", icon: <Users size={22} strokeWidth={1.8} />, accent: "#4A7C59" },
  { key: "shiftTracking", icon: <Clock size={22} strokeWidth={1.8} />, accent: "#3B6FA0" },
  { key: "realtimeDashboard", icon: <LayoutDashboard size={22} strokeWidth={1.8} />, accent: "#9B6B45" },
];

const espressoFeatures: FeatureShape[] = [
  { key: "leaveRequests", icon: <Coffee size={22} strokeWidth={1.8} />, accent: "#6B4226" },
  { key: "ipRestriction", icon: <Shield size={22} strokeWidth={1.8} />, accent: "#C0392B" },
  { key: "deviceVerification", icon: <Smartphone size={22} strokeWidth={1.8} />, accent: "#9B6B45" },
  { key: "geofencing", icon: <MapPin size={22} strokeWidth={1.8} />, accent: "#7C5C9B" },
  { key: "perDaySchedules", icon: <CalendarDays size={22} strokeWidth={1.8} />, accent: "#3B6FA0" },
  { key: "managerRole", icon: <ShieldCheck size={22} strokeWidth={1.8} />, accent: "#6B4226" },
  {
    key: "basilbookIntegration",
    icon: <ArrowRightLeft size={22} strokeWidth={1.8} />,
    accent: "#2bb673",
    titlePrefixBrand: "basilbook",
  },
  { key: "notifications", icon: <Bell size={22} strokeWidth={1.8} />, accent: "#C17F3B" },
];

export function FeaturesSection() {
  const t = useTranslations("homepage.features");

  return (
    <section id="features" className="mx-auto max-w-5xl px-6 py-24 md:px-8">
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

      <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        {coreFeatures.map((f, index) => (
          <FeatureCard key={f.key} feature={f} group="core" index={index} />
        ))}
      </div>

      <motion.div
        className="my-10 flex items-center gap-3"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <div className="h-px flex-1 bg-cream-3" />
        <div className="flex items-center gap-2 rounded-full border border-amber/15 bg-amber/8 px-4 py-1.5">
          <Crown size={13} className="text-amber" />
          <span className="text-[13px] font-semibold uppercase tracking-wider text-amber">
            {t("espressoBadge")}
          </span>
        </div>
        <div className="h-px flex-1 bg-cream-3" />
      </motion.div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {espressoFeatures.map((f, index) => (
          <FeatureCard key={f.key} feature={f} group="espresso" index={index + 4} />
        ))}
      </div>

      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <LocaleLink
          href="/features"
          className="inline-flex items-center gap-1.5 text-[15px] font-medium text-coffee no-underline transition-colors hover:text-coffee-light"
        >
          {t("seeAll")}
          <ChevronRight size={14} />
        </LocaleLink>
      </motion.div>
    </section>
  );
}

function FeatureCard({
  feature: f,
  group,
  index,
}: {
  feature: FeatureShape;
  group: "core" | "espresso";
  index: number;
}) {
  const t = useTranslations("homepage.features");

  return (
    <motion.div
      className="group relative cursor-default overflow-hidden rounded-2xl border border-glass-border bg-glass-bg p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
    >
      <div
        className="absolute left-0 right-0 top-0 h-[2px] opacity-50 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: f.accent }}
      />
      <div className="flex items-start gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
          style={{ background: `${f.accent}12`, color: f.accent }}
        >
          {f.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="mb-1.5 text-[16px] font-semibold text-text-primary">
            {f.titlePrefixBrand === "basilbook" ? (
              <>
                <BasilBookBrand className="text-[16px]" />{" "}
                {t(`${group}.${f.key}.titleSuffix`)}
              </>
            ) : (
              t(`${group}.${f.key}.title`)
            )}
          </h4>
          <p className="text-[14.5px] leading-relaxed text-text-secondary">
            {t(`${group}.${f.key}.desc`)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
