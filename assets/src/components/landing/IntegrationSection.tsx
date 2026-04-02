import { motion } from 'framer-motion';
import { ArrowRightLeft, FileText, Clock, ChevronRight, Crown } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { BasilBookBrand } from '@/components/shared/BasilBookBrand';

const benefits = [
  {
    icon: <ArrowRightLeft size={18} strokeWidth={1.8} />,
    title: 'Attendance synced to accounting',
    desc: 'Pulls attendance data via API — match who worked with what was sold.',
  },
  {
    icon: <FileText size={18} strokeWidth={1.8} />,
    title: 'Username-based staff linking',
    desc: 'Link employees across both systems with a shared username. One identity, two products.',
  },
  {
    icon: <Clock size={18} strokeWidth={1.8} />,
    title: 'Period-based data retrieval',
    desc: 'Query attendance by date range — daily, weekly, or monthly. Up to 93 days per request.',
  },
];

export function IntegrationSection() {
  return (
    <section className="py-24 px-6 md:px-8 max-w-5xl mx-auto">
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
          Integration
        </p>
        <h3 className="text-[30px] md:text-[36px] font-semibold text-text-primary font-serif leading-tight">
          Works with <BasilBookBrand />
        </h3>
        <p className="text-[16px] text-text-secondary mt-3 max-w-lg mx-auto">
          Connect staff attendance to your restaurant accounting.
          Know who worked, when they worked, and how it maps to your financials.
        </p>
      </motion.div>

      <motion.div
        className="relative bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#2bb673] via-[#36b9a0] to-amber opacity-70" />

        <div className="p-8 md:p-10">
          {/* Top: logos + connection */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
            {/* DailyBrew logo */}
            <div className="flex items-center gap-3">
              <img
                src="/logo-icon.svg"
                alt="DailyBrew"
                className="w-12 h-12 rounded-xl"
              />
              <div>
                <p className="text-[17px] font-semibold text-text-primary">DailyBrew</p>
                <p className="text-[13px] text-text-tertiary">Attendance</p>
              </div>
            </div>

            {/* Connection line */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-px bg-cream-3 hidden sm:block" />
              <div className="w-9 h-9 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center">
                <ArrowRightLeft size={16} className="text-amber" />
              </div>
              <div className="w-8 h-px bg-cream-3 hidden sm:block" />
            </div>

            {/* BasilBook logo */}
            <a
              href="https://basilbook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 no-underline transition-opacity hover:opacity-80"
            >
              <img
                src="/basilbook-logo.png"
                alt="BasilBook"
                className="w-12 h-12 rounded-xl"
              />
              <div>
                <p className="text-[17px]"><BasilBookBrand /></p>
                <p className="text-[13px] text-text-tertiary">Accounting</p>
              </div>
            </a>
          </div>

          {/* Benefits grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                className="flex flex-col gap-3 p-5 rounded-xl bg-cream/40 dark:bg-cream/5 border border-cream-3/40"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.15 + i * 0.08 }}
              >
                <div className="w-9 h-9 rounded-lg bg-amber/10 flex items-center justify-center text-amber">
                  {b.icon}
                </div>
                <h4 className="text-[15px] font-semibold text-text-primary leading-snug">
                  {b.title}
                </h4>
                <p className="text-[14px] text-text-secondary leading-relaxed">
                  {b.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* How it works strip */}
          <div className="flex flex-col sm:flex-row items-center gap-4 px-5 py-4 rounded-xl bg-cream-3/30 dark:bg-cream-3/10 border border-cream-3/40">
            <div className="flex-1">
              <p className="text-[14.5px] text-text-secondary leading-relaxed">
                <span className="font-medium text-text-primary">How it works:</span>{' '}
                Generate an API token in DailyBrew settings. <BasilBookBrand className="text-[14.5px]" /> uses it to pull attendance data
                for employees with matching usernames — check-in times, late flags, and shift info.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full bg-amber/10 text-amber border border-amber/15">
                <Crown size={11} />
                Espresso
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              to="/sign-up"
              className="btn-shimmer inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[15px] font-semibold text-white no-underline transition-all hover:-translate-y-px"
            >
              Get started with Espresso
              <ChevronRight size={14} />
            </Link>
            <a
              href="https://basilbook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[15px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 no-underline transition-all hover:bg-cream-3"
            >
              Learn about <BasilBookBrand className="text-[15px]" />
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
