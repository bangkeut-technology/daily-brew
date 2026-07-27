import { cn } from '@/lib/utils';

/**
 * Keyed by `SubscriptionStatusEnum->value` as serialised by the admin API —
 * snake_case, not the PHP case name.
 */
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green/15 text-green' },
  trialing: { label: 'Trialing', color: 'bg-[#3B6FA0]/15 text-blue' },
  past_due: { label: 'Past due', color: 'bg-red/12 text-red' },
  paused: { label: 'Paused', color: 'bg-amber/15 text-amber' },
  canceled: { label: 'Canceled', color: 'bg-cream-3 text-text-tertiary' },
};

export function SubscriptionStatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return <span className="text-text-tertiary">—</span>;
  const m = STATUS_MAP[status] ?? { label: status, color: 'bg-cream-3 text-text-secondary' };
  return (
    <span className={cn('text-[11.5px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap', m.color)}>
      {m.label}
    </span>
  );
}
