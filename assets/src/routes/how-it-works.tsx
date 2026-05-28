import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  UserPlus,
  QrCode,
  BarChart3,
  ChevronRight,
  Building2,
  Clock,
  CalendarOff,
  CalendarDays,
  Shield,
  Bell,
  Smartphone,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';
import { usePlaybook } from '@/components/landing/playbooks';

export const Route = createFileRoute('/how-it-works')({
  component: HowItWorksPage,
});

interface StepShape {
  number: string;
  icon: React.ReactNode;
  /** i18n key under `routes.howItWorks.steps.<key>.{title,desc,details[]}`. */
  key: string;
  /** Number of detail bullets — matches the array length in i18n. */
  detailCount: number;
  accent: string;
}

const steps: StepShape[] = [
  { number: '01', icon: <Building2 size={28} strokeWidth={1.6} />, key: 'create',   detailCount: 3, accent: '#6B4226' },
  { number: '02', icon: <UserPlus size={28} strokeWidth={1.6} />,  key: 'addTeam',  detailCount: 3, accent: '#4A7C59' },
  { number: '03', icon: <QrCode size={28} strokeWidth={1.6} />,    key: 'scan',     detailCount: 3, accent: '#C17F3B' },
  { number: '04', icon: <BarChart3 size={28} strokeWidth={1.6} />, key: 'track',    detailCount: 3, accent: '#3B6FA0' },
];

const ownerFeatures: { icon: React.ReactNode; key: string }[] = [
  { icon: <BarChart3 size={18} />,    key: 'dashboard' },
  { icon: <UserPlus size={18} />,     key: 'employees' },
  { icon: <Clock size={18} />,        key: 'shifts' },
  { icon: <CalendarOff size={18} />,  key: 'closures' },
  { icon: <CalendarDays size={18} />, key: 'leave' },
  { icon: <Shield size={18} />,       key: 'security' },
  { icon: <Bell size={18} />,         key: 'notifications' },
];

const employeeFeatures: { icon: React.ReactNode; key: string }[] = [
  { icon: <QrCode size={18} />,       key: 'qrScan' },
  { icon: <Smartphone size={18} />,   key: 'mobileDashboard' },
  { icon: <Clock size={18} />,        key: 'history' },
  { icon: <CalendarDays size={18} />, key: 'leaveRequests' },
  { icon: <Bell size={18} />,         key: 'shiftAlerts' },
  { icon: <CheckCircle size={18} />,  key: 'approvalStatus' },
];

