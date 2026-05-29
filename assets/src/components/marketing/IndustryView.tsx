import { Link } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { Industry } from '@/lib/industries';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';

/**
 * Shared template for every /<industry-slug> page. Data-driven from
 * assets/src/lib/industries.ts. PageSeo uses the metaTitle/metaDescription;
 * the canonical localized meta still lives in SeoMetaResolver server-side.
 */
const FAQ = [
  {
    question: 'Is it really free?',
    answer:
      'Yes — free forever for up to 10 active employees, with no credit card required. Paid plans add device verification, IP restriction, leave management, and more.',
  },
  {
    question: 'Do staff need to install an app?',
    answer:
      "No. Staff scan a QR code with their phone's camera and check in from the web — nothing to download. NFC tap-to-clock-in is in beta.",
  },
  {
    question: 'How does it stop buddy punching?',
    answer:
      "Each clock-in is bound to a verified device and your shop's network. A punch from someone else's phone, or from off your network, won't count — no biometrics needed.",
  },
  {
    question: 'What if someone forgets their phone?',
    answer:
      "A manager clocks them in from the dashboard. It's recorded as an override with the manager's name, time, and reason in the audit trail.",
  },
];

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
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

export function IndustryView({ industry }: { industry: Industry }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PageSeo title={industry.metaTitle} description={industry.metaDescription} path={`/${industry.slug}`} />
      <LandingNav />

      <main className="page-enter pt-20">
        <section className="mx-auto max-w-3xl px-6 pt-20 pb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-amber">{industry.eyebrow}</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-text-primary sm:text-5xl">
            {industry.metaTitle}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-text-secondary">{industry.lede}</p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              to="/sign-up"
              className="rounded-2xl bg-coffee px-6 py-3 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
            >
              Start free
            </Link>
            <Link
              to="/three-factor-attendance"
              className="rounded-2xl border border-glass-border bg-glass-bg px-6 py-3 text-sm font-medium text-text-primary no-underline transition-colors hover:bg-cream-3"
            >
              How verification works
            </Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-5 px-6 py-12 sm:grid-cols-3">
          {industry.painPoints.map((point) => (
            <div
              key={point.title}
              className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
            >
              <h2 className="font-serif text-lg font-semibold text-text-primary">{point.title}</h2>
              <p className="mt-2 text-sm leading-7 text-text-secondary">{point.body}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto max-w-3xl px-6 py-12 text-center">
          <h2 className="font-serif text-3xl font-semibold text-text-primary">
            Verified clock-ins, built for {industry.name}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
            Every punch is bound to a verified device and your shop&apos;s network — the same
            three-factor stack behind{' '}
            <Link to="/stop-buddy-punching" className="text-coffee underline underline-offset-2">
              stopping buddy punching
            </Link>
            . No biometrics, no face scans. Add{' '}
            <Link to="/features" className="text-coffee underline underline-offset-2">
              shifts, leave, and notifications
            </Link>{' '}
            when you need them.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-12">
          <h2 className="mb-6 text-center font-serif text-3xl font-semibold text-text-primary">Frequently asked</h2>
          <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(107,66,38,0.05)]">
            {FAQ.map((item, i) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} index={i} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20">
          <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-10 text-center shadow-[0_2px_12px_rgba(107,66,38,0.05)]">
            <h2 className="font-serif text-2xl font-semibold text-text-primary">
              Honest timesheets for {industry.name}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-text-secondary">
              Free for up to 10 active employees. No hardware, no biometrics, no contract.
            </p>
            <Link
              to="/sign-up"
              className="mt-6 inline-block rounded-2xl bg-coffee px-6 py-3 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
            >
              Create your free account
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
