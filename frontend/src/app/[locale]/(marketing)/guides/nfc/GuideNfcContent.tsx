"use client";

import { motion } from 'framer-motion';
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { PlaybookSection } from '@/components/landing/PlaybookSection';
import { ContinueReading } from '@/components/landing/ContinueReading';
import { useTranslations } from 'next-intl';
import { usePlaybook } from '@/components/landing/playbooks';


export function GuideNfcContent() {
  const t = useTranslations();
  const playbook = usePlaybook('nfc');
  return (
    <div className="pt-28 pb-20 px-6 md:px-8 max-w-3xl mx-auto page-enter">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link
          href="/guides"
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
        <NextLink
          href="/console/settings#settings-nfc-checkin"
          className="btn-shimmer flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-[15px] font-semibold text-white no-underline transition-all hover:-translate-y-px"
        >
          {t('guides.cta.turnOnNfc')}
          <ChevronRight size={14} />
        </NextLink>
        <Link
          href="/guides/espresso"
          className="px-6 py-2.5 rounded-lg text-[15px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 no-underline transition-all hover:bg-cream-3"
        >
          {t('guides.cta.espressoDetails')}
        </Link>
      </motion.div>
    </div>
  );
}
