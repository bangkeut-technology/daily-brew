import { createFileRoute, Link } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';

export const Route = createFileRoute('/stop-buddy-punching')({
  component: StopBuddyPunchingPage,
});

const STEP_KEYS = ['step1', 'step2', 'step3'] as const;
const FAQ_KEYS = ['cost', 'privacy', 'staff', 'forgotten'] as const;

function AccordionItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      className="border-b border-cream-3/50 last:border-b-0"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left bg-transparent border-none cursor-pointer group"
      >
        <span className="text-[16px] font-medium text-text-primary pr-4 group-hover:text-coffee transition-colors duration-200">
          {question}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
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
            <div className="px-6 pb-5">
              <p className="text-[15px] text-text-secondary leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StopBuddyPunchingPage() {
  const { t } = useTranslation();
  const ns = 'routes.stopBuddyPunching';
  return (
    <div className="min-h-screen flex flex-col">
      <PageSeo
        title={t(`${ns}.title`)}
        description={t(`${ns}.subtitleHtml`).replace(/<[^>]+>/g, '')}
        path="/stop-buddy-punching"
      />
      <LandingNav />

      <main className="page-enter pt-20">
        <section className="mx-auto max-w-3xl px-6 pt-20 pb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-amber">{t(`${ns}.eyebrow`)}</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-text-primary sm:text-5xl">
            {t(`${ns}.title`)}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-text-secondary">
            <Trans i18nKey={`${ns}.subtitleHtml`} components={{ strong: <strong /> }} />
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              to="/sign-up"
              className="rounded-2xl bg-coffee px-6 py-3 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
            >
              {t(`${ns}.ctaStartFree`)}
            </Link>
            <Link
              to="/three-factor-attendance"
              className="rounded-2xl border border-glass-border bg-glass-bg px-6 py-3 text-sm font-medium text-text-primary no-underline transition-colors hover:bg-cream-3"
            >
              {t(`${ns}.ctaSeeVerification`)}
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="mb-8 text-center font-serif text-3xl font-semibold text-text-primary">
            {t(`${ns}.stepsTitle`)}
          </h2>
          <div className="space-y-4">
            {STEP_KEYS.map((key, i) => (
              <div
                key={key}
                className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl flex gap-5 p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
              >
                <span className="font-serif text-2xl font-semibold text-coffee">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-semibold text-text-primary">{t(`${ns}.${key}Title`)}</h3>
                  <p className="mt-1 text-sm leading-7 text-text-secondary">{t(`${ns}.${key}Body`)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-12">
          <h2 className="mb-6 text-center font-serif text-3xl font-semibold text-text-primary">
            {t(`${ns}.faqTitle`)}
          </h2>
          <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(107,66,38,0.05)]">
            {FAQ_KEYS.map((key, i) => (
              <AccordionItem
                key={key}
                question={t(`${ns}.faq.${key}.q`)}
                answer={t(`${ns}.faq.${key}.a`)}
                index={i}
              />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20">
          <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-10 text-center shadow-[0_2px_12px_rgba(107,66,38,0.05)]">
            <h2 className="font-serif text-2xl font-semibold text-text-primary">
              {t(`${ns}.ctaCardTitle`)}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-text-secondary">
              {t(`${ns}.ctaCardSubtitle`)}
            </p>
            <Link
              to="/sign-up"
              className="mt-6 inline-block rounded-2xl bg-coffee px-6 py-3 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
            >
              {t(`${ns}.ctaCardButton`)}
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
