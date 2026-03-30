import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  badge?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, badge, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <h1
          className="text-[24px] font-semibold text-text-primary"
          style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif" }}
        >
          {title}
        </h1>
        {badge}
      </div>
      {action}
    </div>
  );
}
