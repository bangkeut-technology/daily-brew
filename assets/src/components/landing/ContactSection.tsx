import { Mail, MessageCircle } from 'lucide-react';
import { useApplication } from '@/hooks/use-application';
import { motion } from 'framer-motion';

export function ContactSection() {
  const { contactEmail } = useApplication();

  return (
    <section id="contact" className="py-20 px-6 md:px-8 max-w-3xl mx-auto">
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[11px] uppercase tracking-[2px] font-medium text-amber mb-3">
          Contact
        </p>
        <h3 className="text-[28px] md:text-[34px] font-semibold text-text-primary font-serif leading-tight">
          Get in touch
        </h3>
        <p className="text-[14px] text-text-secondary mt-3">
          Have questions? We'd love to hear from you.
        </p>
      </motion.div>

      <motion.div
        className="group relative bg-white/60 backdrop-blur-md border border-white/85 rounded-2xl p-8 shadow-[0_2px_12px_rgba(107,66,38,0.05)] max-w-lg mx-auto overflow-hidden"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        {/* Animated border gradient effect */}
        <div className="absolute -inset-px rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background:
                'linear-gradient(135deg, rgba(193,127,59,0.15), transparent 40%, transparent 60%, rgba(232,168,90,0.12))',
            }}
          />
        </div>

        <div className="relative space-y-6">
          <motion.div
            className="flex items-start gap-4"
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <div className="w-10 h-10 rounded-xl bg-coffee/10 flex items-center justify-center text-coffee shrink-0">
              <Mail size={18} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-text-primary mb-1">
                Email us
              </p>
              <a
                href={`mailto:${contactEmail}`}
                className="text-[13px] text-coffee font-medium no-underline hover:text-coffee-light transition-colors"
              >
                {contactEmail}
              </a>
              <p className="text-[11px] text-text-tertiary mt-1">
                We typically respond within 24 hours
              </p>
            </div>
          </motion.div>

          <div className="h-px bg-cream-3/60" />

          <motion.div
            className="flex items-start gap-4"
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <div className="w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center text-amber shrink-0">
              <MessageCircle size={18} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-text-primary mb-1">
                Feedback
              </p>
              <p className="text-[12px] text-text-secondary leading-relaxed">
                Use the feedback widget in the bottom-right corner to report
                bugs or suggest features. We read every message.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
