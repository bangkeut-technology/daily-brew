import { Link } from '@tanstack/react-router';
import { ChevronRight, QrCode, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const floatingCardVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.6 + i * 0.15, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 px-6 md:px-8 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-amber/[0.07] blur-[100px]"
          animate={{ y: [0, 30, 0], x: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-coffee/[0.05] blur-[100px]"
          animate={{ y: [0, -20, 0], x: [0, -15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/4 right-1/3 w-[300px] h-[300px] rounded-full bg-amber-light/[0.04] blur-[80px]"
          animate={{ y: [0, 18, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div>
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber/8 border border-amber/15 mb-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
              <span className="text-[13px] font-medium text-amber tracking-wide">
                Free for up to 10 employees
              </span>
            </motion.div>

            <motion.h1
              className="text-[40px] md:text-[54px] font-semibold text-text-primary leading-[1.08] mb-6 font-serif"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Staff attendance,
              <br />
              <span className="text-coffee">brewed simply.</span>
            </motion.h1>

            <motion.p
              className="text-[18px] md:text-[19px] text-text-secondary mb-8 max-w-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              QR check-ins, shift tracking, and leave management for your
              restaurant. No app installs, no complexity — just scan and go.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-start gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                to="/sign-up"
                className="btn-shimmer inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[17px] font-semibold text-white border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(107,66,38,0.30)] no-underline"
              >
                Get started free
                <ChevronRight size={16} />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-[16px] font-medium text-text-primary bg-glass-bg backdrop-blur-sm border border-glass-border hover:bg-cream-3 transition-all duration-200 no-underline cursor-pointer"
              >
                View pricing
              </Link>
            </motion.div>

            <motion.p
              className="text-[14px] text-text-tertiary mt-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              No credit card required
            </motion.p>
          </div>

          {/* Right — floating dashboard preview */}
          <div className="relative hidden lg:block">
            {/* Main dashboard card */}
            <motion.div
              className="relative bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-6 shadow-[0_8px_40px_rgba(107,66,38,0.08)]"
              custom={0}
              variants={floatingCardVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Dashboard header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[12px] uppercase tracking-[1px] font-medium text-text-tertiary mb-0.5">
                    Today's overview
                  </p>
                  <p className="text-[17px] font-semibold text-text-primary font-serif">
                    Dashboard
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
                  <span className="text-[12px] text-green font-medium">Live</span>
                </div>
              </div>

              {/* Mini stat row */}
              <div className="grid grid-cols-4 gap-2.5 mb-5">
                {[
                  { label: 'Present', value: '7', color: '#4A7C59' },
                  { label: 'Late', value: '1', color: '#C17F3B' },
                  { label: 'Leave', value: '1', color: '#3B6FA0' },
                  { label: 'Absent', value: '0', color: '#C0392B' },
                ].map((s) => (
                  <div key={s.label} className="bg-cream/60 rounded-xl p-2.5 text-center">
                    <p
                      className="text-[20px] font-semibold leading-none mb-0.5"
                      style={{ color: s.color }}
                    >
                      {s.value}
                    </p>
                    <p className="text-[11px] text-text-tertiary uppercase tracking-wider">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Attendance rows */}
              <div className="space-y-0">
                {[
                  { name: 'Sophea Keo', initials: 'SK', shift: 'Morning', time: '07:58', status: 'On time', statusColor: '#4A7C59', grad: 0 },
                  { name: 'Dara Pich', initials: 'DP', shift: 'Morning', time: '08:12', status: 'Late', statusColor: '#C17F3B', grad: 1 },
                  { name: 'Vanna Sok', initials: 'VS', shift: 'Evening', time: '—', status: 'On leave', statusColor: '#3B6FA0', grad: 2 },
                ].map((r, i) => (
                  <div
                    key={r.name}
                    className={cn('flex items-center gap-2.5 px-3 py-2.5 rounded-lg', i === 0 && 'bg-cream/40')}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold text-white shrink-0"
                      style={{
                        background: [
                          'linear-gradient(135deg, #C17F3B, #6B4226)',
                          'linear-gradient(135deg, #3B6FA0, #1a3a5c)',
                          'linear-gradient(135deg, #4A7C59, #2a4a35)',
                        ][r.grad],
                      }}
                    >
                      {r.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-medium text-text-primary truncate">
                        {r.name}
                      </p>
                      <p className="text-[11.5px] text-text-tertiary">{r.shift}</p>
                    </div>
                    <span className="text-[12.5px] text-text-secondary font-mono tabular-nums mr-2">
                      {r.time}
                    </span>
                    <span
                      className="text-[11px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{
                        background: `${r.statusColor}15`,
                        color: r.statusColor,
                      }}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Floating QR card */}
            <motion.div
              className="absolute -bottom-6 -left-8 bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-4 shadow-[0_8px_30px_rgba(107,66,38,0.10)] w-[160px]"
              custom={2}
              variants={floatingCardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-coffee/10 flex items-center justify-center">
                  <QrCode size={13} className="text-coffee" />
                </div>
                <p className="text-[12px] font-medium text-text-primary">QR Check-in</p>
              </div>
              {/* Mini QR code */}
              <div className="w-full aspect-square rounded-xl bg-cream-3/40 flex items-center justify-center p-3">
                <svg viewBox="0 0 21 21" className="w-full h-full" shapeRendering="crispEdges">
                  {/* Top-left finder */}
                  <rect x="0" y="0" width="7" height="7" fill="currentColor" className="text-coffee" />
                  <rect x="1" y="1" width="5" height="5" fill="currentColor" className="text-cream-3/60" />
                  <rect x="2" y="2" width="3" height="3" fill="currentColor" className="text-coffee" />
                  {/* Top-right finder */}
                  <rect x="14" y="0" width="7" height="7" fill="currentColor" className="text-coffee" />
                  <rect x="15" y="1" width="5" height="5" fill="currentColor" className="text-cream-3/60" />
                  <rect x="16" y="2" width="3" height="3" fill="currentColor" className="text-coffee" />
                  {/* Bottom-left finder */}
                  <rect x="0" y="14" width="7" height="7" fill="currentColor" className="text-coffee" />
                  <rect x="1" y="15" width="5" height="5" fill="currentColor" className="text-cream-3/60" />
                  <rect x="2" y="16" width="3" height="3" fill="currentColor" className="text-coffee" />
                  {/* Data modules */}
                  {[
                    [8,0],[10,0],[8,2],[9,2],[10,3],[8,4],[10,4],
                    [0,8],[2,8],[4,8],[6,8],[8,8],[10,8],[12,8],[14,8],[16,8],[18,8],[20,8],
                    [8,10],[9,9],[11,9],[13,10],[15,10],[17,9],[19,10],
                    [9,11],[11,11],[14,12],[16,12],[18,11],[20,12],
                    [8,13],[10,13],[12,14],[14,14],[16,14],[19,13],
                    [9,15],[11,16],[13,15],[15,16],[17,15],[19,16],
                    [8,17],[10,18],[12,17],[14,18],[16,17],[18,18],[20,17],
                    [8,20],[10,19],[12,20],[15,19],[17,20],[19,19],[20,20],
                  ].map(([x, y], i) => (
                    <rect key={i} x={x} y={y} width="1" height="1" fill="currentColor" className="text-coffee" />
                  ))}
                </svg>
              </div>
            </motion.div>

            {/* Floating notification */}
            <motion.div
              className="absolute -top-4 -right-4 bg-glass-bg backdrop-blur-xl border border-glass-border rounded-xl px-4 py-3 shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
              custom={3}
              variants={floatingCardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -3 }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-green/10 flex items-center justify-center">
                  <CheckCircle size={14} className="text-green" />
                </div>
                <div>
                  <p className="text-[12.5px] font-medium text-text-primary">
                    Check-in recorded
                  </p>
                  <p className="text-[11px] text-text-tertiary">Just now</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
