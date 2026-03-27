import { Link } from '@tanstack/react-router';
import { ChevronRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';

const floatingCardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.5 + i * 0.15, ease: 'easeOut' as const },
  }),
};

export function HeroSection() {
  return (
    <section className="relative pt-28 pb-16 px-6 md:px-8 text-center max-w-4xl mx-auto overflow-hidden">
      {/* Parallax-esque background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#C17F3B]/[0.06] blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-[#6B4226]/[0.05] blur-3xl"
          animate={{ y: [0, -15, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-[#E8A85A]/[0.05] blur-3xl"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Floating coffee icon */}
      <motion.div
        className="relative z-10 flex justify-center mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <motion.div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(107,66,38,0.20)]"
          style={{ background: 'linear-gradient(135deg, #E8A85A, #6B4226)' }}
          animate={{
            y: [0, -8, 0],
            boxShadow: [
              '0 4px 20px rgba(107,66,38,0.20)',
              '0 12px 32px rgba(107,66,38,0.30)',
              '0 4px 20px rgba(107,66,38,0.20)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-3xl">&#9749;</span>
        </motion.div>
      </motion.div>

      <motion.h2
        className="relative z-10 text-[36px] md:text-[48px] font-semibold text-text-primary leading-[1.1] mb-5 font-serif"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        Staff attendance,
        <br />
        brewed simply.
      </motion.h2>

      <motion.p
        className="relative z-10 text-[15px] md:text-[17px] text-text-secondary mb-10 max-w-xl mx-auto leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
      >
        QR check-ins, shift management, and leave requests for your restaurant.
        No complexity, no app installs — just what you need.
      </motion.p>

      {/* CTAs */}
      <motion.div
        className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
      >
        <Link
          to="/sign-up"
          className="btn-shimmer inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[15px] font-semibold text-white border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(107,66,38,0.30)] no-underline"
        >
          Start free
          <ChevronRight size={16} />
        </Link>
        <a
          href="#features"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-medium text-text-secondary bg-white/50 backdrop-blur-sm border border-cream-3 hover:bg-cream-3/50 transition-all duration-200 no-underline cursor-pointer"
        >
          <Play size={14} className="text-amber" />
          See how it works
        </a>
      </motion.div>

      {/* Floating glass cards — mini app preview */}
      <div className="relative z-10 mt-16 flex items-center justify-center gap-4 flex-wrap">
        {/* Stat card */}
        <motion.div
          className="relative bg-white/60 backdrop-blur-md border border-white/85 rounded-2xl p-5 shadow-[0_2px_12px_rgba(107,66,38,0.05)] w-[180px] text-left"
          custom={0}
          variants={floatingCardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(107,66,38,0.12)' }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#4A7C59] opacity-60 rounded-t-2xl" />
          <p className="text-[10px] uppercase tracking-[0.8px] font-medium text-[#7C6860] mb-2">
            Present today
          </p>
          <p className="text-[28px] font-semibold text-[#2C2420] leading-none tracking-[-1px] mb-1">
            7
          </p>
          <p className="text-[11px] text-[#AE9D95]">of 9 employees</p>
          <span className="absolute top-3 right-3 text-lg opacity-[0.15] select-none">
            &#10003;
          </span>
        </motion.div>

        {/* Attendance row card */}
        <motion.div
          className="relative bg-white/60 backdrop-blur-md border border-white/85 rounded-2xl p-4 shadow-[0_2px_12px_rgba(107,66,38,0.05)] w-[240px]"
          custom={1}
          variants={floatingCardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(107,66,38,0.12)' }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#C17F3B] opacity-60 rounded-t-2xl" />
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #C17F3B, #6B4226)' }}
            >
              SK
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-medium text-[#2C2420] truncate">
                Sophea Keo
              </p>
              <p className="text-[10px] text-[#AE9D95]">Morning shift</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#7C6860] font-mono tabular-nums">
                07:58
              </p>
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[#4A7C59]/10 text-[#4A7C59]">
                On time
              </span>
            </div>
          </div>
        </motion.div>

        {/* Late badge card */}
        <motion.div
          className="relative bg-white/60 backdrop-blur-md border border-white/85 rounded-2xl p-4 shadow-[0_2px_12px_rgba(107,66,38,0.05)] w-[180px] hidden md:block"
          custom={2}
          variants={floatingCardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(107,66,38,0.12)' }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#C0392B] opacity-60 rounded-t-2xl" />
          <p className="text-[10px] uppercase tracking-[0.8px] font-medium text-[#7C6860] mb-2">
            Late today
          </p>
          <p className="text-[28px] font-semibold text-[#C0392B] leading-none tracking-[-1px] mb-1">
            1
          </p>
          <p className="text-[11px] text-[#AE9D95]">flagged automatically</p>
        </motion.div>
      </div>

      {/* Social proof + info */}
      <motion.div
        className="relative z-10 mt-12"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        <p className="text-[13px] font-medium text-[#7C6860] mb-1">
          Join 1,200+ restaurants already using DailyBrew
        </p>
        <p className="text-[12px] text-text-tertiary">
          Free for up to 5 employees &middot; No credit card required
        </p>
      </motion.div>
    </section>
  );
}
