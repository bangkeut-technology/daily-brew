"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { playbooks, type Playbook } from "./playbooks";

type Props = {
  currentKey: Playbook["key"];
};

/**
 * Shows the non-current playbook cards as sibling links. Marketing is static
 * and provider-free, so the legacy feature-flag gating (useFeatures) is dropped
 * — the NFC guide is already a public, indexable page, so it always lists.
 */
export function ContinueReading({ currentKey }: Props) {
  const siblings = playbooks.filter((p) => p.key !== currentKey);
  return (
    <section aria-labelledby="continue-reading-heading" className="mt-16">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[12px] uppercase tracking-[2px] font-medium text-amber mb-1">Continue reading</p>
          <h2
            id="continue-reading-heading"
            className="text-[20px] font-semibold text-text-primary font-serif leading-tight"
          >
            Other guides
          </h2>
        </div>
        <Link
          href="/guides"
          className="hidden sm:inline-flex items-center gap-1.5 text-[14px] font-semibold text-coffee no-underline hover:underline"
        >
          All guides
          <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {siblings.map((pb, i) => {
          const Icon = pb.icon;
          return (
            <motion.div
              key={pb.key}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
            >
              <Link
                href={pb.to}
                className="group relative block h-full bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-5 no-underline shadow-[0_2px_12px_rgba(107,66,38,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity"
                  style={{ background: pb.accent }}
                />
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${pb.accent}14`, color: pb.accent }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-semibold text-text-primary font-serif">{pb.title}</h3>
                    <p className="mt-1 text-[13px] text-text-secondary leading-relaxed line-clamp-2">{pb.teaser}</p>
                    <div className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-coffee">
                      <span>{pb.steps.length} steps</span>
                      <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
