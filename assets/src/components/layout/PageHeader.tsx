import type { ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';

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

export function PageHeader({ title, badge, action, help }: PageHeaderProps) {
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
            href={help.href}
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
