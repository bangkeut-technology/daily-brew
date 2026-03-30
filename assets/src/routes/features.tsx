import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  QrCode, Users, Clock, Coffee, Shield, LayoutDashboard,
  MapPin, CalendarDays, ChevronRight, Crown,
} from 'lucide-react';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const Route = createFileRoute('/features')({
  component: FeaturesPage,
});

const coreFeatures = [
  {
    icon: <QrCode size={28} strokeWidth={1.6} />,
    title: 'QR code check-in',
    desc: 'Each employee gets a unique QR code. Staff scan with any phone browser — no app needed, no login required. One tap to check in, one tap to check out.',
    accent: '#C17F3B',
  },
  {
    icon: <Users size={28} strokeWidth={1.6} />,
    title: 'Employee management',
    desc: 'Add staff, assign them to shifts, generate QR codes, and track their attendance history in one place. Active/inactive status management.',
    accent: '#4A7C59',
  },
  {
    icon: <Clock size={28} strokeWidth={1.6} />,
    title: 'Shift tracking',
    desc: 'Define morning, evening, or custom shifts with start and end times. Late arrivals and early departures are detected automatically with configurable grace periods.',
    accent: '#3B6FA0',
  },
  {
    icon: <Coffee size={28} strokeWidth={1.6} />,
    title: 'Closure periods',
    desc: 'Mark holidays, renovations, or any days your restaurant is closed. No attendance is expected — no false absences during closures.',
    accent: '#9B6B45',
  },
  {
    icon: <LayoutDashboard size={28} strokeWidth={1.6} />,
    title: 'Real-time dashboard',
    desc: 'See who\'s present, late, on leave, or absent at a glance. Today\'s stats and recent attendance in one beautiful view.',
    accent: '#6B4226',
  },
];

const espressoFeatures = [
  {
    icon: <Shield size={28} strokeWidth={1.6} />,
    title: 'IP restriction',
    desc: 'Only allow check-ins from specific IP addresses — like your restaurant\'s WiFi. Prevents staff from checking in remotely.',
    accent: '#C0392B',
  },
  {
    icon: <MapPin size={28} strokeWidth={1.6} />,
    title: 'Geofencing',
    desc: 'Set a GPS location and radius for your restaurant. Staff must be physically nearby to check in. Configurable from 50m to 500m.',
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
    desc: 'Staff submit leave requests. Owners approve or reject with a note. Track paid vs unpaid leave with full history.',
    accent: '#4A7C59',
  },
];

function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <LandingNav />

      <div className="pt-28 pb-20 px-6 md:px-8 max-w-5xl mx-auto page-enter">
        {/* Hero */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[11px] uppercase tracking-[2px] font-medium text-amber mb-3">
            Features
          </p>
          <h1 className="text-[32px] md:text-[42px] font-semibold text-text-primary font-serif leading-tight">
            Everything you need to track attendance
          </h1>
          <p className="text-[15px] text-text-secondary mt-4 max-w-xl mx-auto">
            From QR check-in to geofencing — simple tools that work for restaurants of any size.
          </p>
        </motion.div>

        {/* Core features */}
        <div className="mb-20">
          <motion.h2
            className="text-[11px] uppercase tracking-[2px] font-medium text-text-tertiary mb-8 text-center"
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
            <Crown size={16} className="text-amber" />
            <h2 className="text-[11px] uppercase tracking-[2px] font-medium text-amber">
              Espresso features
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {espressoFeatures.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} espresso />
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-[22px] font-semibold text-text-primary font-serif mb-3">
            Ready to get started?
          </h3>
          <p className="text-[14px] text-text-secondary mb-6">
            Free for up to 10 employees. No credit card required.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/sign-up"
              className="btn-shimmer flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-[13px] font-semibold text-white no-underline transition-all hover:-translate-y-px"
            >
              Start free
              <ChevronRight size={14} />
            </Link>
            <Link
              to="/pricing"
              className="px-6 py-2.5 rounded-lg text-[13px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 no-underline transition-all hover:bg-cream-3"
            >
              View pricing
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
      transition={{ duration: 0.4, delay: index * 0.08 }}
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
          <h3 className="text-[14px] font-semibold text-text-primary">
            {feature.title}
          </h3>
          {espresso && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber/10 text-amber uppercase tracking-wider">
              Espresso
            </span>
          )}
        </div>
        <p className="text-[12.5px] text-text-secondary leading-relaxed">
          {feature.desc}
        </p>
      </div>
    </motion.div>
  );
}
