import { motion } from 'framer-motion';
import type { Playbook } from './playbooks';

type Props = {
  playbook: Playbook;
};

export function PlaybookSection({ playbook }: Props) {
  const Icon = playbook.icon;
  return (
    <section
      aria-labelledby={`playbook-${playbook.key}`}
      className="relative bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 md:p-8 overflow-hidden shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{ background: playbook.accent }}
      />

      <header className="flex items-center gap-4 mb-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${playbook.accent}14`, color: playbook.accent }}
        >
          <Icon size={22} />
        </div>
        <div>
          <h2
            id={`playbook-${playbook.key}`}
            className="text-[22px] md:text-[26px] font-semibold text-text-primary font-serif leading-tight"
          >
            {playbook.title}
          </h2>
          <p className="text-[14px] text-text-secondary mt-1">
            {playbook.subtitle}
          </p>
        </div>
      </header>

      <ol className="space-y-4">
        {playbook.steps.map((step, stepIndex) => (
          <motion.li
            key={step.title}
            className="flex items-start gap-4"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: stepIndex * 0.04 }}
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0 tabular-nums"
              style={{ background: playbook.accent }}
              aria-hidden="true"
            >
              {stepIndex + 1}
            </span>
            <div className="flex-1 pt-0.5">
              <p className="text-[15px] font-semibold text-text-primary">
                {step.title}
              </p>
              <p className="text-[14px] text-text-secondary leading-relaxed mt-1">
                {step.desc}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
