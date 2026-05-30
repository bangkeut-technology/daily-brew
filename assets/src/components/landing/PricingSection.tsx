import { Link } from '@tanstack/react-router';
import { Check, X, Crown, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { BasilBookBrand } from '@/components/shared/BasilBookBrand';

/**
 * Plan tiers. Prices, currencies, and savings keep their numeric values
 * inline (they read the same across all locales we ship). Plan names,
 * feature lists, subtitles, and CTAs come from `pricing.*` so a single
 * translation block powers both this homepage section and a future
 * standalone /pricing page.
 */
const freePlan = {
  price: '$0',
  features: ['employees10', 'qrCheckIn', 'shifts', 'closures', 'dashboard', 'log', 'darkMode', 'multiLang', 'leaveRequests', 'ipRestriction', 'geofencing'] as const,
  // Sub-set of features that are *included* in Free (rest get an X).
  included: new Set(['employees10', 'qrCheckIn', 'shifts', 'closures', 'dashboard', 'log', 'darkMode', 'multiLang']),
};

const espressoPlan = {
  monthly: { price: '$19.99' },
  yearly: { price: '$199', monthlyEquivalent: '$16.58' },
  features: ['employees20', 'everythingFree', 'leaveRequests', 'ipRestriction', 'deviceVerification', 'geofencing', 'perDaySchedules', 'manager', 'basilbook', 'notifications', 'dailySummary', 'trial14'] as const,
};

const doubleEspressoPlan = {
  monthly: { price: '$39.99' },
  yearly: { price: '$399', monthlyEquivalent: '$33.25' },
  features: ['unlimitedEmployees', 'everythingEspresso', 'unlimitedManagers', 'prioritySupport', 'multipleQrStations', 'perQrGeofence', 'perQrAssignment', 'perQrManager'] as const,
  // No roadmap-flagged items right now — every listed feature is live.
  // whiteLabel was dropped from the pitch in #248 (never built, no scoped
  // plan). If it ever lands, add it back here without the roadmap pill.
  roadmap: new Set<string>(),
};

export function PricingSection() {
  const [yearly, setYearly] = useState(true);
  const { t } = useTranslation();
  const espressoPricing = yearly ? espressoPlan.yearly : espressoPlan.monthly;
  const doublePricing = yearly ? doubleEspressoPlan.yearly : doubleEspressoPlan.monthly;
  const period = yearly ? t('pricing.period.year') : t('pricing.period.month');

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
          {t('pricing.eyebrow')}
        </p>
        <h3 className="text-[30px] md:text-[36px] font-semibold text-text-primary font-serif leading-tight">
          {t('pricing.title')}
        </h3>
        <p className="text-[16px] text-text-secondary mt-3 max-w-md mx-auto">
          {t('pricing.subtitle')}
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
            {t('pricing.toggle.monthly')}
          </button>
          <button
            onClick={() => setYearly(true)}
            className={cn(
              'relative z-10 px-5 py-1.5 rounded-full text-[15px] font-medium border-none cursor-pointer bg-transparent transition-colors duration-300',
              yearly ? 'text-white' : 'text-text-secondary'
            )}
          >
            {t('pricing.toggle.yearly')}
          </button>
        </div>
        {yearly ? (
          <motion.span
            className="text-[12.5px] font-semibold px-2.5 py-0.5 rounded-full bg-green/10 text-green"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {t('pricing.toggle.yearlyBadge')}
          </motion.span>
        ) : (
          <motion.button
            onClick={() => setYearly(true)}
            className="text-[13px] font-medium text-amber cursor-pointer bg-transparent border-none hover:underline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {t('pricing.toggle.switchHint')}
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
            {t('pricing.free.name')}
          </p>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-[42px] font-bold text-text-primary tracking-tight">
              {freePlan.price}
            </span>
            <span className="text-[15px] text-text-tertiary">
              {t('pricing.free.period')}
            </span>
          </div>
          <p className="text-[14.5px] text-text-secondary mb-7">
            {t('pricing.free.subtitle')}
          </p>

          <ul className="space-y-3 mb-8 flex-1">
            {freePlan.features.map((key) => {
              const included = freePlan.included.has(key);
              return (
                <li key={key} className="flex items-center gap-2.5">
                  {included ? (
                    <Check size={15} className="text-green shrink-0" strokeWidth={2.5} />
                  ) : (
                    <X size={15} className="text-text-tertiary/50 shrink-0" strokeWidth={2} />
                  )}
                  <span
                    className={cn('text-[15px]', included ? 'text-text-secondary' : 'text-text-tertiary')}
                  >
                    {t(`pricing.free.features.${key}`)}
                  </span>
                </li>
              );
            })}
          </ul>

          <Link
            to="/sign-up"
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-[15px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 cursor-pointer transition-all duration-150 hover:bg-cream-3 no-underline"
          >
            {t('pricing.free.cta')}
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
              {t('pricing.espresso.mostPopular')}
            </span>
          </div>

          {/* Accent bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-light via-amber to-coffee opacity-80 rounded-t-2xl" />

          <div className="relative flex items-center gap-2 mb-1">
            <p className="text-[16px] font-semibold text-text-primary">
              {t('pricing.espresso.name')}
            </p>
            <Crown size={14} className="text-amber" />
          </div>
          <div className="relative flex items-baseline gap-1 mb-1">
            <span className="text-[42px] font-bold text-text-primary tracking-tight">
              {espressoPricing.price}
            </span>
            <span className="text-[15px] text-text-tertiary">
              {period}
            </span>
          </div>
          {yearly && (
            <p className="relative text-[13.5px] text-green font-medium mb-3">
              {t('pricing.espresso.perMonthHint', { price: espressoPlan.yearly.monthlyEquivalent })}
            </p>
          )}
          <p className="relative text-[14.5px] text-text-secondary mb-7">
            {t('pricing.espresso.subtitle')}
          </p>

          <ul className="relative space-y-3 mb-8 flex-1">
            {espressoPlan.features.map((key) => (
              <li key={key} className="flex items-center gap-2.5">
                <Check size={15} className="text-green shrink-0" strokeWidth={2.5} />
                <span className="text-[15px] text-text-secondary">
                  {key === 'basilbook' ? (
                    // "<brand /> integration + API" — brand is a wordmark,
                    // the surrounding prose translates.
                    <Trans
                      i18nKey="pricing.espresso.features.basilbook"
                      components={{ brand: <BasilBookBrand className="text-[15px]" /> }}
                    />
                  ) : (
                    t(`pricing.espresso.features.${key}`)
                  )}
                </span>
              </li>
            ))}
          </ul>

          <Link
            to="/sign-up"
            className="relative btn-shimmer flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-[15px] font-semibold text-white border-none cursor-pointer transition-all duration-150 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)] no-underline"
          >
            {t('pricing.espresso.cta')}
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
          {/* Accent bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-coffee via-coffee-light to-amber opacity-60 rounded-t-2xl" />

          <div className="relative flex items-center gap-2 mb-1">
            <p className="text-[16px] font-semibold text-text-primary">
              {t('pricing.doubleEspresso.name')}
            </p>
            <Crown size={14} className="text-coffee" />
          </div>
          <div className="relative flex items-baseline gap-1 mb-1">
            <span className="text-[42px] font-bold text-text-primary tracking-tight">
              {doublePricing.price}
            </span>
            <span className="text-[15px] text-text-tertiary">
              {period}
            </span>
          </div>
          {yearly && (
            <p className="relative text-[13.5px] text-green font-medium mb-3">
              {t('pricing.doubleEspresso.perMonthHint', { price: doubleEspressoPlan.yearly.monthlyEquivalent })}
            </p>
          )}
          <p className="relative text-[14.5px] text-text-secondary mb-7">
            {t('pricing.doubleEspresso.subtitle')}
          </p>

          <ul className="relative space-y-3 mb-8 flex-1">
            {doubleEspressoPlan.features.map((key) => {
              const isRoadmap = doubleEspressoPlan.roadmap.has(key);
              return (
                <li key={key} className="flex items-center gap-2.5">
                  <Check size={15} className={cn('shrink-0', isRoadmap ? 'text-text-tertiary' : 'text-green')} strokeWidth={2.5} />
                  <span className={cn('text-[15px]', isRoadmap ? 'text-text-tertiary' : 'text-text-secondary')}>
                    {t(`pricing.doubleEspresso.features.${key}`)}
                    {isRoadmap && (
                      <span className="ml-1.5 text-[11px] font-medium px-1.5 py-px rounded-full bg-cream-3/60 text-text-tertiary">
                        {t('pricing.doubleEspresso.roadmapBadge')}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>

          <Link
            to="/sign-up"
            className="relative btn-shimmer flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-[15px] font-semibold text-white border-none cursor-pointer transition-all duration-150 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)] no-underline"
          >
            {t('pricing.doubleEspresso.cta')}
            <ChevronRight size={14} />
          </Link>
        </motion.div>
      </div>

      <motion.p
        className="text-center text-[14px] text-text-tertiary mt-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {t('pricing.footnote')}
      </motion.p>
    </section>
  );
}
