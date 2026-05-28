import { Link } from '@tanstack/react-router';
import { BasilBookBrand } from '@/components/shared/BasilBookBrand';
import {
  QrCode,
  Users,
  Clock,
  LayoutDashboard,
  Coffee,
  Shield,
  MapPin,
  CalendarDays,
  Bell,
  Smartphone,
  ShieldCheck,
  ArrowRightLeft,
  Crown,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * Feature shape. `key` selects `homepage.features.core.<key>` /
 * `homepage.features.espresso.<key>` for `{ title, desc }`. The BasilBook
 * card renders the brand wordmark + a translatable suffix instead of a
 * plain title; see {@link FeatureTitle}.
 */
interface FeatureShape {
  icon: React.ReactNode;
  key: string;
  accent: string;
  /** Render the brand wordmark before the suffix instead of a plain title. */
  titlePrefixBrand?: 'basilbook';
}

const coreFeatures: FeatureShape[] = [
  { key: 'qrCheckin',          icon: <QrCode size={22} strokeWidth={1.8} />,          accent: '#C17F3B' },
  { key: 'employeeManagement', icon: <Users size={22} strokeWidth={1.8} />,           accent: '#4A7C59' },
  { key: 'shiftTracking',      icon: <Clock size={22} strokeWidth={1.8} />,           accent: '#3B6FA0' },
  { key: 'realtimeDashboard',  icon: <LayoutDashboard size={22} strokeWidth={1.8} />, accent: '#9B6B45' },
];

const espressoFeatures: FeatureShape[] = [
  { key: 'leaveRequests',        icon: <Coffee size={22} strokeWidth={1.8} />,         accent: '#6B4226' },
  { key: 'ipRestriction',        icon: <Shield size={22} strokeWidth={1.8} />,         accent: '#C0392B' },
  { key: 'deviceVerification',   icon: <Smartphone size={22} strokeWidth={1.8} />,     accent: '#9B6B45' },
  { key: 'geofencing',           icon: <MapPin size={22} strokeWidth={1.8} />,         accent: '#7C5C9B' },
  { key: 'perDaySchedules',      icon: <CalendarDays size={22} strokeWidth={1.8} />,   accent: '#3B6FA0' },
  { key: 'managerRole',          icon: <ShieldCheck size={22} strokeWidth={1.8} />,    accent: '#6B4226' },
  { key: 'basilbookIntegration', icon: <ArrowRightLeft size={22} strokeWidth={1.8} />, accent: '#2bb673', titlePrefixBrand: 'basilbook' },
  { key: 'notifications',        icon: <Bell size={22} strokeWidth={1.8} />,           accent: '#C17F3B' },
];

export function FeaturesSection() {
  const { t } = useTranslation();
  return (
    <section id="features" className="py-24 px-6 md:px-8 max-w-5xl mx-auto">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
          {t('homepage.features.eyebrow')}
        </p>
        <h3 className="text-[30px] md:text-[36px] font-semibold text-text-primary font-serif leading-tight">
          {t('homepage.features.title')}
        </h3>
        <p className="text-[16px] text-text-secondary mt-3 max-w-md mx-auto">
          {t('homepage.features.subtitle')}
        </p>
      </motion.div>

      {/* Core features — 2x2 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {coreFeatures.map((f, index) => (
          <FeatureCard key={f.key} feature={f} group="core" index={index} />
        ))}
      </div>

      {/* Espresso features header */}
      <motion.div
        className="flex items-center gap-3 my-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex-1 h-px bg-cream-3" />
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber/8 border border-amber/15">
          <Crown size={13} className="text-amber" />
          <span className="text-[13px] font-semibold text-amber uppercase tracking-wider">
            {t('homepage.features.espressoBadge')}
          </span>
        </div>
        <div className="flex-1 h-px bg-cream-3" />
      </motion.div>

      {/* Espresso features — 3x2 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {espressoFeatures.map((f, index) => (
          <FeatureCard key={f.key} feature={f} group="espresso" index={index + 4} />
        ))}
      </div>

      {/* Link to full features page */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Link
          to="/features"
          className="inline-flex items-center gap-1.5 text-[15px] font-medium text-coffee hover:text-coffee-light no-underline transition-colors"
        >
          {t('homepage.features.seeAll')}
          <ChevronRight size={14} />
        </Link>
      </motion.div>
    </section>
  );
}

function FeatureTitle({ feature: f, group }: { feature: FeatureShape; group: 'core' | 'espresso' }) {
  const { t } = useTranslation();
  if (f.titlePrefixBrand === 'basilbook') {
    return (
      <>
        <BasilBookBrand className="text-[16px]" />
        {t(`homepage.features.${group}.${f.key}.titleSuffix`)}
      </>
    );
  }
  return <>{t(`homepage.features.${group}.${f.key}.title`)}</>;
}

function FeatureCard({
  feature: f,
  group,
  index,
}: {
  feature: FeatureShape;
  group: 'core' | 'espresso';
  index: number;
}) {
  const { t } = useTranslation();
  return (
    <motion.div
      className="group relative bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 cursor-default overflow-hidden shadow-[0_2px_12px_rgba(107,66,38,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-50 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: f.accent }}
      />

      <div className="flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ background: `${f.accent}12`, color: f.accent }}
        >
          {f.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[16px] font-semibold text-text-primary mb-1.5">
            <FeatureTitle feature={f} group={group} />
          </h4>
          <p className="text-[14.5px] text-text-secondary leading-relaxed">
            {t(`homepage.features.${group}.${f.key}.desc`)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
