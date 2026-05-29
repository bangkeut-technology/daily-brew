import { Link } from '@tanstack/react-router';
import { ChevronRight, QrCode, CheckCircle, Clock, Users, Shield, Nfc, Smartphone, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { AppStoreBadge } from '@/components/shared/AppStoreBadge';
import { PlayStoreBadge } from '@/components/shared/PlayStoreBadge';

const floatingCardVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.6 + i * 0.15, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const trustItems: { icon: React.ReactNode; key: string }[] = [
  { icon: <QrCode size={14} />,    key: 'qrCheckin' },
  { icon: <Nfc size={14} />,       key: 'nfcTap' },
  { icon: <Clock size={14} />,     key: 'shiftTracking' },
  { icon: <Users size={14} />,     key: 'leaveManagement' },
  { icon: <Shield size={14} />,    key: 'geofencing' },
];

export function HeroSection() {
  const { t } = useTranslation();
  return (
    <section className="relative pt-32 pb-24 px-6 md:px-8 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-amber/[0.07] blur-[100px]"
          animate={{ y: [0, 30, 0], x: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-coffee/[0.05] blur-[100px]"
          animate={{ y: [0, -20, 0], x: [0, -15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/4 right-1/3 w-[300px] h-[300px] rounded-full bg-amber-light/[0.04] blur-[80px]"
          animate={{ y: [0, 18, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div>
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber/8 border border-amber/15 mb-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
              <span className="text-[13px] font-medium text-amber tracking-wide">
                {t('homepage.hero.badge')}
              </span>
            </motion.div>

            <motion.h1
              className="text-[40px] md:text-[54px] font-semibold text-text-primary leading-[1.08] mb-6 font-serif"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {t('homepage.hero.titleLine1')}
              <br />
              <span className="text-coffee">{t('homepage.hero.titleLine2')}</span>
            </motion.h1>

            <motion.p
              className="text-[18px] md:text-[19px] text-text-secondary mb-6 max-w-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t('homepage.hero.subtitle')}
            </motion.p>

            {/* Savings + no-biometrics callout. Single sentence so it sits
                between the subtitle and the CTAs without crowding either.
                The savings claim leans on Nucleus Research's 2.2% number
                (the same figure cited on /stop-buddy-punching and the
                buddy-punching blog post) so the marketing surface stays
                internally consistent. */}
            <motion.div
              className="inline-flex items-start gap-2.5 mb-8 max-w-lg px-3.5 py-2.5 rounded-xl bg-coffee/[0.05] border border-coffee/15"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <Coins size={16} className="text-coffee mt-0.5 shrink-0" />
              <p className="text-[14px] leading-relaxed text-text-primary">
                {t('homepage.hero.savingsCallout')}
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row items-start gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                to="/sign-up"
                className="btn-shimmer inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[17px] font-semibold text-white border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(107,66,38,0.30)] no-underline"
              >
                {t('homepage.hero.ctaPrimary')}
                <ChevronRight size={16} />
              </Link>
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-[16px] font-medium text-text-primary bg-glass-bg backdrop-blur-sm border border-glass-border hover:bg-cream-3 transition-all duration-200 no-underline cursor-pointer"
              >
                {t('homepage.hero.ctaSecondary')}
              </Link>
            </motion.div>

            <motion.div
              className="flex flex-wrap items-center gap-4 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <p className="text-[13.5px] text-text-tertiary">
                {t('homepage.hero.noCreditCard')}
              </p>
              <span className="w-1 h-1 rounded-full bg-cream-3" />
              <p className="text-[13.5px] text-text-tertiary">
                {t('homepage.hero.fastSetup')}
              </p>
              <span className="w-1 h-1 rounded-full bg-cream-3" />
              <p className="text-[13.5px] text-text-tertiary">
                {t('homepage.hero.noHardware')}
              </p>
            </motion.div>

            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex flex-wrap items-center gap-3">
                <AppStoreBadge className="inline-block opacity-80 hover:opacity-100 transition-opacity" />
                <PlayStoreBadge className="inline-block opacity-80 hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          </div>

          {/* Right — dashboard preview with side cards */}
          <div className="hidden lg:flex flex-col gap-4">
            {/* Notification card — above dashboard */}
            <motion.div
              className="self-end bg-glass-bg backdrop-blur-xl border border-glass-border rounded-xl px-4 py-3 shadow-[0_4px_20px_rgba(107,66,38,0.08)]"
              custom={3}
              variants={floatingCardVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-green/10 flex items-center justify-center">
                  <CheckCircle size={14} className="text-green" />
                </div>
                <div>
                  <p className="text-[12.5px] font-medium text-text-primary">
                    {t('homepage.hero.preview.notification.title', { name: 'Sophea' })}
                  </p>
                  <p className="text-[11px] text-text-tertiary">
                    {t('homepage.hero.preview.notification.sub')}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Main dashboard card */}
            <motion.div
              className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-6 shadow-[0_8px_40px_rgba(107,66,38,0.08)]"
              custom={0}
              variants={floatingCardVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Dashboard header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[12px] uppercase tracking-[1px] font-medium text-text-tertiary mb-0.5">
                    {t('homepage.hero.preview.dashboardEyebrow')}
                  </p>
                  <p className="text-[17px] font-semibold text-text-primary font-serif">
                    {t('homepage.hero.preview.dashboardTitle')}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
                  <span className="text-[12px] text-green font-medium">{t('homepage.hero.preview.liveBadge')}</span>
                </div>
              </div>

              {/* Mini stat row */}
              <div className="grid grid-cols-4 gap-2.5 mb-5">
                {[
                  { key: 'present', value: '7', color: '#4A7C59' },
                  { key: 'late',    value: '1', color: '#C17F3B' },
                  { key: 'leave',   value: '1', color: '#3B6FA0' },
                  { key: 'absent',  value: '0', color: '#C0392B' },
                ].map((s) => (
                  <div key={s.key} className="bg-cream/60 dark:bg-cream/5 rounded-xl p-2.5 text-center">
                    <p
                      className="text-[20px] font-semibold leading-none mb-0.5"
                      style={{ color: s.color }}
                    >
                      {s.value}
                    </p>
                    <p className="text-[11px] text-text-tertiary uppercase tracking-wider">
                      {t(`homepage.hero.preview.stats.${s.key}`)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Attendance rows — names + times are mock decoration, kept as-is.
                  Shift names + status labels go through i18n so the preview
                  feels native in FR/KM. */}
              <div className="space-y-0">
                {[
                  { name: 'Sophea Chan',   initials: 'SC', shiftKey: 'morning', time: '06:58', statusKey: 'onTime',  statusColor: '#4A7C59', grad: 0 },
                  { name: 'Dara Sok',      initials: 'DS', shiftKey: 'morning', time: '07:12', statusKey: 'late',    statusColor: '#C17F3B', grad: 1 },
                  { name: 'Sreyleak Heng', initials: 'SH', shiftKey: 'evening', time: '—',     statusKey: 'onLeave', statusColor: '#3B6FA0', grad: 2 },
                ].map((r, i) => (
                  <div
                    key={r.name}
                    className={cn('flex items-center gap-2.5 px-3 py-2.5 rounded-lg', i === 0 && 'bg-cream/40 dark:bg-cream/5')}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold text-white shrink-0"
                      style={{
                        background: [
                          'linear-gradient(135deg, #C17F3B, #6B4226)',
                          'linear-gradient(135deg, #3B6FA0, #1a3a5c)',
                          'linear-gradient(135deg, #4A7C59, #2a4a35)',
                        ][r.grad],
                      }}
                    >
                      {r.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-medium text-text-primary truncate">
                        {r.name}
                      </p>
                      <p className="text-[11.5px] text-text-tertiary">
                        {t(`homepage.hero.preview.shifts.${r.shiftKey}`)}
                      </p>
                    </div>
                    <span className="text-[12.5px] text-text-secondary font-mono tabular-nums mr-2">
                      {r.time}
                    </span>
                    <span
                      className="text-[11px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{
                        background: `${r.statusColor}15`,
                        color: r.statusColor,
                      }}
                    >
                      {t(`homepage.hero.preview.statuses.${r.statusKey}`)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* QR + NFC mini-cards row */}
            <div className="self-start flex items-start gap-3">
              {/* QR card */}
              <motion.div
                className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-4 shadow-[0_4px_20px_rgba(107,66,38,0.08)] w-[150px]"
                custom={2}
                variants={floatingCardVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-coffee/10 flex items-center justify-center">
                    <QrCode size={13} className="text-coffee" />
                  </div>
                  <p className="text-[12px] font-medium text-text-primary">{t('homepage.hero.preview.qrCheckin')}</p>
                </div>
                <div className="w-full aspect-square rounded-xl bg-cream-3/40 dark:bg-cream-3/10 flex items-center justify-center p-3">
                  <svg viewBox="0 0 21 21" className="w-full h-full" shapeRendering="crispEdges">
                    <rect x="0" y="0" width="7" height="7" fill="currentColor" className="text-coffee" />
                    <rect x="1" y="1" width="5" height="5" fill="currentColor" className="text-cream-3/60" />
                    <rect x="2" y="2" width="3" height="3" fill="currentColor" className="text-coffee" />
                    <rect x="14" y="0" width="7" height="7" fill="currentColor" className="text-coffee" />
                    <rect x="15" y="1" width="5" height="5" fill="currentColor" className="text-cream-3/60" />
                    <rect x="16" y="2" width="3" height="3" fill="currentColor" className="text-coffee" />
                    <rect x="0" y="14" width="7" height="7" fill="currentColor" className="text-coffee" />
                    <rect x="1" y="15" width="5" height="5" fill="currentColor" className="text-cream-3/60" />
                    <rect x="2" y="16" width="3" height="3" fill="currentColor" className="text-coffee" />
                    {[
                      [8,0],[10,0],[8,2],[9,2],[10,3],[8,4],[10,4],
                      [0,8],[2,8],[4,8],[6,8],[8,8],[10,8],[12,8],[14,8],[16,8],[18,8],[20,8],
                      [8,10],[9,9],[11,9],[13,10],[15,10],[17,9],[19,10],
                      [9,11],[11,11],[14,12],[16,12],[18,11],[20,12],
                      [8,13],[10,13],[12,14],[14,14],[16,14],[19,13],
                      [9,15],[11,16],[13,15],[15,16],[17,15],[19,16],
                      [8,17],[10,18],[12,17],[14,18],[16,17],[18,18],[20,17],
                      [8,20],[10,19],[12,20],[15,19],[17,20],[19,19],[20,20],
                    ].map(([x, y], i) => (
                      <rect key={i} x={x} y={y} width="1" height="1" fill="currentColor" className="text-coffee" />
                    ))}
                  </svg>
                </div>
              </motion.div>

              {/* NFC tap-in card — represents an NFC tag with an animated tap-radio
                  wave. Sized to match the QR card. */}
              <motion.div
                className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-4 shadow-[0_4px_20px_rgba(107,66,38,0.08)] w-[150px]"
                custom={4}
                variants={floatingCardVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-amber/10 flex items-center justify-center">
                    <Nfc size={13} className="text-amber" />
                  </div>
                  <p className="text-[12px] font-medium text-text-primary">{t('homepage.hero.preview.nfcTap')}</p>
                </div>
                <div className="relative w-full aspect-square rounded-xl bg-cream-3/40 dark:bg-cream-3/10 flex items-center justify-center overflow-hidden">
                  {/* Concentric tap-radio waves */}
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="absolute rounded-full border-2 border-amber/60"
                      style={{ width: 28, height: 28 }}
                      initial={{ scale: 1, opacity: 0.7 }}
                      animate={{ scale: [1, 2.6, 2.6], opacity: [0.7, 0, 0] }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        delay: i * 0.8,
                        ease: 'easeOut',
                      }}
                    />
                  ))}
                  {/* Phone + NFC tag depiction: small phone outline tapping a tag */}
                  <div className="relative z-10 flex items-center gap-1.5">
                    <div className="w-6 h-9 rounded-md bg-coffee/85 flex items-center justify-center shadow-sm">
                      <Smartphone size={10} className="text-cream" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-amber flex items-center justify-center shadow-sm">
                      <Nfc size={12} className="text-white" />
                    </div>
                  </div>
                </div>
                <p className="text-[10.5px] text-text-tertiary mt-2 text-center leading-tight">
                  {t('homepage.hero.preview.nfcTapHint')}
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto mt-20"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          {trustItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-glass-bg backdrop-blur-sm border border-glass-border"
            >
              <span className="text-coffee">{item.icon}</span>
              <span className="text-[13.5px] font-medium text-text-secondary">
                {t(`homepage.hero.trust.${item.key}`)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
