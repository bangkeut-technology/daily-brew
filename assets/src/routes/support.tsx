import { createFileRoute } from '@tanstack/react-router';
import {
  Mail,
  BookOpen,
  Lightbulb,
  Search,
  Rocket,
  QrCode,
  Clock,
  CalendarOff,
  CreditCard,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/support')({
  component: SupportPage,
});

const supportChannels = [
  {
    icon: Mail,
    title: 'Email support',
    description: 'Get a response within 24 hours',
    link: 'mailto:support@dailybrew.work',
    linkLabel: 'Send an email',
    iconBg: 'bg-coffee/10',
    iconColor: 'text-coffee',
  },
  {
    icon: BookOpen,
    title: 'Documentation',
    description: 'Guides and tutorials to get you started',
    link: '#',
    linkLabel: 'Browse docs',
    iconBg: 'bg-amber/10',
    iconColor: 'text-amber',
  },
  {
    icon: Lightbulb,
    title: 'Feature request',
    description: 'Suggest a feature you would like to see',
    link: '#',
    linkLabel: 'Submit idea',
    iconBg: 'bg-green/10',
    iconColor: 'text-green',
  },
];

const commonTopics = [
  {
    icon: Rocket,
    title: 'Getting started',
    description: 'Create your workspace, add employees, and generate QR codes in minutes.',
    link: '#',
  },
  {
    icon: QrCode,
    title: 'QR check-in',
    description: 'Learn how staff scan their unique QR code to check in and out each day.',
    link: '#',
  },
  {
    icon: Clock,
    title: 'Shift management',
    description: 'Set up morning, evening, or custom shifts and assign them to employees.',
    link: '#',
  },
  {
    icon: CalendarOff,
    title: 'Leave requests',
    description: 'How employees submit leave and how owners approve or reject requests.',
    link: '#',
  },
  {
    icon: CreditCard,
    title: 'Billing & plans',
    description: 'Understand Free vs Espresso, manage subscriptions, and update payment details.',
    link: '#',
  },
  {
    icon: ShieldCheck,
    title: 'Account & security',
    description: 'Password resets, OAuth sign-in, IP restrictions, and keeping your data safe.',
    link: '#',
  },
];

function SupportPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />

      <PageSeo
        title="Support"
        description="Get help with DailyBrew. Contact our team, browse guides, or submit feature requests for your restaurant attendance tracking."
        path="/support"
      />

      <main className="page-enter pt-20">
        {/* Hero */}
        <section className="py-20 px-6 md:px-8 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
              Support
            </p>
            <h1 className="text-[34px] md:text-[42px] font-semibold text-text-primary font-serif leading-tight mb-4">
              How can we help?
            </h1>
            <p className="text-[16px] text-text-secondary mb-8 max-w-md mx-auto">
              Find answers, browse guides, or get in touch with our team.
            </p>
          </motion.div>

          {/* Search input (visual only) */}
          <motion.div
            className="max-w-lg mx-auto"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-glass-bg backdrop-blur-md border border-glass-border text-[16px] text-text-primary placeholder:text-text-tertiary shadow-[0_2px_12px_rgba(107,66,38,0.05)] outline-none focus:border-amber/40 focus:shadow-[0_4px_16px_rgba(193,127,59,0.10)] transition-all duration-200"
                readOnly
              />
            </div>
          </motion.div>
        </section>

        {/* Support channels */}
        <section className="px-6 md:px-8 max-w-4xl mx-auto pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {supportChannels.map((channel, i) => (
              <motion.a
                key={channel.title}
                href={channel.link}
                className="group relative bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)] no-underline overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-[#C17F3B]/10 via-transparent to-[#E8A85A]/10 blur-sm" />

                <div className="relative">
                  <div
                    className={cn('w-11 h-11 rounded-xl flex items-center justify-center mb-4', channel.iconBg, channel.iconColor)}
                  >
                    <channel.icon size={20} strokeWidth={1.8} />
                  </div>
                  <h3 className="text-[16px] font-semibold text-text-primary mb-1.5">
                    {channel.title}
                  </h3>
                  <p className="text-[14px] text-text-secondary leading-relaxed mb-4">
                    {channel.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[14px] font-medium text-coffee group-hover:text-coffee-light transition-colors">
                    {channel.linkLabel}
                    <ArrowRight
                      size={13}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </section>

        {/* Common topics */}
        <section className="py-16 px-6 md:px-8 max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
              Help center
            </p>
            <h2 className="text-[30px] md:text-[36px] font-semibold text-text-primary font-serif leading-tight">
              Common topics
            </h2>
            <p className="text-[16px] text-text-secondary mt-3 max-w-md mx-auto">
              Quick answers to the most common questions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {commonTopics.map((topic, i) => (
              <motion.a
                key={topic.title}
                href={topic.link}
                className="group relative bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)] no-underline overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(107,66,38,0.10)]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center text-amber mb-4">
                    <topic.icon size={18} strokeWidth={1.8} />
                  </div>
                  <h3 className="text-[16px] font-semibold text-text-primary mb-1.5">
                    {topic.title}
                  </h3>
                  <p className="text-[14px] text-text-secondary leading-relaxed mb-3">
                    {topic.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[14px] font-medium text-coffee group-hover:text-coffee-light transition-colors">
                    Learn more
                    <ArrowRight
                      size={13}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </section>

        {/* Bottom contact section */}
        <section className="py-16 px-6 md:px-8 max-w-2xl mx-auto">
          <motion.div
            className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-8 text-center shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-12 h-12 rounded-xl bg-coffee/10 flex items-center justify-center text-coffee mx-auto mb-4">
              <Mail size={22} strokeWidth={1.8} />
            </div>
            <h3 className="text-[20px] font-semibold text-text-primary font-serif mb-2">
              Still need help?
            </h3>
            <p className="text-[15px] text-text-secondary leading-relaxed mb-5 max-w-sm mx-auto">
              Our team is here for you. Send us an email and we will get back to
              you within 24 hours.
            </p>
            <a
              href="mailto:support@dailybrew.work"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[15px] font-medium bg-coffee text-white no-underline transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)]"
            >
              <Mail size={14} />
              support@dailybrew.work
            </a>
          </motion.div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
