import {
  Utensils,
  CoffeeIcon,
  Wine,
  Soup,
  IceCreamCone,
  Store,
} from 'lucide-react';
import { motion } from 'framer-motion';

const venues = [
  { icon: <Utensils size={22} strokeWidth={1.6} />, label: 'Restaurants', accent: '#6B4226' },
  { icon: <CoffeeIcon size={22} strokeWidth={1.6} />, label: 'Cafes', accent: '#C17F3B' },
  { icon: <Wine size={22} strokeWidth={1.6} />, label: 'Bars & pubs', accent: '#7C5C9B' },
  { icon: <Soup size={22} strokeWidth={1.6} />, label: 'Food courts', accent: '#3B6FA0' },
  { icon: <IceCreamCone size={22} strokeWidth={1.6} />, label: 'Bakeries', accent: '#4A7C59' },
  { icon: <Store size={22} strokeWidth={1.6} />, label: 'Small teams', accent: '#9B6B45' },
];

const highlights = [
  { value: '3', label: 'Languages', sub: 'EN, FR, KM' },
  { value: '< 5', label: 'Minutes', sub: 'To set up' },
  { value: '0', label: 'Hardware', sub: 'Required' },
];

export function BuiltForSection() {
  return (
    <section className="py-24 px-6 md:px-8 max-w-5xl mx-auto">
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
          Built for
        </p>
        <h3 className="text-[30px] md:text-[36px] font-semibold text-text-primary font-serif leading-tight">
          Any team that needs attendance tracking
        </h3>
        <p className="text-[16px] text-text-secondary mt-3 max-w-lg mx-auto">
          Whether you run a single cafe or a busy restaurant with 20 staff,
          DailyBrew adapts to your workflow.
        </p>
      </motion.div>

      {/* Venue types */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-16">
        {venues.map((v, i) => (
          <motion.div
            key={v.label}
            className="group flex flex-col items-center gap-3 py-5 px-3 rounded-2xl bg-glass-bg backdrop-blur-md border border-glass-border shadow-[0_2px_12px_rgba(107,66,38,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(107,66,38,0.08)]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
              style={{ background: `${v.accent}12`, color: v.accent }}
            >
              {v.icon}
            </div>
            <span className="text-[14px] font-medium text-text-primary text-center">
              {v.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Stats strip */}
      <motion.div
        className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-8 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
          {highlights.map((h, i) => (
            <motion.div
              key={h.label}
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.1 }}
            >
              <p className="text-[36px] font-bold text-coffee leading-none mb-1">
                {h.value}
              </p>
              <p className="text-[15px] font-semibold text-text-primary mb-0.5">
                {h.label}
              </p>
              <p className="text-[13.5px] text-text-tertiary">{h.sub}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
