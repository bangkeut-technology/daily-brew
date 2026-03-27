type BadgeVariant = 'green' | 'amber' | 'red' | 'blue' | 'gray';

const badgeStyles: Record<BadgeVariant, string> = {
  green: 'bg-[#4A7C59]/10 text-[#4A7C59]',
  amber: 'bg-[#C17F3B]/10 text-[#C17F3B]',
  red: 'bg-[#C0392B]/10 text-[#C0392B]',
  blue: 'bg-[#3B6FA0]/10 text-[#3B6FA0]',
  gray: 'bg-[#AE9D95]/15 text-[#7C6860]',
};

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
}

export function StatusBadge({ label, variant }: StatusBadgeProps) {
  return (
    <span
      className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full ${badgeStyles[variant]}`}
    >
      {label}
    </span>
  );
}
