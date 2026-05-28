"use client";

import Link from "next/link";
import { ChevronRight, QrCode, CheckCircle, Clock, Users, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AppStoreBadge } from "@/components/shared/AppStoreBadge";
import { PlayStoreBadge } from "@/components/shared/PlayStoreBadge";

const floatingCardVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.6 + i * 0.15, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const trustItems = [
  { icon: <QrCode size={14} />, text: "QR check-in" },
  { icon: <Clock size={14} />, text: "Shift tracking" },
  { icon: <Users size={14} />, text: "Leave management" },
  { icon: <Shield size={14} />, text: "Geofencing" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-32 md:px-8">
      {/* Animated background gradient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-amber/[0.07] blur-[100px]"
          animate={{ y: [0, 30, 0], x: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 h-[600px] w-[600px] rounded-full bg-coffee/[0.05] blur-[100px]"
          animate={{ y: [0, -20, 0], x: [0, -15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-1/3 top-1/4 h-[300px] w-[300px] rounded-full bg-amber-light/[0.04] blur-[80px]"
          animate={{ y: [0, 18, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left — copy */}
          <div>
            <motion.div
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber/15 bg-amber/8 px-3 py-1.5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" />
              <span className="text-[13px] font-medium tracking-wide text-amber">
                Free for up to 10 employees
              </span>
            </motion.div>

            <motion.h1
              className="mb-6 font-serif text-[40px] font-semibold leading-[1.08] text-text-primary md:text-[54px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Staff attendance,
              <br />
              <span className="text-coffee">brewed simply.</span>
            </motion.h1>

            <motion.p
              className="mb-8 max-w-lg text-[18px] leading-relaxed text-text-secondary md:text-[19px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              One QR code at your restaurant. Staff scan to check in. You see who&apos;s here,
              who&apos;s late, and who&apos;s on leave — all in real time.
            </motion.p>

            <motion.div
              className="flex flex-col items-start gap-3 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                href="/sign-up"
                className="btn-shimmer inline-flex cursor-pointer items-center gap-2 rounded-xl border-none px-7 py-3.5 text-[17px] font-semibold text-white no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(107,66,38,0.30)]"
              >
                Get started free
                <ChevronRight size={16} />
              </Link>
              <Link
                href="/demo"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-glass-border bg-glass-bg px-6 py-3.5 text-[16px] font-medium text-text-primary no-underline backdrop-blur-sm transition-all duration-200 hover:bg-cream-3"
              >
                Try the demo
              </Link>
            </motion.div>

            <motion.div
              className="mt-6 flex flex-wrap items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <p className="text-[13.5px] text-text-tertiary">No credit card required</p>
              <span className="h-1 w-1 rounded-full bg-cream-3" />
              <p className="text-[13.5px] text-text-tertiary">Set up in under 5 minutes</p>
            </motion.div>

            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex flex-wrap items-center gap-3">
                <AppStoreBadge className="inline-block opacity-80 transition-opacity hover:opacity-100" />
                <PlayStoreBadge className="inline-block opacity-80 transition-opacity hover:opacity-100" />
              </div>
            </motion.div>
          </div>

          {/* Right — dashboard preview with side cards */}
          <div className="hidden flex-col gap-4 lg:flex">
            <motion.div
              className="self-end rounded-xl border border-glass-border bg-glass-bg px-4 py-3 shadow-[0_4px_20px_rgba(107,66,38,0.08)] backdrop-blur-xl"
              custom={3}
              variants={floatingCardVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green/10">
                  <CheckCircle size={14} className="text-green" />
                </div>
                <div>
                  <p className="text-[12.5px] font-medium text-text-primary">Sophea checked in</p>
                  <p className="text-[11px] text-text-tertiary">Just now — on time</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="rounded-2xl border border-glass-border bg-glass-bg p-6 shadow-[0_8px_40px_rgba(107,66,38,0.08)] backdrop-blur-xl"
              custom={0}
              variants={floatingCardVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="mb-0.5 text-[12px] font-medium uppercase tracking-[1px] text-text-tertiary">
                    Today&apos;s overview
                  </p>
                  <p className="font-serif text-[17px] font-semibold text-text-primary">Dashboard</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green" />
                  <span className="text-[12px] font-medium text-green">Live</span>
                </div>
              </div>

              <div className="mb-5 grid grid-cols-4 gap-2.5">
                {[
                  { label: "Present", value: "7", color: "#4A7C59" },
                  { label: "Late", value: "1", color: "#C17F3B" },
                  { label: "Leave", value: "1", color: "#3B6FA0" },
                  { label: "Absent", value: "0", color: "#C0392B" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-cream/60 p-2.5 text-center dark:bg-cream/5">
                    <p className="mb-0.5 text-[20px] font-semibold leading-none" style={{ color: s.color }}>
                      {s.value}
                    </p>
                    <p className="text-[11px] uppercase tracking-wider text-text-tertiary">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-0">
                {[
                  { name: "Sophea Chan", initials: "SC", shift: "Morning", time: "06:58", status: "On time", statusColor: "#4A7C59", grad: 0 },
                  { name: "Dara Sok", initials: "DS", shift: "Morning", time: "07:12", status: "Late", statusColor: "#C17F3B", grad: 1 },
                  { name: "Sreyleak Heng", initials: "SH", shift: "Evening", time: "—", status: "On leave", statusColor: "#3B6FA0", grad: 2 },
                ].map((r, i) => (
                  <div
                    key={r.name}
                    className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2.5", i === 0 && "bg-cream/40 dark:bg-cream/5")}
                  >
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                      style={{
                        background: [
                          "linear-gradient(135deg, #C17F3B, #6B4226)",
                          "linear-gradient(135deg, #3B6FA0, #1a3a5c)",
                          "linear-gradient(135deg, #4A7C59, #2a4a35)",
                        ][r.grad],
                      }}
                    >
                      {r.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium text-text-primary">{r.name}</p>
                      <p className="text-[11.5px] text-text-tertiary">{r.shift}</p>
                    </div>
                    <span className="mr-2 font-mono text-[12.5px] tabular-nums text-text-secondary">{r.time}</span>
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[11px] font-medium"
                      style={{ background: `${r.statusColor}15`, color: r.statusColor }}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="w-[150px] self-start rounded-2xl border border-glass-border bg-glass-bg p-4 shadow-[0_4px_20px_rgba(107,66,38,0.08)] backdrop-blur-xl"
              custom={2}
              variants={floatingCardVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-coffee/10">
                  <QrCode size={13} className="text-coffee" />
                </div>
                <p className="text-[12px] font-medium text-text-primary">QR Check-in</p>
              </div>
              <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-cream-3/40 p-3 dark:bg-cream-3/10">
                <svg viewBox="0 0 21 21" className="h-full w-full" shapeRendering="crispEdges">
                  <rect x="0" y="0" width="7" height="7" fill="currentColor" className="text-coffee" />
                  <rect x="1" y="1" width="5" height="5" fill="currentColor" className="text-cream-3/60" />
                  <rect x="2" y="2" width="3" height="3" fill="currentColor" className="text-coffee" />
                  <rect x="14" y="0" width="7" height="7" fill="currentColor" className="text-coffee" />
                  <rect x="15" y="1" width="5" height="5" fill="currentColor" className="text-cream-3/60" />
                  <rect x="16" y="2" width="3" height="3" fill="currentColor" className="text-coffee" />
                  <rect x="0" y="14" width="7" height="7" fill="currentColor" className="text-coffee" />
                  <rect x="1" y="15" width="5" height="5" fill="currentColor" className="text-cream-3/60" />
                  <rect x="2" y="16" width="3" height="3" fill="currentColor" className="text-coffee" />
                  {[
                    [8, 0], [10, 0], [8, 2], [9, 2], [10, 3], [8, 4], [10, 4],
                    [0, 8], [2, 8], [4, 8], [6, 8], [8, 8], [10, 8], [12, 8], [14, 8], [16, 8], [18, 8], [20, 8],
                    [8, 10], [9, 9], [11, 9], [13, 10], [15, 10], [17, 9], [19, 10],
                    [9, 11], [11, 11], [14, 12], [16, 12], [18, 11], [20, 12],
                    [8, 13], [10, 13], [12, 14], [14, 14], [16, 14], [19, 13],
                    [9, 15], [11, 16], [13, 15], [15, 16], [17, 15], [19, 16],
                    [8, 17], [10, 18], [12, 17], [14, 18], [16, 17], [18, 18], [20, 17],
                    [8, 20], [10, 19], [12, 20], [15, 19], [17, 20], [19, 19], [20, 20],
                  ].map(([x, y], i) => (
                    <rect key={i} x={x} y={y} width="1" height="1" fill="currentColor" className="text-coffee" />
                  ))}
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div
        className="relative z-10 mx-auto mt-20 max-w-4xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          {trustItems.map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-4 py-2 backdrop-blur-sm"
            >
              <span className="text-coffee">{item.icon}</span>
              <span className="text-[13.5px] font-medium text-text-secondary">{item.text}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
