"use client";

import { Mail, MessageCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useApplication } from "@/providers/application-provider";

export function ContactSection() {
  const { contactEmail } = useApplication();

  return (
    <section id="contact" className="mx-auto max-w-4xl px-6 py-24 md:px-8">
      <motion.div
        className="mb-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="mb-3 text-[13px] font-medium uppercase tracking-[2px] text-amber">Contact</p>
        <h3 className="font-serif text-[30px] font-semibold leading-tight text-text-primary md:text-[36px]">
          Get in touch
        </h3>
        <p className="mt-3 text-[16px] text-text-secondary">
          Have questions? We&apos;d love to hear from you.
        </p>
      </motion.div>

      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-5 md:grid-cols-2">
        <motion.a
          href={`mailto:${contactEmail}`}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-glass-border bg-glass-bg p-6 no-underline shadow-[0_2px_12px_rgba(107,66,38,0.05)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="absolute left-0 right-0 top-0 h-[2px] bg-coffee opacity-50 transition-opacity group-hover:opacity-100" />
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-coffee/10 text-coffee">
            <Mail size={20} strokeWidth={1.8} />
          </div>
          <h4 className="mb-1 text-[16px] font-semibold text-text-primary">Email us</h4>
          <p className="mb-2 text-[14.5px] font-medium text-coffee">{contactEmail}</p>
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] text-text-tertiary">We typically respond within 24 hours</p>
            <ArrowRight
              size={12}
              className="text-text-tertiary transition-all group-hover:translate-x-0.5 group-hover:text-coffee"
            />
          </div>
        </motion.a>

        <motion.div
          className="group relative overflow-hidden rounded-2xl border border-glass-border bg-glass-bg p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute left-0 right-0 top-0 h-[2px] bg-amber opacity-50 transition-opacity group-hover:opacity-100" />
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber/10 text-amber">
            <MessageCircle size={20} strokeWidth={1.8} />
          </div>
          <h4 className="mb-1 text-[16px] font-semibold text-text-primary">Feedback</h4>
          <p className="text-[14.5px] leading-relaxed text-text-secondary">
            Use the feedback widget in the bottom-right corner to report bugs or suggest features.
            We read every message.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
