import { createFileRoute } from '@tanstack/react-router';
import { Check, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { LandingNav } from '@/components/landing/LandingNav';
import { PricingSection } from '@/components/landing/PricingSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';
import { BasilBookBrand } from '@/components/shared/BasilBookBrand';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
});

interface ComparisonRow {
  /** When set, render a section header above this row. */
  sectionKey?: string;
  /** i18n key under `routes.pricing.comparison.rows.<key>.label`. */
  key: string;
  /** Use the BasilBook brand wordmark inside the label via <Trans>. */
  brandLabel?: boolean;
  /** Cell value: true = ✓, false = ✗, string = literal text shown as-is. */
  free: boolean | string;
  espresso: boolean | string;
  double: boolean | string;
}

const comparisonRows: ComparisonRow[] = [
  // Core
  { sectionKey: 'core',    key: 'employees',         free: 'Up to 10', espresso: 'Up to 20', double: 'Unlimited' },
  { key: 'qrCheckin',      free: true, espresso: true, double: true },
  { key: 'shifts',         free: true, espresso: true, double: true },
  { key: 'closures',       free: true, espresso: true, double: true },
  { key: 'ownerDashboard', free: true, espresso: true, double: true },
  { key: 'employeeDashboard', free: true, espresso: true, double: true },
  { key: 'attendanceLog',  free: true, espresso: true, double: true },
  { key: 'darkMode',       free: true, espresso: true, double: true },
  { key: 'multiLang',      free: true, espresso: true, double: true },

  // Espresso
  { sectionKey: 'espresso', key: 'leaveRequests',       free: false, espresso: true, double: true },
  { key: 'ipRestriction',         free: false, espresso: true, double: true },
  { key: 'deviceVerification',    free: false, espresso: true, double: true },
  { key: 'geofencing',            free: false, espresso: true, double: true },
  { key: 'perDaySchedules',       free: false, espresso: true, double: true },
  { key: 'basilbook',             brandLabel: true, free: false, espresso: true, double: true },
  { key: 'notifications',         free: false, espresso: true, double: true },
  { key: 'manager',               free: false, espresso: 'Up to 2', double: 'Unlimited' },
  { key: 'dailySummary',          free: false, espresso: true, double: true },
  { key: 'trial14',               free: false, espresso: true, double: true },

  // Double Espresso
  { sectionKey: 'doubleEspresso', key: 'unlimitedEmployees', free: false, espresso: false, double: true },
  { key: 'unlimitedManagers',     free: false, espresso: false, double: true },
  { key: 'prioritySupport',       free: false, espresso: false, double: true },
  { key: 'multipleQrStations',    free: false, espresso: false, double: true },
  { key: 'perQrGeofence',         free: false, espresso: false, double: true },
  { key: 'perQrAssignment',       free: false, espresso: false, double: true },
  { key: 'whiteLabel',            free: false, espresso: false, double: true },
];

const faqKeys = ['switchPlans', 'paymentMethods', 'freeTrial', 'cancelAnytime', 'basilbook'];

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
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col">
      <PageSeo
        title="Pricing"
        description="DailyBrew plans start free for up to 10 active employees. Espresso at $19.99/month adds geofencing, device verification, and leave management. Double Espresso for unlimited staff."
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
              {t('routes.pricing.comparison.eyebrow')}
            </p>
            <h3 className="text-[30px] md:text-[36px] font-semibold text-text-primary font-serif leading-tight">
              {t('routes.pricing.comparison.title')}
            </h3>
            <p className="text-[16px] text-text-secondary mt-3 max-w-md mx-auto">
              {t('routes.pricing.comparison.subtitle')}
            </p>
          </motion.div>

          <motion.div
            className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="grid grid-cols-4 px-6 py-4 border-b border-cream-3/60">
              <span className="text-[13px] uppercase tracking-[1.5px] font-medium text-text-tertiary">
                {t('routes.pricing.comparison.headers.feature')}
              </span>
              <span className="text-[13px] uppercase tracking-[1.5px] font-medium text-text-tertiary text-center">
                {t('pricing.free.name')}
              </span>
              <span className="text-[13px] uppercase tracking-[1.5px] font-medium text-amber text-center">
                {t('pricing.espresso.name')}
              </span>
              <span className="text-[13px] uppercase tracking-[1.5px] font-medium text-coffee text-center">
                {t('pricing.doubleEspresso.name')}
              </span>
            </div>

            {comparisonRows.map((row, i) => (
              <div key={row.key}>
                {row.sectionKey && (
                  <div className="px-6 pt-4 pb-2 border-b border-cream-3/40">
                    <span className="text-[12px] uppercase tracking-[1.5px] font-semibold text-text-tertiary">
                      {t(`routes.pricing.comparison.sections.${row.sectionKey}`)}
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
                    {row.brandLabel ? (
                      // "<brand></brand> integration + API"
                      <Trans
                        i18nKey={`routes.pricing.comparison.rows.${row.key}.label`}
                        components={{ brand: <BasilBookBrand className="text-[15px]" /> }}
                      />
                    ) : (
                      t(`routes.pricing.comparison.rows.${row.key}.label`)
                    )}
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
              {t('routes.pricing.faq.eyebrow')}
            </p>
            <h3 className="text-[30px] md:text-[36px] font-semibold text-text-primary font-serif leading-tight">
              {t('routes.pricing.faq.title')}
            </h3>
          </motion.div>

          <div className="space-y-3">
            {faqKeys.map((key, i) => (
              <FaqItem
                key={key}
                question={t(`routes.pricing.faq.items.${key}.question`)}
                answer={t(`routes.pricing.faq.items.${key}.answer`)}
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
            {t('routes.pricing.faq.stillHaveQuestions')}{' '}
            <a
              href="mailto:support@mail.dailybrew.work"
              className="text-coffee font-medium no-underline hover:text-coffee-light transition-colors"
            >
              {t('routes.pricing.faq.reachOut')}
            </a>
          </motion.p>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
