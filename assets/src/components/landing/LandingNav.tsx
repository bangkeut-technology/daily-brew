import { Link } from '@tanstack/react-router';
import { useState, useEffect, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoBrand } from '@/components/shared/Logo';

const navLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Support', href: '/support' },
  { label: 'FAQ', href: '/faq' },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const onScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FAF7F2]/75 backdrop-blur-2xl shadow-[0_1px_8px_rgba(107,66,38,0.06)]'
          : 'bg-transparent backdrop-blur-none'
      }`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Bottom glow line on scroll */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-px transition-opacity duration-500 ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(193,127,59,0.25), rgba(232,168,90,0.2), rgba(193,127,59,0.25), transparent)',
        }}
      />

      <div className="flex items-center justify-between px-6 md:px-8 py-4 max-w-6xl mx-auto">
        <Link to="/" className="no-underline">
          <LogoBrand size={30} />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-[13px] font-medium text-text-secondary hover:text-coffee no-underline transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
          <div className="w-px h-4 bg-cream-3" />
          <Link
            to="/sign-in"
            className="text-[13px] font-medium text-text-secondary hover:text-text-primary no-underline transition-colors duration-200"
          >
            Sign in
          </Link>
          <Link
            to="/sign-up"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)] no-underline"
          >
            Get started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-text-secondary"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden bg-[#FAF7F2]/90 backdrop-blur-2xl border-b border-cream-3/60 px-6 pb-4 space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-[14px] font-medium text-text-secondary hover:text-coffee no-underline py-1 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-cream-3 my-2" />
            <Link
              to="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="block text-[14px] font-medium text-text-secondary no-underline py-1"
            >
              Sign in
            </Link>
            <Link
              to="/sign-up"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white no-underline"
            >
              Get started
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
