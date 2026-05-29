import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  MapPin, Shield, CheckCircle, ChevronRight, Crown,
  Settings, ToggleRight, Save, AlertTriangle, Locate,
  CircleDot, Smartphone, ArrowLeft, HelpCircle, Ruler,
  Navigation, Layers,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';

export const Route = createFileRoute('/features/geofencing')({
  component: GeofencingPage,
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

const howKeys = ['center', 'radius', 'sharesLocation', 'compares'] as const;
const howIcons = [<Locate key="l" size={20} />, <CircleDot key="c" size={20} />, <Navigation key="n" size={20} />, <Shield key="s" size={20} />];

const benefitKeys = ['verifyPresence', 'flexibleRadius', 'layered', 'onePrompt'] as const;
const benefitIcons = [<MapPin key="m" size={20} />, <Ruler key="r" size={20} />, <Layers key="l" size={20} />, <CheckCircle key="c" size={20} />];

const radiusGuideKeys = ['cafe', 'standard', 'large', 'campus'] as const;
const radiusRanges = ['50–100m', '100–200m', '200–500m', '500–5,000m'];

const setupKeys = ['openSettings', 'enable', 'setLocation', 'setRadius', 'saveVerify'] as const;
const setupIcons = [<Settings key="s" size={20} />, <ToggleRight key="t" size={20} />, <Locate key="l" size={20} />, <CircleDot key="c" size={20} />, <Save key="sv" size={20} />];

const faqKeys = ['trackAllDay', 'denied', 'indoorAccuracy', 'movedRemodel', 'fakeGps', 'iosAndroid'] as const;

const tipKeys = ['ipRestriction', 'deviceVerification', 'geofencing'] as const;
const tipIcons: { icon: React.ReactNode; color: string }[] = [
  { icon: <Shield size={15} />, color: 'text-red' },
  { icon: <Smartphone size={15} />, color: 'text-coffee' },
  { icon: <MapPin size={15} />, color: 'text-[#7C5C9B]' },
];

function GeofencingPage() {
  const { t } = useTranslation();
  const ns = 'routes.features.geofencing';
  return (
    <div className="min-h-screen">
      <PageSeo
        title="Geofencing"
        description="Draw a GPS perimeter around your restaurant. Staff must be physically within range to check in. Configurable radius from 50m to 5,000m."
        path="/features/geofencing"
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
            <div className="w-14 h-14 rounded-2xl bg-[#7C5C9B]/10 flex items-center justify-center">
              <MapPin size={28} className="text-[#7C5C9B]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-amber/10 text-amber uppercase tracking-wider">
                {t('routes.features.common.espressoBadge')}
              </span>
              <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-[#7C5C9B]/8 text-[#7C5C9B] uppercase tracking-wider">
                {t(`${ns}.tag`)}
              </span>
            </div>
          </div>
          <h1 className="text-[34px] md:text-[44px] font-semibold text-text-primary font-serif leading-tight mb-4">
            {t(`${ns}.title`)}
          </h1>
          <p className="text-[18px] md:text-[20px] text-text-secondary leading-relaxed max-w-2xl">
            {t(`${ns}.subtitle`)}
          </p>
        </motion.div>

        {/* Problem */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-6">
            {t('routes.features.common.problemHeading')}
          </h2>
          <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 md:p-8 shadow-[0_2px_12px_rgba(107,66,38,0.05)]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red/10 flex items-center justify-center flex-shrink-0 mt-1">
                <AlertTriangle size={20} className="text-red" />
              </div>
              <div className="space-y-3">
                <p className="text-[16px] text-text-primary font-medium">{t(`${ns}.problem.lead`)}</p>
                <p className="text-[15px] text-text-secondary leading-relaxed">{t(`${ns}.problem.p1`)}</p>
                <p className="text-[15px] text-text-secondary leading-relaxed">{t(`${ns}.problem.p2`)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-6">
            {t('routes.features.common.howHeading')}
          </h2>
          <div className="space-y-4">
            {howKeys.map((key, i) => (
              <motion.div
                key={key}
                className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
                {...stagger(i)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#7C5C9B]/10 flex items-center justify-center text-[#7C5C9B] flex-shrink-0">
                    {howIcons[i]}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-text-primary mb-1.5">{t(`${ns}.how.${key}.title`)}</h3>
                    <p className="text-[15px] text-text-secondary leading-relaxed">{t(`${ns}.how.${key}.desc`)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-6">
            {t('routes.features.common.benefitsHeading')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {benefitKeys.map((key, i) => (
              <motion.div
                key={key}
                className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
                {...stagger(i)}
              >
                <div className="w-10 h-10 rounded-xl bg-[#7C5C9B]/10 flex items-center justify-center text-[#7C5C9B] mb-4">
                  {benefitIcons[i]}
                </div>
                <h3 className="text-[16px] font-semibold text-text-primary mb-1.5">{t(`${ns}.benefits.${key}.title`)}</h3>
                <p className="text-[14.5px] text-text-secondary leading-relaxed">{t(`${ns}.benefits.${key}.desc`)}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Radius guide */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-6">
            {t(`${ns}.radiusGuide.title`)}
          </h2>
          <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 md:p-8 shadow-[0_2px_12px_rgba(107,66,38,0.05)]">
            <p className="text-[15px] text-text-secondary leading-relaxed mb-6">
              {t(`${ns}.radiusGuide.intro`)}
            </p>
            <div className="space-y-4">
              {radiusGuideKeys.map((key, i) => (
                <motion.div
                  key={key}
                  className="flex items-start gap-4 p-4 rounded-xl bg-cream/40 dark:bg-cream/5"
                  {...stagger(i)}
                >
                  <span className="text-[14px] font-bold font-mono text-[#7C5C9B] bg-[#7C5C9B]/10 px-3 py-1.5 rounded-lg flex-shrink-0 min-w-[90px] text-center">
                    {radiusRanges[i]}
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-text-primary mb-0.5">{t(`${ns}.radiusGuide.tiers.${key}.venue`)}</p>
                    <p className="text-[14px] text-text-secondary leading-relaxed">{t(`${ns}.radiusGuide.tiers.${key}.note`)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Setup */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-2">
            {t('routes.features.common.setupHeading')}
          </h2>
          <p className="text-[15px] text-text-secondary mb-8">{t(`${ns}.setup.subtitle`)}</p>

          <div className="space-y-6">
            {setupKeys.map((key, i) => (
              <motion.div key={key} className="flex items-start gap-5" {...stagger(i)}>
                <div className="flex flex-col items-center gap-2">
                  <span className="w-10 h-10 rounded-full bg-coffee flex items-center justify-center text-[16px] font-bold text-white flex-shrink-0">
                    {i + 1}
                  </span>
                  {i < setupKeys.length - 1 && <div className="w-px h-8 bg-cream-3" />}
                </div>
                <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-5 flex-1 shadow-[0_2px_12px_rgba(107,66,38,0.05)]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-coffee/10 flex items-center justify-center text-coffee">
                      {setupIcons[i]}
                    </div>
                    <h3 className="text-[16px] font-semibold text-text-primary">{t(`${ns}.setup.steps.${key}.title`)}</h3>
                  </div>
                  <p className="text-[15px] text-text-secondary leading-relaxed">{t(`${ns}.setup.steps.${key}.desc`)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-6">
            {t('routes.features.common.faqHeading')}
          </h2>
          <div className="space-y-4">
            {faqKeys.map((key, i) => (
              <motion.div
                key={key}
                className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
                {...stagger(i)}
              >
                <div className="flex items-start gap-3">
                  <HelpCircle size={18} className="text-amber mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-[15px] font-semibold text-text-primary mb-2">{t(`${ns}.faq.${key}.q`)}</h3>
                    <p className="text-[14.5px] text-text-secondary leading-relaxed">{t(`${ns}.faq.${key}.a`)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Layer-all-three tip */}
        <motion.div
          className="mb-16 bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 md:p-8 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
          {...fadeUp}
        >
          <h3 className="text-[17px] font-semibold text-text-primary mb-4">{t(`${ns}.tip.title`)}</h3>
          <p className="text-[15px] text-text-secondary leading-relaxed mb-5">{t(`${ns}.tip.intro`)}</p>
          <div className="space-y-3">
            {tipKeys.map((key, i) => (
              <div key={key} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cream/40 dark:bg-cream/5">
                <span className={`${tipIcons[i].color} flex-shrink-0`}>{tipIcons[i].icon}</span>
                <span className="text-[14.5px] font-medium text-text-primary">{t(`${ns}.tip.layers.${key}.label`)}</span>
                <span className="text-[14px] text-text-tertiary">—</span>
                <span className="text-[14px] text-text-secondary">{t(`${ns}.tip.layers.${key}.desc`)}</span>
              </div>
            ))}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/features/ip-restriction"
              className="group bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-5 shadow-[0_2px_12px_rgba(107,66,38,0.05)] no-underline transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-red/10 flex items-center justify-center">
                  <Shield size={18} className="text-red" />
                </div>
                <h3 className="text-[15px] font-semibold text-text-primary group-hover:text-coffee transition-colors">
                  {t('routes.features.common.related.ipRestriction.title')}
                </h3>
                <ChevronRight size={14} className="text-text-tertiary ml-auto" />
              </div>
              <p className="text-[14px] text-text-secondary">
                {t('routes.features.common.related.ipRestriction.desc')}
              </p>
            </Link>
            <Link
              to="/features/device-verification"
              className="group bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-5 shadow-[0_2px_12px_rgba(107,66,38,0.05)] no-underline transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-coffee/10 flex items-center justify-center">
                  <Smartphone size={18} className="text-coffee" />
                </div>
                <h3 className="text-[15px] font-semibold text-text-primary group-hover:text-coffee transition-colors">
                  {t('routes.features.common.related.deviceVerification.title')}
                </h3>
                <ChevronRight size={14} className="text-text-tertiary ml-auto" />
              </div>
              <p className="text-[14px] text-text-secondary">
                {t('routes.features.common.related.deviceVerification.desc')}
              </p>
            </Link>
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
