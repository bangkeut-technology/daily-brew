import type { ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PageHeaderProps {
  title: string;
  badge?: ReactNode;
  action?: ReactNode;
  /**
   * Optional contextual-help link rendered as a small (?) button next to the
   * title. Opens in a new tab so the user keeps their console state.
   */
  help?: {
    /** Absolute path like "/guides/owner" or "/guides/owner#step-owner-3" */
    href: string;
    /** Tooltip text and aria-label, e.g. "How shifts work" */
    label: string;
  };
}

/**
 * Append the active i18n locale as a `?lang=…` query param to a help URL so
 * the new tab keeps the user's language even if the cookie isn't set yet on
 * the destination route. Preserves any existing hash. EN is the implicit
 * default and is left off to keep canonical URLs clean.
 */
function withLocale(href: string, locale: string): string {
  if (!locale || locale === 'en') return href;
  const hashIndex = href.indexOf('#');
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : '';
  const path = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}lang=${locale}${hash}`;
}

export function PageHeader({ title, badge, action, help }: PageHeaderProps) {
  const { i18n } = useTranslation();
  const base = (i18n.language ?? 'en').split('-')[0];
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <h1
          className="text-[26px] font-semibold text-text-primary"
          style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif" }}
        >
          {title}
        </h1>
        {badge}
        {help && (
          <a
            href={withLocale(help.href, base)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={help.label}
            title={help.label}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-cream-3 hover:text-coffee"
          >
            <HelpCircle size={16} />
          </a>
        )}
      </div>
      {action}
    </div>
  );
}
