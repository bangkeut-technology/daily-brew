import { Link } from '@tanstack/react-router';
import { Coffee } from 'lucide-react';
import { motion } from 'framer-motion';

const productLinks = [
  { label: 'Features', to: '/features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Support', to: '/support' },
];

const legalLinks = [
  { label: 'Privacy policy', to: '/privacy' },
  { label: 'Terms of use', to: '/terms' },
];

export function LandingFooter() {
  return (
    <footer className="relative bg-cream-2/50 backdrop-blur-sm border-t border-cream-3/50 mt-10">
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <motion.div
            className="col-span-2 md:col-span-1"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h4 className="text-[20px] font-semibold text-coffee font-serif mb-2">
              DailyBrew
            </h4>
            <p className="text-[14px] text-text-secondary leading-relaxed max-w-[220px]">
              Staff attendance and leave tracking for restaurants. Simple, warm,
              and built for teams that move fast.
            </p>
          </motion.div>

          {/* Product */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <p className="text-[13px] uppercase tracking-[1.5px] font-medium text-text-tertiary mb-4">
              Product
            </p>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[15px] text-text-secondary hover:text-coffee no-underline transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <p className="text-[13px] uppercase tracking-[1.5px] font-medium text-text-tertiary mb-4">
              Legal
            </p>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[15px] text-text-secondary hover:text-coffee no-underline transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Get started */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <p className="text-[13px] uppercase tracking-[1.5px] font-medium text-text-tertiary mb-4">
              Get started
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/sign-up"
                  className="text-[15px] text-text-secondary hover:text-coffee no-underline transition-colors duration-200"
                >
                  Create account
                </Link>
              </li>
              <li>
                <Link
                  to="/sign-in"
                  className="text-[15px] text-text-secondary hover:text-coffee no-underline transition-colors duration-200"
                >
                  Sign in
                </Link>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          className="mt-12 pt-6 border-t border-cream-3/50 flex flex-col sm:flex-row items-center justify-between gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <p className="text-[13px] text-text-tertiary">
            DailyBrew &copy; {new Date().getFullYear()}. All rights reserved.
          </p>
          <p className="text-[13px] text-text-tertiary">
            <span className="inline-flex items-center gap-1">Made with <Coffee size={12} className="text-coffee" /> for restaurants everywhere</span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
