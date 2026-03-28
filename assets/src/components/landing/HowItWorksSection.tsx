import { QrCode, UserPlus, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    icon: <UserPlus size={24} strokeWidth={1.6} />,
    title: 'Add your team',
    desc: 'Create employee profiles and assign shifts. Each person gets a unique QR code automatically.',
    accent: '#4A7C59',
  },
  {
    number: '02',
    icon: <QrCode size={24} strokeWidth={1.6} />,
    title: 'Staff scan to check in',
    desc: 'Employees scan their QR code with any phone browser. No app download, no login — just one tap.',
    accent: '#C17F3B',
  },
  {
    number: '03',
    icon: <BarChart3 size={24} strokeWidth={1.6} />,
    title: 'Track everything',
    desc: 'See who\'s present, who\'s late, and who\'s on leave. All in real time from your dashboard.',
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
        <p className="text-[11px] uppercase tracking-[2px] font-medium text-amber mb-3">
          How it works
        </p>
        <h3 className="text-[28px] md:text-[34px] font-semibold text-text-primary font-serif leading-tight">
          Up and running in minutes
        </h3>
        <p className="text-[14px] text-text-secondary mt-3 max-w-md mx-auto">
          Three steps to effortless attendance tracking.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Connecting line (desktop) — centered on 72px icons = top 36px */}
        <div className="hidden md:block absolute top-[36px] left-[calc(16.67%+36px)] right-[calc(16.67%+36px)] h-px bg-cream-3" />

        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            className="relative flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
          >
            {/* Step circle */}
            <div className="relative mb-6">
              <div
                className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-transform duration-300 hover:scale-105"
                style={{ background: `${step.accent}12`, color: step.accent }}
              >
                {step.icon}
              </div>
              <span
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: step.accent }}
              >
                {step.number}
              </span>
            </div>

            <h4 className="text-[15px] font-semibold text-text-primary mb-2">
              {step.title}
            </h4>
            <p className="text-[13px] text-text-secondary leading-relaxed max-w-[260px]">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
