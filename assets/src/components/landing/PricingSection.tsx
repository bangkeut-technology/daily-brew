import { Link } from '@tanstack/react-router';
import { Check, Crown, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const freePlan = {
  name: 'Free',
  price: '$0',
  period: 'forever',
  subtitle: 'For small teams getting started',
  features: [
    'Up to 5 employees',
    'QR check-in',
    'Shift tracking',
    'Closure periods',
    'Basic dashboard',
  ],
};

const brewPlusPlan = {
  name: 'Brew+',
  monthly: { price: '$12.99', period: '/month' },
  yearly: { price: '$129', period: '/year', savings: 'Save $26.88' },
  subtitle: 'For growing restaurants',
  features: [
    'Everything in Free',
    'Unlimited employees',
    'Leave request management',
    'IP restriction',
    'Geofencing for check-in',
    'Per-day shift schedules',
    'Priority support',
  ],
};

export function PricingSection() {
  const [yearly, setYearly] = useState(true);
  const pricing = yearly ? brewPlusPlan.yearly : brewPlusPlan.monthly;

  return (
    <section id="pricing" className="py-20 px-6 md:px-8 max-w-4xl mx-auto">
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[11px] uppercase tracking-[2px] font-medium text-amber mb-3">
          Pricing
        </p>
        <h3 className="text-[28px] md:text-[34px] font-semibold text-text-primary font-serif leading-tight">
          Simple, transparent pricing
        </h3>
        <p className="text-[14px] text-text-secondary mt-3 max-w-md mx-auto">
          Start free. Upgrade when you need more.
        </p>
      </motion.div>

      {/* Billing toggle */}
      <motion.div
        className="flex items-center justify-center gap-3 mb-10"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="relative flex bg-[#EBE2D6] rounded-full p-0.5">
          {/* Sliding pill background */}
          <div
            className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-[#6B4226] shadow-sm transition-all duration-300 ease-in-out"
            style={{ left: yearly ? 'calc(50% + 2px)' : '2px' }}
          />
          <button
            onClick={() => setYearly(false)}
            className={`relative z-10 px-5 py-1.5 rounded-full text-[13px] font-medium border-none cursor-pointer bg-transparent transition-colors duration-300 ${
              !yearly ? 'text-white' : 'text-text-secondary'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`relative z-10 px-5 py-1.5 rounded-full text-[13px] font-medium border-none cursor-pointer bg-transparent transition-colors duration-300 ${
              yearly ? 'text-white' : 'text-text-secondary'
            }`}
          >
            Yearly
          </button>
        </div>
        {yearly && (
          <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-[#4A7C59]/10 text-[#4A7C59]">
            {brewPlusPlan.yearly.savings}
          </span>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Free plan */}
        <motion.div
          className="relative bg-white/60 backdrop-blur-md border border-white/85 rounded-2xl p-7 flex flex-col overflow-hidden shadow-[0_2px_12px_rgba(107,66,38,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p className="text-[13px] font-semibold text-text-primary mb-1">
            {freePlan.name}
          </p>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-[36px] font-bold text-text-primary tracking-tight">
              {freePlan.price}
            </span>
            <span className="text-[13px] text-text-tertiary">
              {freePlan.period}
            </span>
          </div>
          <p className="text-[12px] text-text-secondary mb-6">
            {freePlan.subtitle}
          </p>
          <ul className="space-y-3 mb-8 flex-1">
            {freePlan.features.map((f, i) => (
              <motion.li
                key={f}
                className="flex items-start gap-2.5"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
              >
                <Check size={15} className="text-green mt-0.5 shrink-0" strokeWidth={2.5} />
                <span className="text-[13px] text-text-secondary">{f}</span>
              </motion.li>
            ))}
          </ul>
          <Link
            to="/sign-up"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-medium bg-white/60 backdrop-blur-sm text-text-primary border border-cream-3 cursor-pointer transition-all duration-150 hover:bg-cream-3 no-underline"
          >
            Get started
          </Link>
        </motion.div>

        {/* Brew+ plan */}
        <motion.div
          className="group relative bg-white/60 backdrop-blur-md border border-white/85 rounded-2xl p-7 pt-10 flex flex-col overflow-visible shadow-[0_2px_12px_rgba(107,66,38,0.05)] ring-2 ring-amber/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(193,127,59,0.18)]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Hover glow */}
          <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-[#C17F3B]/20 via-transparent to-[#E8A85A]/20 blur-sm" />

          {/* Popular badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <span className="relative text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-amber text-white shadow-[0_2px_8px_rgba(193,127,59,0.3)]">
              Most popular
              <span className="absolute inset-0 rounded-full bg-amber animate-ping opacity-20" />
            </span>
          </div>

          {/* Accent bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#E8A85A] via-[#C17F3B] to-[#6B4226] opacity-80 rounded-t-2xl" />

          <div className="relative flex items-center gap-2 mb-1">
            <p className="text-[13px] font-semibold text-text-primary">
              {brewPlusPlan.name}
            </p>
            <Crown size={14} className="text-amber" />
          </div>
          <div className="relative flex items-baseline gap-1 mb-1">
            <span className="text-[36px] font-bold text-text-primary tracking-tight transition-all">
              {pricing.price}
            </span>
            <span className="text-[13px] text-text-tertiary">
              {pricing.period}
            </span>
          </div>
          {yearly && (
            <p className="relative text-[11px] text-[#4A7C59] font-medium mb-4">
              That's just $10.75/month
            </p>
          )}
          <p className="relative text-[12px] text-text-secondary mb-6">
            {brewPlusPlan.subtitle}
          </p>
          <ul className="relative space-y-3 mb-8 flex-1">
            {brewPlusPlan.features.map((f, i) => (
              <motion.li
                key={f}
                className="flex items-start gap-2.5"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
              >
                <Check size={15} className="text-green mt-0.5 shrink-0" strokeWidth={2.5} />
                <span className="text-[13px] text-text-secondary">{f}</span>
              </motion.li>
            ))}
          </ul>
          <Link
            to="/sign-up"
            className="relative btn-shimmer flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-white border-none cursor-pointer transition-all duration-150 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)] no-underline"
          >
            Start with Brew+
            <ChevronRight size={14} />
          </Link>
        </motion.div>
      </div>

      <motion.p
        className="text-center text-[12px] text-text-tertiary mt-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        No credit card required to start. Upgrade anytime from your dashboard.
      </motion.p>
    </section>
  );
}
