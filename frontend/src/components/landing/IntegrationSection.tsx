"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRightLeft, FileText, Clock, ChevronRight, Crown } from "lucide-react";
import { BasilBookBrand } from "@/components/shared/BasilBookBrand";

const benefits = [
  {
    icon: <ArrowRightLeft size={18} strokeWidth={1.8} />,
    title: "Attendance synced to accounting",
    desc: "Pulls attendance data via API — match who worked with what was sold.",
  },
  {
    icon: <FileText size={18} strokeWidth={1.8} />,
    title: "Username-based staff linking",
    desc: "Link employees across both systems with a shared username. One identity, two products.",
  },
  {
    icon: <Clock size={18} strokeWidth={1.8} />,
    title: "Period-based data retrieval",
    desc: "Query attendance by date range — daily, weekly, or monthly. Up to 93 days per request.",
  },
];

export function IntegrationSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24 md:px-8">
      <motion.div
        className="mb-14 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="mb-3 text-[13px] font-medium uppercase tracking-[2px] text-amber">Integration</p>
        <h3 className="font-serif text-[30px] font-semibold leading-tight text-text-primary md:text-[36px]">
          Works with <BasilBookBrand />
        </h3>
        <p className="mx-auto mt-3 max-w-lg text-[16px] text-text-secondary">
          Connect staff attendance to your restaurant accounting. Know who worked, when they
          worked, and how it maps to your financials.
        </p>
      </motion.div>

      <motion.div
        className="relative overflow-hidden rounded-2xl border border-glass-border bg-glass-bg shadow-[0_2px_12px_rgba(107,66,38,0.05)] backdrop-blur-md"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-[#2bb673] via-[#36b9a0] to-amber opacity-70" />

        <div className="p-8 md:p-10">
          <div className="mb-10 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-icon.svg" alt="DailyBrew" className="h-12 w-12 rounded-xl" />
              <div>
                <p className="text-[17px] font-semibold text-text-primary">DailyBrew</p>
                <p className="text-[13px] text-text-tertiary">Attendance</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden h-px w-8 bg-cream-3 sm:block" />
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber/20 bg-amber/10">
                <ArrowRightLeft size={16} className="text-amber" />
              </div>
              <div className="hidden h-px w-8 bg-cream-3 sm:block" />
            </div>

            <a
              href="https://basilbook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 no-underline transition-opacity hover:opacity-80"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/basilbook-logo.png" alt="BasilBook" className="h-12 w-12 rounded-xl" />
              <div>
                <p className="text-[17px]">
                  <BasilBookBrand />
                </p>
                <p className="text-[13px] text-text-tertiary">Accounting</p>
              </div>
            </a>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                className="flex flex-col gap-3 rounded-xl border border-cream-3/40 bg-cream/40 p-5 dark:bg-cream/5"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.15 + i * 0.08 }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber/10 text-amber">
                  {b.icon}
                </div>
                <h4 className="text-[15px] font-semibold leading-snug text-text-primary">{b.title}</h4>
                <p className="text-[14px] leading-relaxed text-text-secondary">{b.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-4 rounded-xl border border-cream-3/40 bg-cream-3/30 px-5 py-4 dark:bg-cream-3/10 sm:flex-row">
            <div className="flex-1">
              <p className="text-[14.5px] leading-relaxed text-text-secondary">
                <span className="font-medium text-text-primary">How it works:</span> Generate an API
                token in DailyBrew settings. <BasilBookBrand className="text-[14.5px]" /> uses it to
                pull attendance data for employees with matching usernames — check-in times, late
                flags, and shift info.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/15 bg-amber/10 px-2.5 py-1 text-[12px] font-semibold text-amber">
                <Crown size={11} />
                Espresso
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="btn-shimmer inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-[15px] font-semibold text-white no-underline transition-all hover:-translate-y-px"
            >
              Get started with Espresso
              <ChevronRight size={14} />
            </Link>
            <a
              href="https://basilbook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-cream-3 bg-glass-bg px-5 py-2.5 text-[15px] font-medium text-text-primary no-underline backdrop-blur-sm transition-all hover:bg-cream-3"
            >
              Learn about <BasilBookBrand className="text-[15px]" />
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
