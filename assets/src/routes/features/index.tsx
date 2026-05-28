import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  QrCode, Users, Clock, Coffee, Shield, LayoutDashboard,
  MapPin, CalendarDays, Bell, ChevronRight, Crown, Smartphone,
  Globe, Moon, Zap, CheckCircle, ShieldCheck, ArrowRightLeft,
  Wifi, Ban, Fingerprint, UserX, Locate, CircleDot,
  Eye, CalendarCheck, Link2, Key,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';
import { BasilBookBrand } from '@/components/shared/BasilBookBrand';

export const Route = createFileRoute('/features/')({
  component: FeaturesPage,
});

/**
 * Visual shapes for the three feature grids on /features.
 *
 * The icon, accent colour, link, and (for featured cards) the per-highlight
 * icon are *design choices* and stay inline. Every visible string is keyed
 * via i18n — translators only touch `common.json` under `features.index.*`.
 */
interface CoreFeatureShape {
  icon: React.ReactNode;
  /** Stable id used as the i18n key under `features.index.core.<key>`. */
  key: string;
  accent: string;
}

interface FeaturedShape {
  icon: React.ReactNode;
  /** Stable id used as the i18n key under `features.index.featured.<key>`. */
  key: string;
  accent: string;
  tagColor: string;
  link: string;
  /** Render a brand component instead of a plain string for the title. */
  titlePrefixBrand?: 'basilbook';
  /** Ordered highlight icons; text comes from `features.index.featured.<key>.highlights[i]`. */
  highlightIcons: React.ReactNode[];
}

const coreFeatures: CoreFeatureShape[] = [
  { key: 'qrCheckin',          icon: <QrCode size={28} strokeWidth={1.6} />,          accent: '#C17F3B' },
  { key: 'employeeManagement', icon: <Users size={28} strokeWidth={1.6} />,           accent: '#4A7C59' },
  { key: 'shiftTracking',      icon: <Clock size={28} strokeWidth={1.6} />,           accent: '#3B6FA0' },
  { key: 'closurePeriods',     icon: <Coffee size={28} strokeWidth={1.6} />,          accent: '#9B6B45' },
  { key: 'realtimeDashboard',  icon: <LayoutDashboard size={28} strokeWidth={1.6} />, accent: '#6B4226' },
  { key: 'multiLanguage',      icon: <Globe size={28} strokeWidth={1.6} />,           accent: '#4A7C59' },
];

const featuredEspresso: FeaturedShape[] = [
  {
    key: 'ipRestriction',
    icon: <Shield size={28} strokeWidth={1.6} />,
    tagColor: 'text-red bg-red/8',
    accent: '#C0392B',
    link: '/features/ip-restriction',
    highlightIcons: [<Wifi key="w" size={14} />, <Ban key="b" size={14} />, <CheckCircle key="c" size={14} />],
  },
  {
    key: 'deviceVerification',
    icon: <Smartphone size={28} strokeWidth={1.6} />,
    tagColor: 'text-coffee bg-coffee/8',
    accent: '#9B6B45',
    link: '/features/device-verification',
    highlightIcons: [<Fingerprint key="f" size={14} />, <UserX key="u" size={14} />, <CheckCircle key="c" size={14} />],
  },
  {
    key: 'geofencing',
    icon: <MapPin size={28} strokeWidth={1.6} />,
    tagColor: 'text-[#7C5C9B] bg-[#7C5C9B]/8',
    accent: '#7C5C9B',
    link: '/features/geofencing',
    highlightIcons: [<Locate key="l" size={14} />, <CircleDot key="r" size={14} />, <CheckCircle key="c" size={14} />],
  },
  {
    key: 'rolesPermissions',
    icon: <ShieldCheck size={28} strokeWidth={1.6} />,
    tagColor: 'text-coffee bg-coffee/8',
    accent: '#6B4226',
    link: '/roles',
    highlightIcons: [<Eye key="e" size={14} />, <CalendarCheck key="cc" size={14} />, <Shield key="s" size={14} />],
  },
  {
    key: 'basilbookIntegration',
    icon: <ArrowRightLeft size={28} strokeWidth={1.6} />,
    titlePrefixBrand: 'basilbook',
    tagColor: 'text-[#2bb673] bg-[#2bb673]/8',
    accent: '#2bb673',
    link: '/features/basilbook-integration',
    highlightIcons: [<Link2 key="l" size={14} />, <Key key="k" size={14} />, <ArrowRightLeft key="a" size={14} />],
  },
];

const espressoFeatures: CoreFeatureShape[] = [
  { key: 'perDayShifts',  icon: <CalendarDays size={28} strokeWidth={1.6} />, accent: '#3B6FA0' },
  { key: 'leaveRequests', icon: <Users size={28} strokeWidth={1.6} />,        accent: '#4A7C59' },
  { key: 'notifications', icon: <Bell size={28} strokeWidth={1.6} />,         accent: '#C17F3B' },
];

