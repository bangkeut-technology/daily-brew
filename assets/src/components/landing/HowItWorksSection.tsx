import { Link } from '@tanstack/react-router';
import { Building2, UserPlus, QrCode, BarChart3, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    icon: <Building2 size={24} strokeWidth={1.6} />,
    title: 'Create your workspace',
    desc: 'Sign up, name your restaurant, and a unique QR code is generated for your workspace instantly.',
    accent: '#6B4226',
  },
  {
    number: '02',
    icon: <UserPlus size={24} strokeWidth={1.6} />,
    title: 'Add your team',
    desc: 'Create employee profiles and assign shifts. Morning, evening, or custom — you define the schedule.',
    accent: '#4A7C59',
  },
  {
    number: '03',
    icon: <QrCode size={24} strokeWidth={1.6} />,
    title: 'Staff scan to check in',
    desc: 'Display the QR code at your restaurant. Employees scan it to check in and out — one tap each way.',
    accent: '#C17F3B',
  },
  {
    number: '04',
    icon: <BarChart3 size={24} strokeWidth={1.6} />,
    title: 'Track everything live',
    desc: 'See who is present, late, on leave, or absent. Late arrivals and early departures are flagged automatically.',
    accent: '#3B6FA0',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 px-6 md:px-8 max-w-5xl mx-auto">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
          How it works
        </p>
        <h3 className="text-[30px] md:text-[36px] font-semibold text-text-primary font-serif leading-tight">
          Up and running in minutes
        </h3>
        <p className="text-[16px] text-text-secondary mt-3 max-w-md mx-auto">
          Four steps from sign-up to live attendance tracking. No hardware needed.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {/* Connecting line (desktop) */}
        <div className="hidden lg:block absolute top-[36px] left-[calc(12.5%+36px)] right-[calc(12.5%+36px)] h-px bg-cream-3" />

        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            className="relative flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
          >
            {/* Step circle */}
            <div className="relative mb-5">
              <div
                className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-transform duration-300 hover:scale-105"
                style={{ background: `${step.accent}12`, color: step.accent }}
              >
                {step.icon}
              </div>
              <span
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold text-white"
                style={{ background: step.accent }}
              >
                {step.number}
              </span>
            </div>

            <h4 className="text-[16px] font-semibold text-text-primary mb-2">
              {step.title}
            </h4>
            <p className="text-[14.5px] text-text-secondary leading-relaxed max-w-[240px]">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Link
          to="/how-it-works"
          className="inline-flex items-center gap-1.5 text-[15px] font-medium text-coffee hover:text-coffee-light no-underline transition-colors"
        >
          Learn more about how it works
          <ChevronRight size={14} />
        </Link>
      </motion.div>
    </section>
  );
}
