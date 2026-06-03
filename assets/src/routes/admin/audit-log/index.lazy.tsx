import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useAdminAuditLog } from '@/hooks/queries/useAdmin';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { CustomSelect } from '@/components/shared/CustomSelect';
import { Pagination } from '@/components/shared/Pagination';
import { cn } from '@/lib/utils';

export const Route = createLazyFileRoute('/admin/audit-log/')({
  component: AdminAuditLogPage,
});

const ACTION_OPTIONS = [
  { value: '', label: 'All actions' },
  { value: 'promote_user', label: 'Promote user' },
  { value: 'demote_user', label: 'Demote user' },
  { value: 'cancel_subscription', label: 'Cancel subscription' },
  { value: 'restore_workspace', label: 'Restore workspace' },
];

const TARGET_TYPE_OPTIONS = [
  { value: '', label: 'All targets' },
  { value: 'user', label: 'User' },
  { value: 'workspace', label: 'Workspace' },
  { value: 'subscription', label: 'Subscription' },
];

function AdminAuditLogPage() {
  const [action, setAction] = useState('');
  const [targetType, setTargetType] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminAuditLog({ page, action, targetType });

  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? 50;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <PageHeader title="Audit log" />
      <p className="text-[14px] text-text-secondary mb-4 -mt-2">
        Append-only history of every admin action. Used for accountability and incident investigation.
      </p>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-48">
          <CustomSelect value={action} onChange={(v) => { setAction(v); setPage(1); }} options={ACTION_OPTIONS} />
        </div>
        <div className="w-44">
          <CustomSelect value={targetType} onChange={(v) => { setTargetType(v); setPage(1); }} options={TARGET_TYPE_OPTIONS} />
        </div>
        <span className="text-[13px] text-text-tertiary tabular-nums ml-auto">{total.toLocaleString()} events</span>
      </div>

      <GlassCard hover={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead className="bg-cream-3/40 text-text-tertiary text-[12px] uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">When</th>
                <th className="text-left px-4 py-2.5 font-medium">Actor</th>
                <th className="text-left px-4 py-2.5 font-medium">Action</th>
                <th className="text-left px-4 py-2.5 font-medium">Target</th>
                <th className="text-left px-4 py-2.5 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={5} className="px-4 py-6 text-center text-text-tertiary">Loading…</td></tr>}
              {!isLoading && data?.items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-text-tertiary">No audit events yet</td></tr>
              )}
              {data?.items.map((row) => (
                <tr key={row.publicId} className="border-t border-cream-3/60 hover:bg-cream-3/20 transition-colors">
                  <td className="px-4 py-2.5 text-text-tertiary text-[12.5px] tabular-nums whitespace-nowrap">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-text-secondary">
                    {row.actor ? (
                      <Link to="/admin/users/$publicId" params={{ publicId: row.actor.publicId }} className="text-text-primary hover:text-coffee no-underline">
                        {row.actor.email}
                      </Link>
                    ) : (
                      <span className="text-text-tertiary italic">{row.actorEmail ?? 'deleted user'}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <ActionBadge action={row.action} label={row.actionLabel} />
                  </td>
                  <td className="px-4 py-2.5 text-text-secondary">
                    <TargetLink type={row.targetType} publicId={row.targetPublicId} label={row.targetLabel} />
                  </td>
                  <td className="px-4 py-2.5 text-text-tertiary text-[12.5px] font-mono">
                    {row.metadata && Object.keys(row.metadata).length > 0
                      ? Object.entries(row.metadata).map(([k, v]) => `${k}=${String(v)}`).join(' · ')
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

function ActionBadge({ action, label }: { action: string; label: string }) {
  const tone = action.startsWith('promote')
    ? 'bg-coffee/15 text-coffee'
    : action.startsWith('demote') || action.startsWith('cancel')
      ? 'bg-red/10 text-red'
      : action.startsWith('restore')
        ? 'bg-green/15 text-green'
        : 'bg-cream-3 text-text-secondary';
  return (
    <span className={cn('text-[11.5px] px-2 py-0.5 rounded-full font-medium', tone)}>{label}</span>
  );
}

function TargetLink({ type, publicId, label }: { type: string; publicId: string | null; label: string | null }) {
  if (!publicId) return <span className="text-text-tertiary">—</span>;
  if (type === 'user') {
    return (
      <Link to="/admin/users/$publicId" params={{ publicId }} className="text-text-primary hover:text-coffee no-underline">
        {label ?? publicId}
      </Link>
    );
  }
  if (type === 'workspace') {
    return (
      <Link to="/admin/workspaces/$publicId" params={{ publicId }} className="text-text-primary hover:text-coffee no-underline">
        {label ?? publicId}
      </Link>
    );
  }
  return <span>{label ?? publicId}</span>;
}
