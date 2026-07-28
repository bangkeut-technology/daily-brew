"use client";

import Link from "next/link";
import { Coffee } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link as LocaleLink } from "@/i18n/navigation";
import { AppStoreBadge } from "@/components/shared/AppStoreBadge";
import { PlayStoreBadge } from "@/components/shared/PlayStoreBadge";

/** `key` selects `marketing.footer.<group>Links.<key>`; `to` is the route. */
const productLinks = [
  { key: "features", to: "/features" },
  { key: "howItWorks", to: "/how-it-works" },
  { key: "guides", to: "/guides" },
  { key: "roles", to: "/roles" },
  { key: "demo", to: "/demo" },
  { key: "pricing", to: "/pricing" },
  { key: "faq", to: "/faq" },
  { key: "support", to: "/support" },
] as const;

const legalLinks = [
  { key: "privacy", to: "/privacy" },
  { key: "terms", to: "/terms" },
  { key: "refund", to: "/refund" },
  { key: "deleteAccount", to: "/delete-account" },
] as const;

export function LandingFooter() {
  const t = useTranslations("marketing.footer");

  return (
    <footer className="relative mt-10 border-t border-cream-3/50 bg-cream-2/50 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-6 py-14 md:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <motion.div
            className="col-span-2 md:col-span-1"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h4 className="mb-2 font-serif text-[20px] font-semibold text-coffee">DailyBrew</h4>
            <p className="max-w-[220px] text-[14px] leading-relaxed text-text-secondary">
              {t("brandTagline")}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <AppStoreBadge className="inline-block opacity-80 transition-opacity hover:opacity-100" />
              <PlayStoreBadge className="inline-block opacity-80 transition-opacity hover:opacity-100" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <p className="mb-4 text-[13px] font-medium uppercase tracking-[1.5px] text-text-tertiary">
              {t("productHeader")}
            </p>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.to}>
                  <LocaleLink
                    href={link.to}
                    className="text-[15px] text-text-secondary no-underline transition-colors duration-200 hover:text-coffee"
                  >
                    {t(`productLinks.${link.key}`)}
                  </LocaleLink>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <p className="mb-4 text-[13px] font-medium uppercase tracking-[1.5px] text-text-tertiary">
              {t("legalHeader")}
            </p>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <LocaleLink
                    href={link.to}
                    className="text-[15px] text-text-secondary no-underline transition-colors duration-200 hover:text-coffee"
                  >
                    {t(`legalLinks.${link.key}`)}
                  </LocaleLink>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <p className="mb-4 text-[13px] font-medium uppercase tracking-[1.5px] text-text-tertiary">
              {t("getStartedHeader")}
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/sign-up"
                  className="text-[15px] text-text-secondary no-underline transition-colors duration-200 hover:text-coffee"
                >
                  {t("cta.createAccount")}
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-in"
                  className="text-[15px] text-text-secondary no-underline transition-colors duration-200 hover:text-coffee"
                >
                  {t("cta.signIn")}
                </Link>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-cream-3/50 pt-6 sm:flex-row"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <p className="text-[13px] text-text-tertiary">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="text-[13px] text-text-tertiary">
            <span className="inline-flex items-center gap-1">
              {t("madeWithPrefix")} <Coffee size={12} className="text-coffee" />{" "}
              {t("madeWithSuffix")}
            </span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
