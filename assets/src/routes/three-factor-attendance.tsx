import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  Shield, Smartphone, MapPin, Layers, ChevronRight, Crown,
  Settings, ToggleRight, Save, ArrowLeft, CheckCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';

export const Route = createFileRoute('/three-factor-attendance')({
  component: ThreeFactorAttendancePage,
});

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true } as const,
  transition: { duration: 0.5 },
};

const stagger = (i: number) => ({
  ...fadeUp,
  transition: { duration: 0.4, delay: i * 0.08 },
});

// Locked order: IP (network) → Device (identity) → Geofence (location).
// Reads top-down as "what the system checks before letting you punch in."
const factorKeys = ['ipRestriction', 'deviceVerification', 'geofencing'] as const;
const factorMeta: Record<typeof factorKeys[number], {
  icon: React.ReactNode; color: string; bg: string; to: '/features/ip-restriction' | '/features/device-verification' | '/features/geofencing';
}> = {
  ipRestriction: { icon: <Shield size={22} />, color: 'text-red', bg: 'bg-red/10', to: '/features/ip-restriction' },
  deviceVerification: { icon: <Smartphone size={22} />, color: 'text-coffee', bg: 'bg-coffee/10', to: '/features/device-verification' },
  geofencing: { icon: <MapPin size={22} />, color: 'text-[#7C5C9B]', bg: 'bg-[#7C5C9B]/10', to: '/features/geofencing' },
};

const whyKeys = ['singleLayer', 'complementary', 'auditable'] as const;
const stepKeys = ['openSettings', 'enableThree', 'saveTest'] as const;
const stepIcons = [<Settings key="s" size={20} />, <ToggleRight key="t" size={20} />, <Save key="sv" size={20} />];
const fallbackKeys = ['ipDown', 'newDevice', 'gpsWeak'] as const;

