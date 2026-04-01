import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  QrCode, Users, Clock, Coffee, Shield, LayoutDashboard,
  MapPin, CalendarDays, Bell, ChevronRight, Crown, Smartphone,
  Globe, Moon, Zap, CheckCircle,
} from 'lucide-react';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';

export const Route = createFileRoute('/features')({
  component: FeaturesPage,
});

const coreFeatures = [
  {
    icon: <QrCode size={28} strokeWidth={1.6} />,
    title: 'QR code check-in',
    desc: 'Display one QR code at your restaurant. Staff scan it from the DailyBrew app to check in and out — no extra hardware needed.',
    accent: '#C17F3B',
  },
  {
    icon: <Users size={28} strokeWidth={1.6} />,
    title: 'Employee management',
    desc: 'Add staff, assign them to shifts, and track their attendance history. Manage active and inactive employees from one screen.',
    accent: '#4A7C59',
  },
  {
    icon: <Clock size={28} strokeWidth={1.6} />,
    title: 'Shift tracking',
    desc: 'Define morning, evening, or custom shifts with start and end times. Late arrivals and early departures are flagged automatically with configurable grace periods.',
    accent: '#3B6FA0',
  },
  {
    icon: <Coffee size={28} strokeWidth={1.6} />,
    title: 'Closure periods',
    desc: 'Mark holidays, renovations, or any days your restaurant is closed. Attendance is paused automatically — no false absences.',
    accent: '#9B6B45',
  },
  {
    icon: <LayoutDashboard size={28} strokeWidth={1.6} />,
    title: 'Real-time dashboard',
    desc: 'See who is present, late, on leave, or absent at a glance. Owner and employee dashboards with live stats and recent history.',
    accent: '#6B4226',
  },
  {
    icon: <Globe size={28} strokeWidth={1.6} />,
    title: 'Multi-language',
    desc: 'Available in English, French, and Khmer. Staff can use the app in the language they are most comfortable with.',
    accent: '#4A7C59',
  },
];

const espressoFeatures = [
  {
    icon: <Shield size={28} strokeWidth={1.6} />,
    title: 'IP restriction',
    desc: 'Only allow check-ins from specific IP addresses — like your restaurant WiFi. Prevent staff from checking in remotely. "Use my current IP" button for easy setup.',
    accent: '#C0392B',
  },
  {
    icon: <Smartphone size={28} strokeWidth={1.6} />,
    title: 'Device verification',
    desc: 'Bind check-in and check-out to a single device per employee per day. Prevents buddy punching — if someone checks in on their phone, they must check out on the same phone.',
    accent: '#9B6B45',
  },
  {
    icon: <MapPin size={28} strokeWidth={1.6} />,
    title: 'Geofencing',
    desc: 'Set a GPS location and radius for your restaurant. Staff must be physically within range to check in. Configurable radius to match your venue.',
    accent: '#7C5C9B',
  },
  {
    icon: <CalendarDays size={28} strokeWidth={1.6} />,
    title: 'Per-day shift schedules',
    desc: 'Different hours on different days? Override shift times per day of the week. Monday 7-3, Saturday 9-5 — all on the same shift.',
    accent: '#3B6FA0',
  },
  {
    icon: <Users size={28} strokeWidth={1.6} />,
    title: 'Leave request management',
    desc: 'Employees submit leave requests (paid or unpaid, full or partial day). Owners approve or reject with a note. Full history and status tracking.',
    accent: '#4A7C59',
  },
  {
    icon: <Bell size={28} strokeWidth={1.6} />,
    title: 'Push & email notifications',
    desc: 'Real-time push notifications and email alerts for leave requests, approvals, shift changes, closures, and daily attendance summaries.',
    accent: '#6B4226',
  },
];

const whyReasons = [
  { icon: <Zap size={18} />, text: 'Set up in under 5 minutes' },
  { icon: <QrCode size={18} />, text: 'No hardware — just a printed QR code' },
  { icon: <Smartphone size={18} />, text: 'Works on any smartphone' },
  { icon: <Moon size={18} />, text: 'Dark mode for late shifts' },
  { icon: <Globe size={18} />, text: 'English, French, and Khmer' },
  { icon: <CheckCircle size={18} />, text: 'Free for up to 10 employees' },
];

