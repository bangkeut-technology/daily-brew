import {
  QrCode,
  Users,
  Clock,
  Coffee,
  Shield,
  LayoutDashboard,
  MapPin,
  CalendarDays,
} from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <QrCode size={22} strokeWidth={1.8} />,
    title: 'QR check-in',
    desc: 'Each employee gets a unique QR code. Staff scan with any phone browser — no app needed, no login required.',
    accent: '#C17F3B',
  },
  {
    icon: <Users size={22} strokeWidth={1.8} />,
    title: 'Employee management',
    desc: 'Add staff, assign them to shifts, generate QR codes, and track their attendance history in one place.',
    accent: '#4A7C59',
  },
  {
    icon: <Clock size={22} strokeWidth={1.8} />,
    title: 'Shift tracking',
    desc: 'Define morning, evening, or custom shifts. Late arrivals and early departures are flagged automatically.',
    accent: '#3B6FA0',
  },
  {
    icon: <Coffee size={22} strokeWidth={1.8} />,
    title: 'Leave requests',
    desc: 'Staff submit leave from their phone. Owners approve or reject with one tap from the dashboard.',
    accent: '#6B4226',
    brewPlus: true,
  },
  {
    icon: <Shield size={22} strokeWidth={1.8} />,
    title: 'IP restriction',
    desc: 'Lock check-ins to your restaurant Wi-Fi. Prevent staff from punching in from home.',
    accent: '#C0392B',
    brewPlus: true,
  },
  {
    icon: <LayoutDashboard size={22} strokeWidth={1.8} />,
    title: 'Real-time dashboard',
    desc: "See who's present, who's late, who's on leave, and who's absent — all at a glance, updated live.",
    accent: '#9B6B45',
  },
  {
    icon: <MapPin size={22} strokeWidth={1.8} />,
    title: 'Geofencing',
    desc: 'Restrict check-ins to a geographic area around your restaurant. Ensure staff are physically on-site.',
    accent: '#7C5C9B',
    brewPlus: true,
  },
  {
    icon: <CalendarDays size={22} strokeWidth={1.8} />,
    title: 'Per-day shift schedules',
    desc: 'Set different shift hours for each day of the week. Perfect for restaurants with varying opening times.',
    accent: '#3B6FA0',
    brewPlus: true,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-6 md:px-8 max-w-5xl mx-auto">
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[11px] uppercase tracking-[2px] font-medium text-amber mb-3">
          Features
        </p>
        <h3 className="text-[28px] md:text-[34px] font-semibold text-text-primary font-serif leading-tight">
          Everything your restaurant needs
        </h3>
        <p className="text-[14px] text-text-secondary mt-3 max-w-md mx-auto">
          Built for restaurant owners who want clarity without complexity.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((f, index) => (
          <motion.div
            key={f.title}
            className="group relative bg-white/60 backdrop-blur-md border border-white/85 rounded-2xl p-6 cursor-default overflow-hidden shadow-[0_2px_12px_rgba(107,66,38,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
          >
            {/* Hover glow */}
            <div
              className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-xl"
              style={{ background: `${f.accent}10` }}
            />

            {/* Top accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] opacity-60 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: f.accent }}
            />

            <div
              className="relative w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110"
              style={{ background: `${f.accent}15`, color: f.accent }}
            >
              {f.icon}
            </div>
            <div className="relative flex items-center gap-2 mb-2">
              <h4 className="text-[14px] font-semibold text-text-primary">
                {f.title}
              </h4>
              {f.brewPlus && (
                <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber/10 text-amber">
                  Brew+
                </span>
              )}
            </div>
            <p className="relative text-[12.5px] text-text-secondary leading-relaxed">
              {f.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
