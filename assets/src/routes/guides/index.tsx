import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';
import { playbooks } from '@/components/landing/playbooks';

export const Route = createFileRoute('/guides/')({
  component: GuidesIndexPage,
});

function GuidesIndexPage() {
  return (
    <div className="min-h-screen">
      <PageSeo
        title="Guides"
        description="Step-by-step playbooks for owners, employees, and teams upgrading to Espresso. Pick the path that matches you."
        path="/guides"
      />
      <LandingNav />

      <div className="pt-28 pb-20 px-6 md:px-8 max-w-6xl mx-auto page-enter">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber/10 text-amber text-[12px] font-semibold uppercase tracking-wider mb-4">
            <BookOpen size={14} />
            Guides
          </div>
          <h1 className="text-[34px] md:text-[44px] font-semibold text-text-primary font-serif leading-tight">
            Pick your path
          </h1>
          <p className="text-[17px] text-text-secondary mt-4 max-w-xl mx-auto">
            Short, focused playbooks for the three things people ask us about
            most. Each one takes about five minutes to read.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {playbooks.map((pb, i) => {
            const Icon = pb.icon;
            return (
              <motion.div
                key={pb.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link
                  to={pb.to}
                  className="group relative block h-full bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 no-underline shadow-[0_2px_12px_rgba(107,66,38,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl opacity-60 group-hover:opacity-100 transition-opacity"
                    style={{ background: pb.accent }}
                  />
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${pb.accent}14`, color: pb.accent }}
                  >
                    <Icon size={22} />
                  </div>
                  <h2 className="text-[18px] font-semibold text-text-primary font-serif mb-2">
                    {pb.title}
                  </h2>
                  <p className="text-[14px] text-text-secondary leading-relaxed mb-5">
                    {pb.teaser}
                  </p>
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold text-coffee">
                    <span>{pb.steps.length} steps</span>
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[14px] text-text-tertiary">
            Looking for the big picture instead?{' '}
            <Link to="/how-it-works" className="text-coffee font-semibold no-underline hover:underline">
              See how DailyBrew works
            </Link>
            .
          </p>
        </motion.div>
      </div>

      <LandingFooter />
    </div>
  );
}
