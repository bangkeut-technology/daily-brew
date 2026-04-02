import { Link } from '@tanstack/react-router';
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
} from 'lucide-react';
import { motion } from 'framer-motion';

const coreFeatures = [
  {
    icon: <QrCode size={22} strokeWidth={1.8} />,
    title: 'QR check-in',
    desc: 'One QR code per workspace. Staff scan it to check in and out — fast, contactless, no extra hardware.',
    accent: '#C17F3B',
  },
  {
    icon: <Users size={22} strokeWidth={1.8} />,
    title: 'Employee management',
    desc: 'Add staff, assign shifts, and track attendance history. Manage active and inactive employees.',
    accent: '#4A7C59',
  },
  {
    icon: <Clock size={22} strokeWidth={1.8} />,
    title: 'Shift tracking',
    desc: 'Define morning, evening, or custom shifts. Late arrivals and early departures are flagged automatically.',
    accent: '#3B6FA0',
  },
  {
    icon: <LayoutDashboard size={22} strokeWidth={1.8} />,
    title: 'Real-time dashboard',
    desc: "See who's present, late, on leave, or absent. Live stats for owners and employees.",
    accent: '#9B6B45',
  },
];

const espressoFeatures = [
  {
    icon: <Coffee size={22} strokeWidth={1.8} />,
    title: 'Leave requests',
    desc: 'Staff submit leave from their phone. Owners approve or reject with one tap. Full or partial day.',
    accent: '#6B4226',
  },
  {
    icon: <Shield size={22} strokeWidth={1.8} />,
    title: 'IP restriction',
    desc: "Lock check-ins to your restaurant's WiFi. Prevent remote punching.",
    accent: '#C0392B',
  },
  {
    icon: <Smartphone size={22} strokeWidth={1.8} />,
    title: 'Device verification',
    desc: 'Bind check-in/out to one device per employee per day. Prevents buddy punching.',
    accent: '#9B6B45',
  },
  {
    icon: <MapPin size={22} strokeWidth={1.8} />,
    title: 'Geofencing',
    desc: 'Restrict check-ins to a GPS radius around your restaurant.',
    accent: '#7C5C9B',
  },
  {
    icon: <CalendarDays size={22} strokeWidth={1.8} />,
    title: 'Per-day schedules',
    desc: 'Set different shift hours for each day of the week.',
    accent: '#3B6FA0',
  },
  {
    icon: <ShieldCheck size={22} strokeWidth={1.8} />,
    title: 'Manager role',
    desc: 'Promote trusted staff to managers. They can approve leave and view all attendance.',
    accent: '#6B4226',
  },
  {
    icon: <ArrowRightLeft size={22} strokeWidth={1.8} />,
    title: 'BasilBook integration',
    desc: 'Sync staff attendance to your accounting system. Link employees by username and pull data via API.',
    accent: '#2bb673',
  },
  {
    icon: <Bell size={22} strokeWidth={1.8} />,
    title: 'Notifications',
    desc: 'Push and email alerts for leave requests, shift changes, closures, and daily summaries.',
    accent: '#C17F3B',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 md:px-8 max-w-5xl mx-auto">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
          Features
        </p>
        <h3 className="text-[30px] md:text-[36px] font-semibold text-text-primary font-serif leading-tight">
          Everything your restaurant needs
        </h3>
        <p className="text-[16px] text-text-secondary mt-3 max-w-md mx-auto">
          Built for restaurant owners who want clarity without complexity.
        </p>
      </motion.div>

      {/* Core features — 2x2 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {coreFeatures.map((f, index) => (
          <FeatureCard key={f.title} feature={f} index={index} />
        ))}
      </div>

      {/* Espresso features header */}
      <motion.div
        className="flex items-center gap-3 my-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex-1 h-px bg-cream-3" />
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber/8 border border-amber/15">
          <Crown size={13} className="text-amber" />
          <span className="text-[13px] font-semibold text-amber uppercase tracking-wider">
            Espresso plan
          </span>
        </div>
        <div className="flex-1 h-px bg-cream-3" />
      </motion.div>

      {/* Espresso features — 3x2 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {espressoFeatures.map((f, index) => (
          <FeatureCard key={f.title} feature={f} index={index + 4} />
        ))}
      </div>

      {/* Link to full features page */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Link
          to="/features"
          className="inline-flex items-center gap-1.5 text-[15px] font-medium text-coffee hover:text-coffee-light no-underline transition-colors"
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
  feature: { icon: React.ReactNode; title: string; desc: string; accent: string };
  index: number;
}) {
  return (
    <motion.div
      className="group relative bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 cursor-default overflow-hidden shadow-[0_2px_12px_rgba(107,66,38,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-50 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: f.accent }}
      />

      <div className="flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ background: `${f.accent}12`, color: f.accent }}
        >
          {f.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[16px] font-semibold text-text-primary mb-1.5">
            {f.title}
          </h4>
          <p className="text-[14.5px] text-text-secondary leading-relaxed">
            {f.desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
