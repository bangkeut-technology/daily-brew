import { createFileRoute } from '@tanstack/react-router';
import { Check, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { LandingNav } from '@/components/landing/LandingNav';
import { PricingSection } from '@/components/landing/PricingSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
});

const comparisonRows: { section?: string; feature: string; free: boolean | string; espresso: boolean | string; double: boolean | string }[] = [
  // Core
  { section: 'Core', feature: 'Employees', free: 'Up to 10', espresso: 'Up to 20', double: 'Unlimited' },
  { feature: 'Workspace QR code check-in', free: true, espresso: true, double: true },
  { feature: 'Shift management', free: true, espresso: true, double: true },
  { feature: 'Closure periods', free: true, espresso: true, double: true },
  { feature: 'Owner dashboard & stats', free: true, espresso: true, double: true },
  { feature: 'Employee dashboard', free: true, espresso: true, double: true },
  { feature: 'Attendance log', free: true, espresso: true, double: true },
  { feature: 'Dark mode', free: true, espresso: true, double: true },
  { feature: 'Multi-language (EN/FR/KM)', free: true, espresso: true, double: true },

  // Espresso+
  { section: 'Espresso features', feature: 'Leave request management', free: false, espresso: true, double: true },
  { feature: 'IP restriction for check-in & out', free: false, espresso: true, double: true },
  { feature: 'Device verification for check-in & out', free: false, espresso: true, double: true },
  { feature: 'Geofencing for check-in & out', free: false, espresso: true, double: true },
  { feature: 'Per-day shift schedules', free: false, espresso: true, double: true },
  { feature: 'BasilBook integration + API', free: false, espresso: true, double: true },
  { feature: 'Push & email notifications', free: false, espresso: true, double: true },
  { feature: 'Manager role', free: false, espresso: 'Up to 2', double: 'Unlimited' },
  { feature: 'Daily attendance summary', free: false, espresso: true, double: true },
  { feature: '14-day free trial', free: false, espresso: true, double: true },

  // Double Espresso
  { section: 'Double Espresso features', feature: 'Unlimited employees', free: false, espresso: false, double: true },
  { feature: 'Unlimited managers', free: false, espresso: false, double: true },
  { feature: 'Priority support', free: false, espresso: false, double: true },
  { feature: 'Multiple QR stations (roadmap)', free: false, espresso: false, double: true },
  { feature: 'Per-QR geofence & settings (roadmap)', free: false, espresso: false, double: true },
  { feature: 'Employee assignment per QR (roadmap)', free: false, espresso: false, double: true },
  { feature: 'White-label branding (roadmap)', free: false, espresso: false, double: true },
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
      'The Free plan is free forever with no time limit. If you want to try Espresso, you get a 14-day free trial with full access to all Espresso features.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes, there are no contracts or lock-in periods. You can cancel your Espresso subscription at any time and continue using the Free plan.',
  },
  {
    question: 'How does the BasilBook integration work?',
    answer:
      'With an Espresso or Double Espresso plan, you can generate an API token from your workspace settings. BasilBook uses this token to pull attendance data for employees that share a username across both systems. The API returns check-in/out times, late/early flags, and shift info for any date range.',
  },
];

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return (
      <span className="text-[15px] font-medium text-text-primary">{value}</span>
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
      className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(107,66,38,0.05)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(107,66,38,0.08)]"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left bg-transparent border-none cursor-pointer"
      >
        <span className="text-[16px] font-medium text-text-primary pr-4">
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
              <p className="text-[15px] text-text-secondary leading-relaxed">
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
      <PageSeo
        title="Pricing"
        description="DailyBrew plans start free for up to 10 employees. Espresso at $14.99/month adds geofencing, device verification, and leave management. Double Espresso for unlimited staff."
        path="/pricing"
      />
      <LandingNav />

      <main className="page-enter pt-20">
        <PricingSection />

        {/* Comparison table */}
        <section className="py-16 px-6 md:px-8 max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
              Compare
            </p>
            <h3 className="text-[30px] md:text-[36px] font-semibold text-text-primary font-serif leading-tight">
              Feature comparison
            </h3>
            <p className="text-[16px] text-text-secondary mt-3 max-w-md mx-auto">
              See exactly what you get with each plan.
            </p>
          </motion.div>

          <motion.div
            className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Header */}
            <div className="grid grid-cols-4 px-6 py-4 border-b border-cream-3/60">
              <span className="text-[13px] uppercase tracking-[1.5px] font-medium text-text-tertiary">
                Feature
              </span>
              <span className="text-[13px] uppercase tracking-[1.5px] font-medium text-text-tertiary text-center">
                Free
              </span>
              <span className="text-[13px] uppercase tracking-[1.5px] font-medium text-amber text-center">
                Espresso
              </span>
              <span className="text-[13px] uppercase tracking-[1.5px] font-medium text-coffee text-center">
                Double Espresso
              </span>
            </div>

            {/* Rows */}
            {comparisonRows.map((row, i) => (
              <div key={row.feature}>
                {row.section && (
                  <div className="px-6 pt-4 pb-2 border-b border-cream-3/40">
                    <span className="text-[12px] uppercase tracking-[1.5px] font-semibold text-text-tertiary">
                      {row.section}
                    </span>
                  </div>
                )}
              <motion.div
                className={cn(
                  'grid grid-cols-4 px-6 py-3.5 items-center transition-colors duration-120 hover:bg-cream-3/20',
                  i < comparisonRows.length - 1 && 'border-b border-cream-3/40'
                )}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.15 + i * 0.03 }}
              >
                <span className="text-[15px] text-text-secondary">
                  {row.feature}
                </span>
                <span className="flex justify-center">
                  <CellValue value={row.free} />
                </span>
                <span className="flex justify-center">
                  <CellValue value={row.espresso} />
                </span>
                <span className="flex justify-center">
                  <CellValue value={row.double} />
                </span>
              </motion.div>
              </div>
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
            <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
              FAQ
            </p>
            <h3 className="text-[30px] md:text-[36px] font-semibold text-text-primary font-serif leading-tight">
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
            className="text-center text-[14px] text-text-tertiary mt-8"
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
