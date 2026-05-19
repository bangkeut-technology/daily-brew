import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useAdminSubscriptions } from '@/hooks/queries/useAdmin';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { CustomSelect } from '@/components/shared/CustomSelect';
import { PlanBadge } from '@/components/shared/PlanBadge';
import { Pagination } from '@/routes/admin/workspaces/index';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/admin/subscriptions/')({
  component: AdminSubscriptionsPage,
});

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Trialing', label: 'Trialing' },
  { value: 'PastDue', label: 'Past due' },
  { value: 'Canceled', label: 'Canceled' },
];
const PLAN_OPTIONS = [
  { value: '', label: 'All plans' },
  { value: 'free', label: 'Free' },
  { value: 'espresso', label: 'Espresso' },
  { value: 'double_espresso', label: 'Double Espresso' },
];

function AdminSubscriptionsPage() {
  const [status, setStatus] = useState('');
  const [plan, setPlan] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminSubscriptions({ page, status, plan });

  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? 25;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <PageHeader title="Subscriptions" />

      <div className="flex items-center gap-3 mb-4">
        <div className="w-44">
          <CustomSelect
            value={status}
            onChange={(v) => { setStatus(v); setPage(1); }}
            options={STATUS_OPTIONS}
          />
        </div>
        <div className="w-48">
          <CustomSelect
            value={plan}
            onChange={(v) => { setPlan(v); setPage(1); }}
            options={PLAN_OPTIONS}
          />
        </div>
        <span className="text-[13px] text-text-tertiary tabular-nums ml-auto">{total.toLocaleString()} total</span>
      </div>

      <GlassCard hover={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead className="bg-cream-3/40 text-text-tertiary text-[12px] uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">Workspace</th>
                <th className="text-left px-4 py-2.5 font-medium">Owner</th>
                <th className="text-left px-4 py-2.5 font-medium">Plan</th>
                <th className="text-left px-4 py-2.5 font-medium">Status</th>
                <th className="text-left px-4 py-2.5 font-medium">Period end</th>
                <th className="text-left px-4 py-2.5 font-medium">Paddle ID</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={6} className="px-4 py-6 text-center text-text-tertiary">Loading…</td></tr>}
              {!isLoading && data?.items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-text-tertiary">No subscriptions found</td></tr>
              )}
              {data?.items.map((s) => (
                <tr key={s.publicId} className={cn('border-t border-cream-3/60 hover:bg-cream-3/20 transition-colors', !s.isActive && 'opacity-70')}>
                  <td className="px-4 py-2.5">
                    <Link to="/admin/workspaces/$publicId" params={{ publicId: s.workspace.publicId }} className="text-text-primary font-medium hover:text-coffee no-underline">
                      {s.workspace.name || '(unnamed)'}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-text-secondary">{s.owner?.email ?? '—'}</td>
                  <td className="px-4 py-2.5"><PlanBadge plan={s.plan} /></td>
                  <td className="px-4 py-2.5 text-text-secondary text-[12.5px]">
                    {s.status}
                    {s.isTrialing && s.trialDaysRemaining != null && (
                      <span className="ml-1.5 text-amber">({s.trialDaysRemaining}d trial)</span>
                    )}
                    {s.canceledAt && <span className="ml-1.5 text-red">canceled</span>}
                  </td>
                  <td className="px-4 py-2.5 text-text-tertiary text-[12.5px] tabular-nums">
                    {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-text-tertiary text-[11.5px] font-mono">
                    {s.paddleSubscriptionId
                      ? <span title={s.paddleSubscriptionId}>{s.paddleSubscriptionId.slice(0, 16)}…</span>
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