function HowItWorksPage() {
  const { t } = useTranslation();
  const ownerPb = usePlaybook('owner');
  const employeePb = usePlaybook('employee');
  const espressoPb = usePlaybook('espresso');
  const EspressoIcon = espressoPb.icon;
  return (
    <div className="min-h-screen">
      <PageSeo
        title="How it works"
        description="Set up staff attendance tracking in minutes. Create a workspace, add employees, display a QR code, and track check-ins live from your dashboard."
        path="/how-it-works"
      />
      <LandingNav />

      <div className="pt-28 pb-20 px-6 md:px-8 max-w-5xl mx-auto page-enter">
        {/* Hero */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
            {t('routes.howItWorks.eyebrow')}
          </p>
          <h1 className="text-[34px] md:text-[44px] font-semibold text-text-primary font-serif leading-tight">
            {t('routes.howItWorks.title')}
          </h1>
          <p className="text-[17px] text-text-secondary mt-4 max-w-xl mx-auto">
            {t('routes.howItWorks.subtitle')}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-6 mb-24">
          {steps.map((step, i) => {
            const details = t(`routes.howItWorks.steps.${step.key}.details`, {
              returnObjects: true,
            }) as string[];
            return (
              <motion.div
                key={step.number}
                className="group relative bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 md:p-8 overflow-hidden shadow-[0_2px_12px_rgba(107,66,38,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-50 group-hover:opacity-100 transition-opacity"
                  style={{ background: step.accent }}
                />

                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex items-center gap-4 md:flex-col md:items-center md:min-w-[80px]">
                    <div className="relative">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: `${step.accent}12`, color: step.accent }}
                      >
                        {step.icon}
                      </div>
                      <span
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold text-white"
                        style={{ background: step.accent }}
                      >
                        {step.number}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-[20px] font-semibold text-text-primary font-serif mb-2">
                      {t(`routes.howItWorks.steps.${step.key}.title`)}
                    </h3>
                    <p className="text-[15px] text-text-secondary leading-relaxed mb-4">
                      {t(`routes.howItWorks.steps.${step.key}.desc`)}
                    </p>
                    <ul className="space-y-2">
                      {details.map((detail, di) => (
                        <li key={di} className="flex items-center gap-2.5">
                          <CheckCircle
                            size={14}
                            className="flex-shrink-0"
                            style={{ color: step.accent }}
                          />
                          <span className="text-[14px] text-text-secondary">
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Two perspectives */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
            {t('routes.howItWorks.perspectives.eyebrow')}
          </p>
          <h2 className="text-[30px] md:text-[36px] font-semibold text-text-primary font-serif leading-tight">
            {t('routes.howItWorks.perspectives.title')}
          </h2>
          <p className="text-[16px] text-text-secondary mt-3 max-w-lg mx-auto">
            {t('routes.howItWorks.perspectives.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Owner card */}
          <motion.div
            className="flex flex-col bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-coffee/10 flex items-center justify-center">
                <Building2 size={20} className="text-coffee" />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-text-primary">
                  {t('routes.howItWorks.ownerCard.title')}
                </h3>
                <p className="text-[13px] text-text-tertiary">
                  {t('routes.howItWorks.ownerCard.subtitle')}
                </p>
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              {ownerFeatures.map((f) => (
                <li key={f.key} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-coffee/8 flex items-center justify-center text-coffee flex-shrink-0">
                    {f.icon}
                  </div>
                  <span className="text-[14.5px] text-text-secondary">
                    {t(`routes.howItWorks.ownerCard.features.${f.key}`)}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to={ownerPb.to}
              className="mt-auto inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg bg-coffee/8 hover:bg-coffee/12 text-coffee text-[14px] font-semibold no-underline transition-colors"
            >
              <span>{t('routes.howItWorks.ownerCard.cta')}</span>
              <ArrowRight size={14} />
            </Link>
          </motion.div>

          {/* Employee card */}
          <motion.div
            className="flex flex-col bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-green/10 flex items-center justify-center">
                <Smartphone size={20} className="text-green" />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-text-primary">
                  {t('routes.howItWorks.employeeCard.title')}
                </h3>
                <p className="text-[13px] text-text-tertiary">
                  {t('routes.howItWorks.employeeCard.subtitle')}
                </p>
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              {employeeFeatures.map((f) => (
                <li key={f.key} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green/8 flex items-center justify-center text-green flex-shrink-0">
                    {f.icon}
                  </div>
                  <span className="text-[14.5px] text-text-secondary">
                    {t(`routes.howItWorks.employeeCard.features.${f.key}`)}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to={employeePb.to}
              className="mt-auto inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg bg-green/8 hover:bg-green/12 text-green text-[14px] font-semibold no-underline transition-colors"
            >
              <span>{t('routes.howItWorks.employeeCard.cta')}</span>
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>

        {/* Espresso teaser */}
        <motion.div
          className="mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Link
            to={espressoPb.to}
            className="group flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 no-underline shadow-[0_2px_12px_rgba(107,66,38,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${espressoPb.accent}14`, color: espressoPb.accent }}
              >
                <EspressoIcon size={22} />
              </div>
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-wider text-amber mb-1">
                  {t('routes.howItWorks.espressoTeaser.badge')}
                </p>
                <h3 className="text-[18px] font-semibold text-text-primary font-serif">
                  {t('routes.howItWorks.espressoTeaser.title')}
                </h3>
                <p className="text-[14px] text-text-secondary mt-1">
                  {espressoPb.teaser}
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-coffee md:flex-shrink-0">
              <span>{t('routes.howItWorks.espressoTeaser.cta')}</span>
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </div>
          </Link>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-[24px] font-semibold text-text-primary font-serif mb-3">
            {t('routes.howItWorks.cta.title')}
          </h3>
          <p className="text-[16px] text-text-secondary mb-6">
            {t('routes.howItWorks.cta.subtitle')}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/sign-up"
              className="btn-shimmer flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-[15px] font-semibold text-white no-underline transition-all hover:-translate-y-px"
            >
              {t('routes.howItWorks.cta.getStartedFree')}
              <ChevronRight size={14} />
            </Link>
            <Link
              to="/features"
              className="px-6 py-2.5 rounded-lg text-[15px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 no-underline transition-all hover:bg-cream-3"
            >
              {t('routes.howItWorks.cta.viewFeatures')}
            </Link>
          </div>
        </motion.div>
      </div>

      <LandingFooter />
    </div>
  );
}
