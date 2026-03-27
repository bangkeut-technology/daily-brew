import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = true }: GlassCardProps) {
  return (
    <div
      className={`
        bg-white/60 backdrop-blur-md
        border border-white/85
        rounded-2xl
        shadow-[0_2px_12px_rgba(107,66,38,0.05)]
        overflow-hidden
        transition-all duration-200
        ${hover ? 'hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(107,66,38,0.10)]' : ''}
        ${className}
      `}
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
    <div className="px-5 py-4 border-b border-[#EBE2D6]/80 flex items-center justify-between">
      <span className="text-sm font-semibold text-[#2C2420]">{title}</span>
      {action}
    </div>
  );
}
