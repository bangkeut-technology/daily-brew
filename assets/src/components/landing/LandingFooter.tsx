import { Link } from '@tanstack/react-router';
import { Coffee, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthenticationState } from '@/hooks/use-authentication';
import { AppStoreBadge } from '@/components/shared/AppStoreBadge';
import { PlayStoreBadge } from '@/components/shared/PlayStoreBadge';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

/**
 * Footer link tables. Labels live in i18n (`marketing.footer.productLinks.*`
 * and `marketing.footer.legalLinks.*`); the `to` and `key` are static.
 */
// Product = the conversion-path surfaces (sell the thing). Resources = learn-and-
// discover (explain it, support it). Split out of one 10-item column because
// that column was scanning long enough to be hostile on a 1280px viewport.
const productLinks: { key: string; to: string }[] = [
  { key: 'features',          to: '/features' },
  { key: 'howItWorks',        to: '/how-it-works' },
  { key: 'pricing',           to: '/pricing' },
  { key: 'stopBuddyPunching', to: '/stop-buddy-punching' },
];

const resourcesLinks: { key: string; to: string }[] = [
  { key: 'guides',  to: '/guides' },
  { key: 'blog',    to: '/blog' },
  { key: 'faq',     to: '/faq' },
  { key: 'roles',   to: '/roles' },
  { key: 'demo',    to: '/demo' },
  { key: 'support', to: '/support' },
];

const legalLinks: { key: string; to: string }[] = [
  { key: 'privacy',       to: '/privacy' },
  { key: 'terms',         to: '/terms' },
  { key: 'refund',        to: '/refund' },
  { key: 'deleteAccount', to: '/delete-account' },
];

export function LandingFooter() {
  const { t } = useTranslation();
  const auth = useAuthenticationState();
  const isAuthenticated = auth.status === 'authenticated';

  return (
    <footer className="relative bg-cream-2/50 backdrop-blur-sm border-t border-cream-3/50 mt-10">
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
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
              {t('marketing.footer.brandTagline')}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <AppStoreBadge className="inline-block opacity-80 hover:opacity-100 transition-opacity" />
              <PlayStoreBadge className="inline-block opacity-80 hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>

          {/* Product */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <p className="text-[13px] uppercase tracking-[1.5px] font-medium text-text-tertiary mb-4">
              {t('marketing.footer.productHeader')}
            </p>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[15px] text-text-secondary hover:text-coffee no-underline transition-colors duration-200"
                  >
                    {t(`marketing.footer.productLinks.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <p className="text-[13px] uppercase tracking-[1.5px] font-medium text-text-tertiary mb-4">
              {t('marketing.footer.resourcesHeader')}
            </p>
            <ul className="space-y-2.5">
              {resourcesLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[15px] text-text-secondary hover:text-coffee no-underline transition-colors duration-200"
                  >
                    {t(`marketing.footer.resourcesLinks.${link.key}`)}
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
              {t('marketing.footer.legalHeader')}
            </p>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[15px] text-text-secondary hover:text-coffee no-underline transition-colors duration-200"
                  >
                    {t(`marketing.footer.legalLinks.${link.key}`)}
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
              {isAuthenticated ? t('marketing.footer.dashboardHeader') : t('marketing.footer.getStartedHeader')}
            </p>
            <ul className="space-y-2.5">
              {isAuthenticated ? (
                <li>
                  <Link
                    to="/console/dashboard"
                    className="inline-flex items-center gap-1.5 text-[15px] text-text-secondary hover:text-coffee no-underline transition-colors duration-200"
                  >
                    <LayoutDashboard size={13} />
                    {t('marketing.footer.cta.console')}
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link
                      to="/sign-up"
                      className="text-[15px] text-text-secondary hover:text-coffee no-underline transition-colors duration-200"
                    >
                      {t('marketing.footer.cta.createAccount')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/sign-in"
                      className="text-[15px] text-text-secondary hover:text-coffee no-underline transition-colors duration-200"
                    >
                      {t('marketing.footer.cta.signIn')}
                    </Link>
                  </li>
                </>
              )}
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
            {t('marketing.footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-[13px] text-text-tertiary">
              <span className="inline-flex items-center gap-1">
                {t('marketing.footer.madeWithPrefix')}
                <Coffee size={12} className="text-coffee" />
                {t('marketing.footer.madeWithSuffix')}
              </span>
            </p>
            <LanguageSwitcher />
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