function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <PageSeo
        title="Features"
        description="QR check-in, shift tracking, geofencing, device verification, leave management, and push notifications. Everything your restaurant needs for staff attendance."
        path="/features"
      />
      <LandingNav />

      <div className="pt-28 pb-20 px-6 md:px-8 max-w-5xl mx-auto page-enter">
        {/* Hero */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
            Features
          </p>
          <h1 className="text-[34px] md:text-[44px] font-semibold text-text-primary font-serif leading-tight">
            Everything you need to track attendance
          </h1>
          <p className="text-[17px] text-text-secondary mt-4 max-w-xl mx-auto">
            From QR check-in to geofencing — simple tools that work for
            restaurants of any size.
          </p>
        </motion.div>

        {/* Core features */}
        <div className="mb-20">
          <motion.h2
            className="text-[13px] uppercase tracking-[2px] font-medium text-text-tertiary mb-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Included in all plans
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {coreFeatures.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </div>

        {/* Espresso features */}
        <div className="mb-20">
          <motion.div
            className="flex items-center justify-center gap-2 mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex-1 h-px bg-cream-3 hidden md:block" />
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber/8 border border-amber/15">
              <Crown size={14} className="text-amber" />
              <h2 className="text-[13px] uppercase tracking-[2px] font-medium text-amber">
                Espresso plan
              </h2>
            </div>
            <div className="flex-1 h-px bg-cream-3 hidden md:block" />
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {espressoFeatures.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} espresso />
            ))}
          </div>
        </div>

        {/* Why DailyBrew */}
        <motion.div
          className="mb-20 bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-8 md:p-10 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-2">
              Why restaurant teams choose DailyBrew
            </h2>
            <p className="text-[15px] text-text-secondary">
              Built specifically for restaurants, cafes, and small teams.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {whyReasons.map((r, i) => (
              <motion.div
                key={r.text}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cream/40 dark:bg-cream/5"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <div className="w-8 h-8 rounded-lg bg-coffee/10 flex items-center justify-center text-coffee flex-shrink-0">
                  {r.icon}
                </div>
                <span className="text-[14.5px] text-text-primary font-medium">
                  {r.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-[24px] font-semibold text-text-primary font-serif mb-3">
            Ready to get started?
          </h3>
          <p className="text-[16px] text-text-secondary mb-6">
            Free for up to 10 employees. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/sign-up"
              className="btn-shimmer flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-[15px] font-semibold text-white no-underline transition-all hover:-translate-y-px"
            >
              Start free
              <ChevronRight size={14} />
            </Link>
            <Link
              to="/pricing"
              className="px-6 py-2.5 rounded-lg text-[15px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 no-underline transition-all hover:bg-cream-3"
            >
              Compare plans
            </Link>
            <Link
              to="/how-it-works"
              className="px-6 py-2.5 rounded-lg text-[15px] font-medium text-text-secondary no-underline transition-all hover:text-coffee"
            >
              See how it works
            </Link>
          </div>
        </motion.div>
      </div>

      <LandingFooter />
    </div>
  );
}

function FeatureCard({
  feature,
  index,
  espresso,
}: {
  feature: { icon: React.ReactNode; title: string; desc: string; accent: string };
  index: number;
  espresso?: boolean;
}) {
  return (
    <motion.div
      className="group relative glass-card !rounded-2xl p-6 hover:!-translate-y-1"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
    >
      {/* Accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: feature.accent }}
      />
      {/* Hover glow */}
      <div
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-xl"
        style={{ background: `${feature.accent}15` }}
      />

      <div className="relative">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
          style={{ background: `${feature.accent}12`, color: feature.accent }}
        >
          {feature.icon}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-[16px] font-semibold text-text-primary">
            {feature.title}
          </h3>
          {espresso && (
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-amber/10 text-amber uppercase tracking-wider">
              Espresso
            </span>
          )}
        </div>
        <p className="text-[14.5px] text-text-secondary leading-relaxed">
          {feature.desc}
        </p>
      </div>
    </motion.div>
  );
}
