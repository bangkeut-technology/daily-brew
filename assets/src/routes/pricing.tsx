import { createFileRoute } from '@tanstack/react-router';
import { Check, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { LandingNav } from '@/components/landing/LandingNav';
import { PricingSection } from '@/components/landing/PricingSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
});

const comparisonRows = [
  { feature: 'Employees', free: 'Up to 5', brew: 'Unlimited' },
  { feature: 'QR check-in', free: true, brew: true },
  { feature: 'Shift tracking', free: true, brew: true },
  { feature: 'Closures', free: true, brew: true },
  { feature: 'Dashboard', free: true, brew: true },
  { feature: 'Leave requests', free: false, brew: true },
  { feature: 'IP restriction', free: false, brew: true },
  { feature: 'Geofencing', free: false, brew: true },
  { feature: 'Per-day schedules', free: false, brew: true },
  { feature: 'Priority support', free: false, brew: true },
];

const faqItems = [
  {
    question: 'Can I switch plans anytime?',
    answer:
      'Yes, you can upgrade or downgrade your plan at any time from your dashboard Settings. Changes take effect immediately.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We use Paddle as our payment provider, which supports credit cards, debit cards, and PayPal.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'The Free plan is free forever with no time limit. If you want to try Brew+, you get a 14-day free trial with full access to all features.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes, there are no contracts or lock-in periods. You can cancel your Brew+ subscription at any time and continue using the Free plan.',
  },
];

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return (
      <span className="text-[13px] font-medium text-text-primary">{value}</span>
    );
  }
  return value ? (
    <Check size={16} className="text-green" strokeWidth={2.5} />
  ) : (
    <X size={16} className="text-text-tertiary" strokeWidth={2} />
  );
}

function FaqItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      className="bg-white/60 backdrop-blur-md border border-white/85 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(107,66,38,0.05)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(107,66,38,0.08)]"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left bg-transparent border-none cursor-pointer"
      >
        <span className="text-[14px] font-medium text-text-primary pr-4">
          {question}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown size={16} className="text-text-tertiary" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4">
              <p className="text-[13px] text-text-secondary leading-relaxed">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />

      <main className="page-enter pt-20">
        <PricingSection />

        {/* Comparison table */}
        <section className="py-16 px-6 md:px-8 max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] uppercase tracking-[2px] font-medium text-amber mb-3">
              Compare
            </p>
            <h3 className="text-[28px] md:text-[34px] font-semibold text-text-primary font-serif leading-tight">
              Feature comparison
            </h3>
            <p className="text-[14px] text-text-secondary mt-3 max-w-md mx-auto">
              See exactly what you get with each plan.
            </p>
          </motion.div>

          <motion.div
            className="bg-white/60 backdrop-blur-md border border-white/85 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Header */}
            <div className="grid grid-cols-3 px-6 py-4 border-b border-cream-3/60">
              <span className="text-[11px] uppercase tracking-[1.5px] font-medium text-text-tertiary">
                Feature
              </span>
              <span className="text-[11px] uppercase tracking-[1.5px] font-medium text-text-tertiary text-center">
                Free
              </span>
              <span className="text-[11px] uppercase tracking-[1.5px] font-medium text-amber text-center">
                Brew+
              </span>
            </div>

            {/* Rows */}
            {comparisonRows.map((row, i) => (
              <motion.div
                key={row.feature}
                className={`grid grid-cols-3 px-6 py-3.5 items-center transition-colors duration-120 hover:bg-cream-3/20 ${
                  i < comparisonRows.length - 1
                    ? 'border-b border-cream-3/40'
                    : ''
                }`}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.15 + i * 0.03 }}
              >
                <span className="text-[13px] text-text-secondary">
                  {row.feature}
                </span>
                <span className="flex justify-center">
                  <CellValue value={row.free} />
                </span>
                <span className="flex justify-center">
                  <CellValue value={row.brew} />
                </span>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* FAQ section */}
        <section className="py-16 px-6 md:px-8 max-w-2xl mx-auto">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] uppercase tracking-[2px] font-medium text-amber mb-3">
              FAQ
            </p>
            <h3 className="text-[28px] md:text-[34px] font-semibold text-text-primary font-serif leading-tight">
              Billing questions
            </h3>
          </motion.div>

          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <FaqItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                index={i}
              />
            ))}
          </div>

          <motion.p
            className="text-center text-[12px] text-text-tertiary mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Still have questions?{' '}
            <a
              href="mailto:support@dailybrew.work"
              className="text-coffee font-medium no-underline hover:text-coffee-light transition-colors"
            >
              Reach out to us
            </a>
          </motion.p>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
