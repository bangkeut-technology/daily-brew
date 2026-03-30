import { Mail, MessageCircle, ArrowRight } from 'lucide-react';
import { useApplication } from '@/hooks/use-application';
import { motion } from 'framer-motion';

export function ContactSection() {
  const { contactEmail } = useApplication();

  return (
    <section id="contact" className="py-24 px-6 md:px-8 max-w-4xl mx-auto">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
          Contact
        </p>
        <h3 className="text-[30px] md:text-[36px] font-semibold text-text-primary font-serif leading-tight">
          Get in touch
        </h3>
        <p className="text-[16px] text-text-secondary mt-3">
          Have questions? We'd love to hear from you.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
        {/* Email */}
        <motion.a
          href={`mailto:${contactEmail}`}
          className="group relative bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)] overflow-hidden no-underline cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-coffee opacity-50 group-hover:opacity-100 transition-opacity" />

          <div className="w-11 h-11 rounded-xl bg-coffee/10 flex items-center justify-center text-coffee mb-4">
            <Mail size={20} strokeWidth={1.8} />
          </div>
          <h4 className="text-[16px] font-semibold text-text-primary mb-1">Email us</h4>
          <p className="text-[14.5px] text-coffee font-medium mb-2">
            {contactEmail}
          </p>
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] text-text-tertiary">
              We typically respond within 24 hours
            </p>
            <ArrowRight size={12} className="text-text-tertiary group-hover:text-coffee group-hover:translate-x-0.5 transition-all" />
          </div>
        </motion.a>

        {/* Feedback */}
        <motion.div
          className="group relative bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber opacity-50 group-hover:opacity-100 transition-opacity" />

          <div className="w-11 h-11 rounded-xl bg-amber/10 flex items-center justify-center text-amber mb-4">
            <MessageCircle size={20} strokeWidth={1.8} />
          </div>
          <h4 className="text-[16px] font-semibold text-text-primary mb-1">Feedback</h4>
          <p className="text-[14.5px] text-text-secondary leading-relaxed">
            Use the feedback widget in the bottom-right corner to report bugs or
            suggest features. We read every message.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
