import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { useAdminSubscriptions } from '@/hooks/queries/useAdmin';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { CustomSelect } from '@/components/shared/CustomSelect';
import { PlanBadge } from '@/components/shared/PlanBadge';
import { SubscriptionStatusBadge } from '@/components/shared/SubscriptionStatusBadge';
import { Pagination } from '@/components/shared/Pagination';
import {
  AdminEmpty,
  CardSkeletonList,
  MobileCard,
  MobileField,
  STICKY_HEAD,
  TableEmptyRow,
  TableSkeletonRows,
} from '@/components/admin/AdminDataStates';
import { cn } from '@/lib/utils';

export const Route = createLazyFileRoute('/admin/subscriptions/')({
  component: AdminSubscriptionsPage,
});

// Values must be the serialised `SubscriptionStatusEnum` values — the API
// compares them straight against the stored column, so a case name like
// "PastDue" silently matches nothing.
const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'trialing', label: 'Trialing' },
  { value: 'past_due', label: 'Past due' },
  { value: 'paused', label: 'Paused' },
  { value: 'canceled', label: 'Canceled' },
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
  const subscriptions = data?.items ?? [];
  const isEmpty = !isLoading && subscriptions.length === 0;

  const emptyProps = {
    icon: CreditCard,
    title: status || plan ? 'No subscriptions match these filters' : 'No subscriptions yet',
    hint: status || plan ? 'Clear a filter to widen the search.' : undefined,
  };

  return (
    <div>
      <PageHeader title="Subscriptions" />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="w-44">
          <CustomSelect
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            options={STATUS_OPTIONS}
          />
        </div>
        <div className="w-48">
          <CustomSelect
            value={plan}
            onChange={(v) => {
              setPlan(v);
              setPage(1);
            }}
            options={PLAN_OPTIONS}
          />
        </div>
        <span className="text-[13px] text-text-tertiary tabular-nums ml-auto">
          {total.toLocaleString()} total
        </span>
      </div>

      <div className="md:hidden">
        {isLoading && <CardSkeletonList />}
        {isEmpty && (
          <GlassCard hover={false}>
            <AdminEmpty {...emptyProps} />
          </GlassCard>
        )}
        {!isLoading && subscriptions.length > 0 && (
          <div className="space-y-2">
            {subscriptions.map((s) => (
              <MobileCard key={s.publicId} className={cn(!s.isActive && 'opacity-70')}>
                <Link
                  to="/admin/workspaces/$publicId"
                  params={{ publicId: s.workspace.publicId }}
                  className="text-[14.5px] font-medium text-text-primary hover:text-coffee no-underline block truncate"
                >
                  {s.workspace.name || '(unnamed)'}
                </Link>
                <p className="text-[12.5px] text-text-tertiary truncate">{s.owner?.email ?? '—'}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <PlanBadge plan={s.plan} />
                  <SubscriptionStatusBadge status={s.status} />
                  {s.isTrialing && s.trialDaysRemaining != null && (
                    <span className="text-[11.5px] text-amber">{s.trialDaysRemaining}d left</span>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  <MobileField label="Period end">
                    {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : '—'}
                  </MobileField>
                  <MobileField label="Paddle ID">
                    <span className="font-mono text-[11.5px]">
                      {s.paddleSubscriptionId ?? '—'}
                    </span>
                  </MobileField>
                </div>
              </MobileCard>
            ))}
          </div>
        )}
      </div>

      <GlassCard hover={false} className="hidden md:block">
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full text-[13.5px]">
            <thead className={STICKY_HEAD}>
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
              {isLoading && <TableSkeletonRows cols={6} />}
              {isEmpty && <TableEmptyRow colSpan={6} {...emptyProps} />}
              {!isLoading &&
                subscriptions.map((s) => (
                  <tr
                    key={s.publicId}
                    className={cn(
                      'border-t border-cream-3/60 hover:bg-cream-3/20 transition-colors',
                      !s.isActive && 'opacity-70',
                    )}
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        to="/admin/workspaces/$publicId"
                        params={{ publicId: s.workspace.publicId }}
                        className="text-text-primary font-medium hover:text-coffee no-underline"
                      >
                        {s.workspace.name || '(unnamed)'}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-text-secondary">{s.owner?.email ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <PlanBadge plan={s.plan} />
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <SubscriptionStatusBadge status={s.status} />
                        {s.isTrialing && s.trialDaysRemaining != null && (
                          <span className="text-[11.5px] text-amber">
                            {s.trialDaysRemaining}d left
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-text-tertiary text-[12.5px] tabular-nums">
                      {s.currentPeriodEnd
                        ? new Date(s.currentPeriodEnd).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-text-tertiary text-[11.5px] font-mono">
                      {s.paddleSubscriptionId ? (
                        <span title={s.paddleSubscriptionId}>
                          {s.paddleSubscriptionId.slice(0, 16)}…
                        </span>
                      ) : (
                        '—'
                      )}
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
