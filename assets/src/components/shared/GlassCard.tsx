import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        'bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl shadow-[0_2px_12px_rgba(107,66,38,0.05)] overflow-hidden transition-all duration-200',
        hover && 'hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(107,66,38,0.10)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface GlassCardHeaderProps {
  title: string;
  action?: ReactNode;
}

export function GlassCardHeader({ title, action }: GlassCardHeaderProps) {
  return (
    <div className="px-5 py-4 border-b border-cream-3/80 flex items-center justify-between">
      <span className="text-sm font-semibold text-text-primary">{title}</span>
      {action}
    </div>
  );
}