const whyReasons: { key: string; icon: React.ReactNode }[] = [
  { key: 'setupFast',  icon: <Zap size={18} /> },
  { key: 'noHardware', icon: <QrCode size={18} /> },
  { key: 'anyPhone',   icon: <Smartphone size={18} /> },
  { key: 'darkMode',   icon: <Moon size={18} /> },
  { key: 'languages',  icon: <Globe size={18} /> },
  { key: 'free',       icon: <CheckCircle size={18} /> },
];

function FeaturesPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* PageSeo title/description stay in English — SeoMetaResolver serves the
          localized server-rendered <title> + meta description based on ?lang=. */}
      <PageSeo
        title="Features"
        description="QR check-in, shift tracking, geofencing, device verification, leave management, and push notifications. Everything your restaurant needs for staff attendance."
        path="/features"
      />
      <LandingNav />

      <div className="pt-28 pb-20 px-6 md:px-8 max-w-5xl mx-auto page-enter">
        {/* Hero */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
            {t('features.index.eyebrow')}
          </p>
          <h1 className="text-[34px] md:text-[44px] font-semibold text-text-primary font-serif leading-tight">
            {t('features.index.title')}
          </h1>
          <p className="text-[17px] text-text-secondary mt-4 max-w-xl mx-auto">
            {t('features.index.subtitle')}
          </p>
        </motion.div>

        {/* Core features */}
        <div className="mb-20">
          <motion.h2
            className="text-[13px] uppercase tracking-[2px] font-medium text-text-tertiary mb-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t('features.index.sections.coreEyebrow')}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {coreFeatures.map((f, i) => (
              <FeatureCard key={f.key} feature={f} index={i} group="core" />
            ))}
          </div>
        </div>

        {/* Espresso features */}
        <div className="mb-20">
          <motion.div
            className="flex items-center justify-center gap-2 mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex-1 h-px bg-cream-3 hidden md:block" />
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber/8 border border-amber/15">
              <Crown size={14} className="text-amber" />
              <h2 className="text-[13px] uppercase tracking-[2px] font-medium text-amber">
                {t('features.index.sections.espressoBadge')}
              </h2>
            </div>
            <div className="flex-1 h-px bg-cream-3 hidden md:block" />
          </motion.div>

          {/* Featured — two-section cards (first 4 in 2-col, BasilBook full-width) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {featuredEspresso.slice(0, 4).map((f, i) => (
              <FeaturedCard key={f.key} feature={f} index={i} />
            ))}
          </div>
          {featuredEspresso[4] && (
            <div className="mb-5">
              <FeaturedCardWide feature={featuredEspresso[4]} />
            </div>
          )}

          {/* Regular espresso features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {espressoFeatures.map((f, i) => (
              <FeatureCard key={f.key} feature={f} index={i} group="espresso" espresso />
            ))}
          </div>
        </div>

        {/* Why DailyBrew */}
        <motion.div
          className="mb-20 bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-8 md:p-10 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-2">
              {t('features.index.why.title')}
            </h2>
            <p className="text-[15px] text-text-secondary">
              {t('features.index.why.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {whyReasons.map((r, i) => (
              <motion.div
                key={r.key}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cream/40 dark:bg-cream/5"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <div className="w-8 h-8 rounded-lg bg-coffee/10 flex items-center justify-center text-coffee flex-shrink-0">
                  {r.icon}
                </div>
                <span className="text-[14.5px] text-text-primary font-medium">
                  {t(`features.index.why.reasons.${r.key}`)}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-[24px] font-semibold text-text-primary font-serif mb-3">
            {t('features.index.cta.title')}
          </h3>
          <p className="text-[16px] text-text-secondary mb-6">
            {t('features.index.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/sign-up"
              className="btn-shimmer flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-[15px] font-semibold text-white no-underline transition-all hover:-translate-y-px"
            >
              {t('features.index.cta.startFree')}
              <ChevronRight size={14} />
            </Link>
            <Link
              to="/pricing"
              className="px-6 py-2.5 rounded-lg text-[15px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 no-underline transition-all hover:bg-cream-3"
            >
              {t('features.index.cta.comparePlans')}
            </Link>
            <Link
              to="/how-it-works"
              className="px-6 py-2.5 rounded-lg text-[15px] font-medium text-text-secondary no-underline transition-all hover:text-coffee"
            >
              {t('features.index.cta.howItWorks')}
            </Link>
          </div>
        </motion.div>
      </div>

      <LandingFooter />
    </div>
  );
}

/** Brand-or-text title for featured cards (BasilBook gets its wordmark + suffix). */
function FeaturedTitle({ feature: f }: { feature: FeaturedShape }) {
  const { t } = useTranslation();
  if (f.titlePrefixBrand === 'basilbook') {
    return (
      <>
        <BasilBookBrand className="text-[16px]" />
        {t(`features.index.featured.${f.key}.titleSuffix`)}
      </>
    );
  }
  return <>{t(`features.index.featured.${f.key}.title`)}</>;
}

function FeaturedCard({ feature: f, index }: { feature: FeaturedShape; index: number }) {
  const { t } = useTranslation();
  const highlightTexts = t(`features.index.featured.${f.key}.highlights`, {
    returnObjects: true,
  }) as string[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 2) * 0.1 }}
    >
      <a
        href={f.link}
        className="group relative block no-underline overflow-hidden bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl shadow-[0_2px_12px_rgba(107,66,38,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
      >
        {/* Accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] opacity-60 group-hover:opacity-100 transition-opacity"
          style={{ background: f.accent }}
        />

        <div className="p-6 pb-0">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
              style={{ background: `${f.accent}12`, color: f.accent }}
            >
              {f.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-[17px] font-semibold text-text-primary">
                  <FeaturedTitle feature={f} />
                </h3>
                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-amber/10 text-amber uppercase tracking-wider">
                  {t('features.index.sections.espressoPill')}
                </span>
              </div>
              <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${f.tagColor} uppercase tracking-wider`}>
                {t(`features.index.featured.${f.key}.tag`)}
              </span>
            </div>
          </div>
          {/* Description */}
          <p className="text-[14.5px] text-text-secondary leading-relaxed">
            {t(`features.index.featured.${f.key}.desc`)}
          </p>
        </div>

        {/* Divider + highlights */}
        <div className="mx-6 mt-4 pt-4 pb-5 border-t border-cream-3 dark:border-cream-3/40">
          <ul className="space-y-2.5">
            {f.highlightIcons.map((icon, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <span style={{ color: f.accent }} className="flex-shrink-0">{icon}</span>
                <span className="text-[13.5px] text-text-secondary">{highlightTexts[i]}</span>
              </li>
            ))}
          </ul>
          <span className="inline-flex items-center gap-1 mt-4 text-[13.5px] font-medium text-coffee group-hover:text-coffee-light transition-colors">
            {t('features.index.learnMore')}
            <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </a>
    </motion.div>
  );
}

