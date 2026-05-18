import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';
import { PlaybookSection } from '@/components/landing/PlaybookSection';
import { playbookByKey } from '@/components/landing/playbooks';

export const Route = createFileRoute('/guides/owner')({
  component: OwnerGuidePage,
});

const playbook = playbookByKey.owner;

function OwnerGuidePage() {
  return (
    <div className="min-h-screen">
      <PageSeo
        title="Owner setup guide"
        description="From sign-up to live attendance in about 10 minutes. Step-by-step setup for restaurant owners using DailyBrew."
        path="/guides/owner"
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
            Get started free
            <ChevronRight size={14} />
          </Link>
          <Link
            to="/guides/espresso"
            className="px-6 py-2.5 rounded-lg text-[15px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 no-underline transition-all hover:bg-cream-3"
          >
            Upgrade to Espresso
          </Link>
        </motion.div>
      </div>

      <LandingFooter />
    </div>
  );
}
