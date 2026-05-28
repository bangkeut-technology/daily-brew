"use client";

import Link from "next/link";
import { Building2, UserPlus, QrCode, BarChart3, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: <Building2 size={24} strokeWidth={1.6} />,
    title: "Create your workspace",
    desc: "Sign up, name your restaurant, and a unique QR code is generated for your workspace instantly.",
    accent: "#6B4226",
  },
  {
    number: "02",
    icon: <UserPlus size={24} strokeWidth={1.6} />,
    title: "Add your team",
    desc: "Create employee profiles and assign shifts. Morning, evening, or custom — you define the schedule.",
    accent: "#4A7C59",
  },
  {
    number: "03",
    icon: <QrCode size={24} strokeWidth={1.6} />,
    title: "Staff scan to check in",
    desc: "Display the QR code at your restaurant. Employees scan it to check in and out — one tap each way.",
    accent: "#C17F3B",
  },
  {
    number: "04",
    icon: <BarChart3 size={24} strokeWidth={1.6} />,
    title: "Track everything live",
    desc: "See who is present, late, on leave, or absent. Late arrivals and early departures are flagged automatically.",
    accent: "#3B6FA0",
  },
];

export function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24 md:px-8">
      <motion.div
        className="mb-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="mb-3 text-[13px] font-medium uppercase tracking-[2px] text-amber">How it works</p>
        <h3 className="font-serif text-[30px] font-semibold leading-tight text-text-primary md:text-[36px]">
          Up and running in minutes
        </h3>
        <p className="mx-auto mt-3 max-w-md text-[16px] text-text-secondary">
          Four steps from sign-up to live attendance tracking. No hardware needed.
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

            <h4 className="mb-2 text-[16px] font-semibold text-text-primary">{step.title}</h4>
            <p className="max-w-[240px] text-[14.5px] leading-relaxed text-text-secondary">{step.desc}</p>
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
        <Link
          href="/how-it-works"
          className="inline-flex items-center gap-1.5 text-[15px] font-medium text-coffee no-underline transition-colors hover:text-coffee-light"
        >
          Learn more about how it works
          <ChevronRight size={14} />
        </Link>
      </motion.div>
    </section>
  );
}
