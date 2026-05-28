import { createFileRoute } from '@tanstack/react-router';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';

export const Route = createFileRoute('/faq')({
  component: FaqPage,
});

/**
 * The FAQ content lives in the i18n bundle (common.json → faq.sections).
 * This file only declares the *shape* (section keys + question keys per section);
 * the actual question + answer strings come from `t('faq.q.<key>')` and
 * `t('faq.a.<key>')`. Adding a question = add the key here AND the string in
 * en/fr/km common.json — same shape across all three.
 */
interface SectionShape {
  /** i18n key for the section title (e.g. 'faq.sections.general'). */
  titleKey: string;
  /** Stable identifiers used to look up the question + answer in i18n. */
  itemKeys: string[];
}

const FAQ_SECTIONS: SectionShape[] = [
  {
    titleKey: 'faq.sections.general',
    itemKeys: ['whatIsDailybrew', 'whoIsItFor', 'mobileApp'],
  },
  {
    titleKey: 'faq.sections.plansBilling',
    itemKeys: ['freePlan', 'espressoPlan', 'espressoCost', 'cancelAnytime'],
  },
  {
    titleKey: 'faq.sections.checkin',
    itemKeys: ['qrCheckin', 'geofencing', 'ipRestriction', 'closures'],
  },
  {
    titleKey: 'faq.sections.manager',
    itemKeys: [
      'managerRole',
      'managerDefaults',
      'managerLimit',
      'promoteManager',
      'managerNotAllowed',
    ],
  },
  {
    titleKey: 'faq.sections.account',
    itemKeys: ['signUp', 'oauthSignIn', 'resetPassword'],
  },
];

function AccordionItem({
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
            <div className="px-6 pb-5">
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

function FaqPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* PageSeo title/description stay in English to match SeoMetaResolver's source-of-truth
          for SEO meta. The server-rendered <title> + meta description are already
          localized by SeoMetaResolver based on ?lang=. */}
      <PageSeo
        title="FAQ"
        description="Frequently asked questions about DailyBrew. Learn about QR check-in, shifts, leave requests, pricing, and how to get started with attendance tracking."
        path="/faq"
      />
      <LandingNav />

      <main className="page-enter pt-20">
        {/* Hero */}
        <section className="py-20 px-6 md:px-8 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
              {t('faq.eyebrow')}
            </p>
            <h1 className="text-[34px] md:text-[42px] font-semibold text-text-primary font-serif leading-tight mb-4">
              {t('faq.title')}
            </h1>
            <p className="text-[16px] text-text-secondary max-w-md mx-auto">
              {t('faq.subtitlePrefix')}{' '}
              <a
                href="mailto:support@mail.dailybrew.work"
                className="text-coffee font-medium no-underline hover:text-coffee-light transition-colors"
              >
                {t('faq.subtitleLink')}
              </a>
            </p>
          </motion.div>
        </section>

        {/* FAQ sections */}
        <section className="px-6 md:px-8 max-w-2xl mx-auto pb-20 space-y-10">
          {FAQ_SECTIONS.map((section, sectionIndex) => (
            <motion.div
              key={section.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: sectionIndex * 0.08 }}
            >
              <h2 className="text-[13px] uppercase tracking-[2px] font-medium text-text-tertiary mb-4 px-6">
                {t(section.titleKey)}
              </h2>
              <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(107,66,38,0.05)]">
                {section.itemKeys.map((key, itemIndex) => (
                  <AccordionItem
                    key={key}
                    question={t(`faq.q.${key}`)}
                    answer={t(`faq.a.${key}`)}
                    index={itemIndex}
                  />
                ))}
              </div>
            </motion.div>
          ))}

          {/* Bottom CTA */}
          <motion.div
            className="text-center pt-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-[15px] text-text-secondary mb-4">
              {t('faq.cta.text')}
            </p>
            <a
              href="mailto:support@mail.dailybrew.work"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[15px] font-medium bg-coffee text-white no-underline transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)]"
            >
              {t('faq.cta.button')}
            </a>
          </motion.div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
