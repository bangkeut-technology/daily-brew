import { Link } from '@tanstack/react-router';
import { Check, X, Crown, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const freePlan = {
  name: 'Free',
  price: '$0',
  period: 'forever',
  subtitle: 'For small teams getting started',
  features: [
    { text: 'Up to 10 employees', included: true },
    { text: 'Workspace QR code check-in', included: true },
    { text: 'Shift management', included: true },
    { text: 'Closure periods', included: true },
    { text: 'Owner & employee dashboard', included: true },
    { text: 'Attendance log', included: true },
    { text: 'Dark mode', included: true },
    { text: 'Multi-language (EN/FR/KM)', included: true },
    { text: 'Leave requests', included: false },
    { text: 'IP restriction', included: false },
    { text: 'Geofencing', included: false },
  ],
};

const espressoPlan = {
  name: 'Espresso',
  monthly: { price: '$14.99', period: '/month' },
  yearly: { price: '$149', period: '/year', savings: 'Save $30.88', monthly: '$12.42' },
  subtitle: 'For growing restaurants',
  features: [
    { text: 'Up to 20 employees', included: true },
    { text: 'Everything in Free', included: true },
    { text: 'Leave request management', included: true },
    { text: 'IP restriction for check-in & out', included: true },
    { text: 'Device verification for check-in & out', included: true },
    { text: 'Geofencing for check-in & out', included: true },
    { text: 'Per-day shift schedules', included: true },
    { text: 'Manager role (up to 2)', included: true },
    { text: 'BasilBook integration + API', included: true },
    { text: 'Push & email notifications', included: true },
    { text: 'Daily attendance summary', included: true },
    { text: '14-day free trial', included: true },
  ],
};

const doubleEspressoPlan = {
  name: 'Double Espresso',
  monthly: { price: '$39.99', period: '/month' },
  yearly: { price: '$399', period: '/year', savings: 'Save $80.88', monthly: '$33.25' },
  subtitle: 'For large operations',
  features: [
    { text: 'Unlimited employees', included: true },
    { text: 'Everything in Espresso', included: true },
    { text: 'Unlimited managers', included: true },
    { text: 'Priority support', included: true },
    { text: 'Multiple QR stations', included: true, roadmap: true },
    { text: 'Per-QR geofence & settings', included: true, roadmap: true },
    { text: 'Employee assignment per QR', included: true, roadmap: true },
    { text: 'Manager role', included: true, roadmap: true },
    { text: 'White-label branding', included: true, roadmap: true },
  ],
};

export function PricingSection() {
  const [yearly, setYearly] = useState(true);
  const espressoPricing = yearly ? espressoPlan.yearly : espressoPlan.monthly;
  const doublePricing = yearly ? doubleEspressoPlan.yearly : doubleEspressoPlan.monthly;

  return (
    <section id="pricing" className="py-24 px-6 md:px-8 max-w-5xl mx-auto">
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
          Pricing
        </p>
        <h3 className="text-[30px] md:text-[36px] font-semibold text-text-primary font-serif leading-tight">
          Simple, transparent pricing
        </h3>
        <p className="text-[16px] text-text-secondary mt-3 max-w-md mx-auto">
          Start free. Upgrade when you need more.
        </p>
      </motion.div>

      {/* Billing toggle */}
      <motion.div
        className="flex items-center justify-center gap-3 mb-12"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="relative flex bg-cream-3/70 rounded-full p-0.5">
          <div
            className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-coffee shadow-sm transition-all duration-300 ease-in-out"
            style={{ left: yearly ? 'calc(50% + 2px)' : '2px' }}
          />
          <button
            onClick={() => setYearly(false)}
            className={cn(
              'relative z-10 px-5 py-1.5 rounded-full text-[15px] font-medium border-none cursor-pointer bg-transparent transition-colors duration-300',
              !yearly ? 'text-white' : 'text-text-secondary'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={cn(
              'relative z-10 px-5 py-1.5 rounded-full text-[15px] font-medium border-none cursor-pointer bg-transparent transition-colors duration-300',
              yearly ? 'text-white' : 'text-text-secondary'
            )}
          >
            Yearly
          </button>
        </div>
        {yearly ? (
          <motion.span
            className="text-[12.5px] font-semibold px-2.5 py-0.5 rounded-full bg-green/10 text-green"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            Save with yearly billing
          </motion.span>
        ) : (
          <motion.button
            onClick={() => setYearly(true)}
            className="text-[13px] font-medium text-amber cursor-pointer bg-transparent border-none hover:underline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Switch to yearly and save
          </motion.button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Free plan */}
        <motion.div
          className="relative bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-7 flex flex-col overflow-hidden shadow-[0_2px_12px_rgba(107,66,38,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p className="text-[16px] font-semibold text-text-primary mb-1">
            {freePlan.name}
          </p>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-[42px] font-bold text-text-primary tracking-tight">
              {freePlan.price}
            </span>
            <span className="text-[15px] text-text-tertiary">
              {freePlan.period}
            </span>
          </div>
          <p className="text-[14.5px] text-text-secondary mb-7">
            {freePlan.subtitle}
          </p>

          <ul className="space-y-3 mb-8 flex-1">
            {freePlan.features.map((f) => (
              <li key={f.text} className="flex items-center gap-2.5">
                {f.included ? (
                  <Check size={15} className="text-green shrink-0" strokeWidth={2.5} />
                ) : (
                  <X size={15} className="text-text-tertiary/50 shrink-0" strokeWidth={2} />
                )}
                <span
                  className={cn('text-[15px]', f.included ? 'text-text-secondary' : 'text-text-tertiary')}
                >
                  {f.text}
                </span>
              </li>
            ))}
          </ul>

          <Link
            to="/sign-up"
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-[15px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 cursor-pointer transition-all duration-150 hover:bg-cream-3 no-underline"
          >
            Get started
          </Link>
        </motion.div>

        {/* Espresso plan */}
        <motion.div
          className="group relative bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-7 pt-10 flex flex-col overflow-visible shadow-[0_2px_12px_rgba(107,66,38,0.05)] ring-2 ring-amber/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(193,127,59,0.15)]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Popular badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <span className="text-[12px] font-semibold uppercase tracking-wider px-3.5 py-1 rounded-full bg-amber text-white shadow-[0_2px_8px_rgba(193,127,59,0.3)]">
              Most popular
            </span>
          </div>

          {/* Accent bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-light via-amber to-coffee opacity-80 rounded-t-2xl" />

          <div className="relative flex items-center gap-2 mb-1">
            <p className="text-[16px] font-semibold text-text-primary">
              {espressoPlan.name}
            </p>
            <Crown size={14} className="text-amber" />
          </div>
          <div className="relative flex items-baseline gap-1 mb-1">
            <span className="text-[42px] font-bold text-text-primary tracking-tight">
              {espressoPricing.price}
            </span>
            <span className="text-[15px] text-text-tertiary">
              {espressoPricing.period}
            </span>
          </div>
          {yearly && (
            <p className="relative text-[13.5px] text-green font-medium mb-3">
              That's just ${espressoPlan.yearly.monthly}/month
            </p>
          )}
          <p className="relative text-[14.5px] text-text-secondary mb-7">
            {espressoPlan.subtitle}
          </p>

          <ul className="relative space-y-3 mb-8 flex-1">
            {espressoPlan.features.map((f) => (
              <li key={f.text} className="flex items-center gap-2.5">
                <Check size={15} className="text-green shrink-0" strokeWidth={2.5} />
                <span className="text-[15px] text-text-secondary">{f.text}</span>
              </li>
            ))}
          </ul>

          <Link
            to="/sign-up"
            className="relative btn-shimmer flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-[15px] font-semibold text-white border-none cursor-pointer transition-all duration-150 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)] no-underline"
          >
            Start with Espresso
            <ChevronRight size={14} />
          </Link>
        </motion.div>

        {/* Double Espresso plan */}
        <motion.div
          className="relative bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-7 pt-10 flex flex-col overflow-visible shadow-[0_2px_12px_rgba(107,66,38,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Coming soon badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <span className="text-[12px] font-semibold uppercase tracking-wider px-3.5 py-1 rounded-full bg-text-tertiary text-white shadow-[0_2px_8px_rgba(174,157,149,0.3)]">
              Coming soon
            </span>
          </div>

          {/* Accent bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-coffee via-coffee-light to-amber opacity-60 rounded-t-2xl" />

          <div className="relative flex items-center gap-2 mb-1">
            <p className="text-[16px] font-semibold text-text-primary">
              {doubleEspressoPlan.name}
            </p>
            <Crown size={14} className="text-coffee" />
          </div>
          <div className="relative flex items-baseline gap-1 mb-1">
            <span className="text-[42px] font-bold text-text-primary tracking-tight">
              {doublePricing.price}
            </span>
            <span className="text-[15px] text-text-tertiary">
              {doublePricing.period}
            </span>
          </div>
          {yearly && (
            <p className="relative text-[13.5px] text-green font-medium mb-3">
              That's just ${doubleEspressoPlan.yearly.monthly}/month
            </p>
          )}
          <p className="relative text-[14.5px] text-text-secondary mb-7">
            {doubleEspressoPlan.subtitle}
          </p>

          <ul className="relative space-y-3 mb-8 flex-1">
            {doubleEspressoPlan.features.map((f) => (
              <li key={f.text} className="flex items-center gap-2.5">
                <Check size={15} className={cn('shrink-0', f.roadmap ? 'text-text-tertiary' : 'text-green')} strokeWidth={2.5} />
                <span className={cn('text-[15px]', f.roadmap ? 'text-text-tertiary' : 'text-text-secondary')}>
                  {f.text}
                  {f.roadmap && (
                    <span className="ml-1.5 text-[11px] font-medium px-1.5 py-px rounded-full bg-cream-3/60 text-text-tertiary">
                      Roadmap
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          <button
            disabled
            className="relative flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-[15px] font-medium bg-cream-3/60 text-text-tertiary border border-cream-3 cursor-not-allowed no-underline"
          >
            Coming soon
          </button>
        </motion.div>
      </div>

      <motion.p
        className="text-center text-[14px] text-text-tertiary mt-8"
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