function ThreeFactorAttendancePage() {
  const { t } = useTranslation();
  const ns = 'routes.threeFactorAttendance';
  return (
    <div className="min-h-screen">
      <PageSeo
        title={t(`${ns}.title`)}
        description={t(`${ns}.subtitle`)}
        path="/three-factor-attendance"
      />
      <LandingNav />

      <div className="pt-28 pb-20 px-6 md:px-8 max-w-4xl mx-auto page-enter">
        {/* Back link */}
        <motion.div className="mb-10" {...fadeUp}>
          <Link
            to="/features"
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-text-tertiary hover:text-coffee no-underline transition-colors"
          >
            <ArrowLeft size={14} />
            {t('routes.features.common.allFeatures')}
          </Link>
        </motion.div>

        {/* Hero */}
        <motion.div className="mb-16" {...fadeUp}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-amber/10 flex items-center justify-center">
              <Layers size={28} className="text-amber" />
            </div>
            <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-amber/10 text-amber uppercase tracking-wider">
              {t('routes.features.common.espressoBadge')}
            </span>
          </div>
          <h1 className="text-[34px] md:text-[44px] font-semibold text-text-primary font-serif leading-tight mb-4">
            {t(`${ns}.title`)}
          </h1>
          <p className="text-[18px] md:text-[20px] text-text-secondary leading-relaxed max-w-2xl">
            {t(`${ns}.subtitle`)}
          </p>
        </motion.div>

        {/* Why three factors */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-6">
            {t(`${ns}.why.title`)}
          </h2>
          <div className="space-y-4">
            {whyKeys.map((key, i) => (
              <motion.div
                key={key}
                className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
                {...stagger(i)}
              >
                <h3 className="text-[16px] font-semibold text-text-primary mb-1.5">
                  {t(`${ns}.why.items.${key}.title`)}
                </h3>
                <p className="text-[15px] text-text-secondary leading-relaxed">
                  {t(`${ns}.why.items.${key}.desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How each layer works */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-6">
            {t(`${ns}.layers.title`)}
          </h2>
          <div className="space-y-5">
            {factorKeys.map((key, i) => {
              const meta = factorMeta[key];
              return (
                <motion.div
                  key={key}
                  className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
                  {...stagger(i)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${meta.bg} flex items-center justify-center ${meta.color} flex-shrink-0`}>
                      {meta.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[17px] font-semibold text-text-primary mb-1.5">
                        {t(`${ns}.layers.items.${key}.title`)}
                      </h3>
                      <p className="text-[15px] text-text-secondary leading-relaxed mb-3">
                        {t(`${ns}.layers.items.${key}.desc`)}
                      </p>
                      <Link
                        to={meta.to}
                        className="inline-flex items-center gap-1 text-[14px] font-medium text-coffee no-underline hover:underline"
                      >
                        {t(`${ns}.layers.readMore`)}
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* How to enable all three */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-2">
            {t(`${ns}.enable.title`)}
          </h2>
          <p className="text-[15px] text-text-secondary mb-8">{t(`${ns}.enable.subtitle`)}</p>

          <div className="space-y-6">
            {stepKeys.map((key, i) => (
              <motion.div key={key} className="flex items-start gap-5" {...stagger(i)}>
                <div className="flex flex-col items-center gap-2">
                  <span className="w-10 h-10 rounded-full bg-coffee flex items-center justify-center text-[16px] font-bold text-white flex-shrink-0">
                    {i + 1}
                  </span>
                  {i < stepKeys.length - 1 && <div className="w-px h-8 bg-cream-3" />}
                </div>
                <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-5 flex-1 shadow-[0_2px_12px_rgba(107,66,38,0.05)]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-coffee/10 flex items-center justify-center text-coffee">
                      {stepIcons[i]}
                    </div>
                    <h3 className="text-[16px] font-semibold text-text-primary">{t(`${ns}.enable.steps.${key}.title`)}</h3>
                  </div>
                  <p className="text-[15px] text-text-secondary leading-relaxed">{t(`${ns}.enable.steps.${key}.desc`)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* What happens when one layer fails */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-6">
            {t(`${ns}.fallback.title`)}
          </h2>
          <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 md:p-8 shadow-[0_2px_12px_rgba(107,66,38,0.05)]">
            <p className="text-[15px] text-text-secondary leading-relaxed mb-5">
              {t(`${ns}.fallback.intro`)}
            </p>
            <div className="space-y-3">
              {fallbackKeys.map((key) => (
                <div key={key} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-cream/40 dark:bg-cream/5">
                  <CheckCircle size={16} className="text-green mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[14.5px] font-medium text-text-primary mb-0.5">
                      {t(`${ns}.fallback.items.${key}.label`)}
                    </p>
                    <p className="text-[14px] text-text-secondary leading-relaxed">
                      {t(`${ns}.fallback.items.${key}.desc`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[14.5px] text-text-tertiary leading-relaxed mt-5">
              {t(`${ns}.fallback.outro`)}
            </p>
          </div>
        </motion.div>

        {/* Espresso callout */}
        <motion.div
          className="mb-16 flex items-start gap-4 px-6 py-5 rounded-2xl bg-amber/8 border border-amber/15"
          {...fadeUp}
        >
          <Crown size={20} className="text-amber flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[15px] font-semibold text-text-primary mb-1">
              {t('routes.features.common.espressoCallout.title')}
            </p>
            <p className="text-[14.5px] text-text-secondary leading-relaxed">
              {t(`${ns}.espressoCallout`)}
            </p>
          </div>
        </motion.div>

        {/* Related features */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[20px] font-semibold text-text-primary font-serif mb-6">
            {t('routes.features.common.relatedHeading')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {factorKeys.map((key) => {
              const meta = factorMeta[key];
              return (
                <Link
                  key={key}
                  to={meta.to}
                  className="group bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-5 shadow-[0_2px_12px_rgba(107,66,38,0.05)] no-underline transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center ${meta.color}`}>
                      {meta.icon}
                    </div>
                    <h3 className="text-[15px] font-semibold text-text-primary group-hover:text-coffee transition-colors">
                      {t(`routes.features.common.related.${key}.title`)}
                    </h3>
                  </div>
                  <p className="text-[14px] text-text-secondary">
                    {t(`routes.features.common.related.${key}.desc`)}
                  </p>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div className="text-center" {...fadeUp}>
          <h3 className="text-[24px] font-semibold text-text-primary font-serif mb-3">
            {t(`${ns}.cta.title`)}
          </h3>
          <p className="text-[16px] text-text-secondary mb-6">
            {t('routes.features.common.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/sign-up"
              className="btn-shimmer flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-[15px] font-semibold text-white no-underline transition-all hover:-translate-y-px"
            >
              {t('routes.features.common.cta.startFree')}
              <ChevronRight size={14} />
            </Link>
            <Link
              to="/pricing"
              className="px-6 py-2.5 rounded-lg text-[15px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 no-underline transition-all hover:bg-cream-3"
            >
              {t('routes.features.common.cta.comparePlans')}
            </Link>
          </div>
        </motion.div>
      </div>

      <LandingFooter />
    </div>
  );
}
