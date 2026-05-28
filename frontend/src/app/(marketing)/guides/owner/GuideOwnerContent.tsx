"use client";

import Link from "next/link";
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { PlaybookSection } from '@/components/landing/PlaybookSection';
import { ContinueReading } from '@/components/landing/ContinueReading';
import { playbookByKey } from '@/components/landing/playbooks';

const playbook = playbookByKey.owner;

export function GuideOwnerContent() {
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

      <ContinueReading currentKey={playbook.key} />

      <motion.div
        className="mt-12 flex items-center justify-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Link
          href="/sign-up"
          className="btn-shimmer flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-[15px] font-semibold text-white no-underline transition-all hover:-translate-y-px"
        >
          Get started free
          <ChevronRight size={14} />
        </Link>
        <Link
          href="/guides/espresso"
          className="px-6 py-2.5 rounded-lg text-[15px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 no-underline transition-all hover:bg-cream-3"
        >
          Upgrade to Espresso
        </Link>
      </motion.div>
    </div>
  );
}