function FeaturedCardWide({ feature: f }: { feature: FeaturedShape }) {
  const { t } = useTranslation();
  const highlightTexts = t(`features.index.featured.${f.key}.highlights`, {
    returnObjects: true,
  }) as string[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <a
        href={f.link}
        className="group relative block no-underline overflow-hidden bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl shadow-[0_2px_12px_rgba(107,66,38,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
      >
        {/* Accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] opacity-60 group-hover:opacity-100 transition-opacity"
          style={{ background: f.accent }}
        />

        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Left — icon + description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                  style={{ background: `${f.accent}12`, color: f.accent }}
                >
                  {f.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-[17px] font-semibold text-text-primary">
                      <FeaturedTitle feature={f} />
                    </h3>
                    <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-amber/10 text-amber uppercase tracking-wider">
                      {t('features.index.sections.espressoPill')}
                    </span>
                  </div>
                  <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${f.tagColor} uppercase tracking-wider`}>
                    {t(`features.index.featured.${f.key}.tag`)}
                  </span>
                </div>
              </div>
              <p className="text-[14.5px] text-text-secondary leading-relaxed">
                {t(`features.index.featured.${f.key}.desc`)}
              </p>
            </div>

            {/* Right — highlights */}
            <div className="md:w-[280px] flex-shrink-0 md:border-l md:border-cream-3 md:dark:border-cream-3/40 md:pl-6">
              <ul className="space-y-2.5">
                {f.highlightIcons.map((icon, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <span style={{ color: f.accent }} className="flex-shrink-0">{icon}</span>
                    <span className="text-[13.5px] text-text-secondary">{highlightTexts[i]}</span>
                  </li>
                ))}
              </ul>
              <span className="inline-flex items-center gap-1 mt-4 text-[13.5px] font-medium text-coffee group-hover:text-coffee-light transition-colors">
                {t('features.index.learnMore')}
                <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  );
}

function FeatureCard({
  feature,
  index,
  group,
  espresso,
}: {
  feature: CoreFeatureShape;
  index: number;
  /** Which i18n namespace to look up under — `core` or `espresso`. */
  group: 'core' | 'espresso';
  espresso?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <motion.div
      className="group relative glass-card !rounded-2xl p-6 hover:!-translate-y-1"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
    >
      {/* Accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: feature.accent }}
      />
      {/* Hover glow */}
      <div
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-xl"
        style={{ background: `${feature.accent}15` }}
      />

      <div className="relative">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
          style={{ background: `${feature.accent}12`, color: feature.accent }}
        >
          {feature.icon}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-[16px] font-semibold text-text-primary">
            {t(`features.index.${group}.${feature.key}.title`)}
          </h3>
          {espresso && (
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-amber/10 text-amber uppercase tracking-wider">
              {t('features.index.sections.espressoPill')}
            </span>
          )}
        </div>
        <p className="text-[14.5px] text-text-secondary leading-relaxed">
          {t(`features.index.${group}.${feature.key}.desc`)}
        </p>
      </div>
    </motion.div>
  );
}
