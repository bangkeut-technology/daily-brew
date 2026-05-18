import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';
import { PlaybookSection } from '@/components/landing/PlaybookSection';
import { playbookByKey } from '@/components/landing/playbooks';

export const Route = createFileRoute('/guides/espresso')({
  component: EspressoGuidePage,
});

const playbook = playbookByKey.espresso;

function EspressoGuidePage() {
  return (
    <div className="min-h-screen">
      <PageSeo
        title="Upgrade to Espresso"
        description="Unlock leave management, geofencing, device verification, managers, and BasilBook integration on the Espresso plan."
        path="/guides/espresso"
      />
      <LandingNav />

      <div className="pt-28 pb-20 px-6 md:px-8 max-w-3xl mx-auto page-enter">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            to="/guides"
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-text-tertiary hover:text-coffee no-underline transition-colors"
          >
            <ArrowLeft size={14} />
            All guides
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <PlaybookSection playbook={playbook} />
        </motion.div>

        <motion.div
          className="mt-12 flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Link
            to="/sign-up"
            className="btn-shimmer flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-[15px] font-semibold text-white no-underline transition-all hover:-translate-y-px"
          >
            Start 14-day trial
            <ChevronRight size={14} />
          </Link>
          <Link
            to="/features"
            className="px-6 py-2.5 rounded-lg text-[15px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 no-underline transition-all hover:bg-cream-3"
          >
            See all features
          </Link>
        </motion.div>
      </div>

      <LandingFooter />
    </div>
  );
}
