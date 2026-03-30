import { cn } from '@/lib/utils';

type BadgeVariant = 'green' | 'amber' | 'red' | 'blue' | 'gray';

const badgeStyles: Record<BadgeVariant, string> = {
  green: 'bg-green/10 text-green',
  amber: 'bg-amber/10 text-amber',
  red: 'bg-red/10 text-red',
  blue: 'bg-[#3B6FA0]/10 text-blue',
  gray: 'bg-[#AE9D95]/15 text-text-secondary',
};

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
}

export function StatusBadge({ label, variant }: StatusBadgeProps) {
  return (
    <span
      className={cn('text-[10.5px] font-medium px-2 py-0.5 rounded-full', badgeStyles[variant])}
    >
      {label}
    </span>
  );
}
