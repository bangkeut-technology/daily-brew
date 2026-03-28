import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: number;
  subtitle: string;
  accent: string;
  icon: ReactNode;
}

export function StatCard({ label, value, subtitle, accent, icon }: StatCardProps) {
  return (
    <div className="relative bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-5 shadow-sm cursor-default overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-60"
        style={{ backgroundColor: accent }}
      />
      <p className="text-[10.5px] uppercase tracking-[0.8px] font-medium text-text-secondary mb-2.5">
        {label}
      </p>
      <p className="text-[32px] font-semibold text-text-primary leading-none tracking-[-1px] mb-1.5">
        {value}
      </p>
      <p className="text-xs text-text-tertiary">{subtitle}</p>
      <span className="absolute top-4 right-4 opacity-[0.18] select-none">{icon}</span>
    </div>
  );
}
