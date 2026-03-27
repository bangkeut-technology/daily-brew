import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';

export function LandingFooter() {
  return (
    <footer className="relative bg-cream-2/50 backdrop-blur-sm border-t border-cream-3/50 mt-10">
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h4 className="text-[18px] font-semibold text-coffee font-serif mb-2">
              DailyBrew
            </h4>
            <p className="text-[12px] text-text-secondary leading-relaxed max-w-[240px]">
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
            <p className="text-[11px] uppercase tracking-[1.5px] font-medium text-text-tertiary mb-4">
              Product
            </p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#features"
                  className="text-[13px] text-text-secondary hover:text-coffee no-underline transition-colors duration-200"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-[13px] text-text-secondary hover:text-coffee no-underline transition-colors duration-200"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-[13px] text-text-secondary hover:text-coffee no-underline transition-colors duration-200"
                >
                  Contact
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <p className="text-[11px] uppercase tracking-[1.5px] font-medium text-text-tertiary mb-4">
              Legal
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/privacy"
                  className="text-[13px] text-text-secondary hover:text-coffee no-underline transition-colors duration-200"
                >
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-[13px] text-text-secondary hover:text-coffee no-underline transition-colors duration-200"
                >
                  Terms of use
                </Link>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          className="mt-10 pt-6 border-t border-cream-3/50 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <p className="text-[11px] text-text-tertiary">
            DailyBrew &copy; {new Date().getFullYear()}. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
