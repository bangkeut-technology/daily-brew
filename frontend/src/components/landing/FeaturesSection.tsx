"use client";

import type { ReactNode } from "react";
import Link from "next/link";
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
import { BasilBookBrand } from "@/components/shared/BasilBookBrand";

const coreFeatures = [
  {
    icon: <QrCode size={22} strokeWidth={1.8} />,
    title: "QR check-in",
    desc: "One QR code per workspace. Staff scan it to check in and out — fast, contactless, no extra hardware.",
    accent: "#C17F3B",
  },
  {
    icon: <Users size={22} strokeWidth={1.8} />,
    title: "Employee management",
    desc: "Add staff, assign shifts, and track attendance history. Manage active and inactive employees.",
    accent: "#4A7C59",
  },
  {
    icon: <Clock size={22} strokeWidth={1.8} />,
    title: "Shift tracking",
    desc: "Define morning, evening, or custom shifts. Late arrivals and early departures are flagged automatically.",
    accent: "#3B6FA0",
  },
  {
    icon: <LayoutDashboard size={22} strokeWidth={1.8} />,
    title: "Real-time dashboard",
    desc: "See who's present, late, on leave, or absent. Live stats for owners and employees.",
    accent: "#9B6B45",
  },
];

const espressoFeatures = [
  {
    icon: <Coffee size={22} strokeWidth={1.8} />,
    title: "Leave requests",
    desc: "Staff submit leave from their phone. Owners approve or reject with one tap. Full or partial day.",
    accent: "#6B4226",
  },
  {
    icon: <Shield size={22} strokeWidth={1.8} />,
    title: "IP restriction",
    desc: "Lock check-ins to your restaurant's WiFi. Prevent remote punching.",
    accent: "#C0392B",
  },
  {
    icon: <Smartphone size={22} strokeWidth={1.8} />,
    title: "Device verification",
    desc: "Bind check-in/out to one device per employee per day. Prevents buddy punching.",
    accent: "#9B6B45",
  },
  {
    icon: <MapPin size={22} strokeWidth={1.8} />,
    title: "Geofencing",
    desc: "Restrict check-ins to a GPS radius around your restaurant.",
    accent: "#7C5C9B",
  },
  {
    icon: <CalendarDays size={22} strokeWidth={1.8} />,
    title: "Per-day schedules",
    desc: "Set different shift hours for each day of the week.",
    accent: "#3B6FA0",
  },
  {
    icon: <ShieldCheck size={22} strokeWidth={1.8} />,
    title: "Manager role",
    desc: "Promote trusted staff and pick exactly which areas they administer — five granular permissions, configurable per manager.",
    accent: "#6B4226",
  },
  {
    icon: <ArrowRightLeft size={22} strokeWidth={1.8} />,
    title: (
      <>
        <BasilBookBrand className="text-[16px]" /> integration
      </>
    ),
    desc: "Sync staff attendance to your accounting system. Link employees by username and pull data via API.",
    accent: "#2bb673",
  },
  {
    icon: <Bell size={22} strokeWidth={1.8} />,
    title: "Notifications",
    desc: "Push and email alerts for leave requests, shift changes, closures, and daily summaries.",
    accent: "#C17F3B",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-5xl px-6 py-24 md:px-8">
      <motion.div
        className="mb-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="mb-3 text-[13px] font-medium uppercase tracking-[2px] text-amber">Features</p>
        <h3 className="font-serif text-[30px] font-semibold leading-tight text-text-primary md:text-[36px]">
          Everything your restaurant needs
        </h3>
        <p className="mx-auto mt-3 max-w-md text-[16px] text-text-secondary">
          Built for restaurant owners who want clarity without complexity.
        </p>
      </motion.div>

      <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        {coreFeatures.map((f, index) => (
          <FeatureCard key={index} feature={f} index={index} />
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
            Espresso plan
          </span>
        </div>
        <div className="h-px flex-1 bg-cream-3" />
      </motion.div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {espressoFeatures.map((f, index) => (
          <FeatureCard key={index} feature={f} index={index + 4} />
        ))}
      </div>

      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Link
          href="/features"
          className="inline-flex items-center gap-1.5 text-[15px] font-medium text-coffee no-underline transition-colors hover:text-coffee-light"
        >
          See all features in detail
          <ChevronRight size={14} />
        </Link>
      </motion.div>
    </section>
  );
}

function FeatureCard({
  feature: f,
  index,
}: {
  feature: { icon: ReactNode; title: ReactNode; desc: string; accent: string };
  index: number;
}) {
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
          <h4 className="mb-1.5 text-[16px] font-semibold text-text-primary">{f.title}</h4>
          <p className="text-[14.5px] leading-relaxed text-text-secondary">{f.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}
