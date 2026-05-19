import { cn } from '@/lib/utils';

const PLAN_MAP: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: 'bg-cream-3 text-text-secondary' },
  espresso: { label: 'Espresso', color: 'bg-amber/15 text-amber' },
  double_espresso: { label: 'Double Espresso', color: 'bg-coffee/15 text-coffee' },
};

export function PlanBadge({ plan }: { plan: string }) {
  const m = PLAN_MAP[plan] ?? { label: plan, color: 'bg-cream-3 text-text-secondary' };
  return <span className={cn('text-[11.5px] px-2 py-0.5 rounded-full font-medium', m.color)}>{m.label}</span>;
}
