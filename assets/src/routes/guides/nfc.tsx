import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';
import { PlaybookSection } from '@/components/landing/PlaybookSection';
import { ContinueReading } from '@/components/landing/ContinueReading';
import { usePlaybook } from '@/components/landing/playbooks';

export const Route = createFileRoute('/guides/nfc')({
  component: NfcGuidePage,
});

function NfcGuidePage() {
  const { t } = useTranslation();
  const playbook = usePlaybook('nfc');
  return (
    <div className="min-h-screen">
      <PageSeo
        title="Set up NFC check-in"
        description="Step-by-step guide for restaurant owners to replace the QR scan with a one-second NFC tap. Buy stickers, program them with your workspace URL, and place them at the counter."
        path="/guides/nfc"
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
            {t('playbooks.continueReading.allGuides')}
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <PlaybookSection playbook={playbook} />
        </motion.div>

        <ContinueReading currentKey={playbook.key} />

        <motion.div
          className="mt-12 flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Link
            to="/console/settings"
            hash="settings-nfc-checkin"
            className="btn-shimmer flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-[15px] font-semibold text-white no-underline transition-all hover:-translate-y-px"
          >
            {t('guides.cta.turnOnNfc')}
            <ChevronRight size={14} />
          </Link>
          <Link
            to="/guides/espresso"
            className="px-6 py-2.5 rounded-lg text-[15px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 no-underline transition-all hover:bg-cream-3"
          >
            {t('guides.cta.espressoDetails')}
          </Link>
        </motion.div>
      </div>

      <LandingFooter />
    </div>
  );
}
