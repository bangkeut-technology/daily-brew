import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ScrollText } from 'lucide-react';
import { useAdminAuditLog } from '@/hooks/queries/useAdmin';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { CustomSelect } from '@/components/shared/CustomSelect';
import { Pagination } from '@/components/shared/Pagination';
import {
  AdminEmpty,
  CardSkeletonList,
  MobileCard,
  STICKY_HEAD,
  TableEmptyRow,
  TableSkeletonRows,
} from '@/components/admin/AdminDataStates';
import { cn } from '@/lib/utils';

export const Route = createLazyFileRoute('/admin/audit-log/')({
  component: AdminAuditLogPage,
});

function AdminAuditLogPage() {
  const [action, setAction] = useState('');
  const [targetType, setTargetType] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminAuditLog({ page, action, targetType });

  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? 50;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rows = data?.items ?? [];
  const isEmpty = !isLoading && rows.length === 0;

  // Options come from the API so a newly-added audit action shows up in the
  // filter without a frontend release.
  const actionOptions = [
    { value: '', label: 'All actions' },
    ...(data?.actions ?? []),
  ];
  const targetTypeOptions = [
    { value: '', label: 'All targets' },
    ...(data?.targetTypes ?? []),
  ];

  const emptyProps = {
    icon: ScrollText,
    title: action || targetType ? 'No events match these filters' : 'No audit events yet',
    hint:
      action || targetType
        ? 'Clear a filter to see the full history.'
        : 'Every promote, demote, cancel, restore, and config change lands here.',
  };

  return (
    <div>
      <PageHeader title="Audit log" />
      <p className="text-[14px] text-text-secondary mb-4 -mt-2">
        Append-only history of every admin action. Used for accountability and incident investigation.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="w-56">
          <CustomSelect
            value={action}
            onChange={(v) => {
              setAction(v);
              setPage(1);
            }}
            options={actionOptions}
          />
        </div>
        <div className="w-48">
          <CustomSelect
            value={targetType}
            onChange={(v) => {
              setTargetType(v);
              setPage(1);
            }}
            options={targetTypeOptions}
          />
        </div>
        <span className="text-[13px] text-text-tertiary tabular-nums ml-auto">
          {total.toLocaleString()} events
        </span>
      </div>

      <div className="md:hidden">
        {isLoading && <CardSkeletonList />}
        {isEmpty && (
          <GlassCard hover={false}>
            <AdminEmpty {...emptyProps} />
          </GlassCard>
        )}
        {!isLoading && rows.length > 0 && (
          <div className="space-y-2">
            {rows.map((row) => (
              <MobileCard key={row.publicId}>
                <div className="flex items-start justify-between gap-2">
                  <ActionBadge action={row.action} label={row.actionLabel} />
                  <span className="text-[11.5px] text-text-tertiary tabular-nums whitespace-nowrap">
                    {new Date(row.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 text-[13.5px] text-text-primary">
                  <TargetLink
                    type={row.targetType}
                    publicId={row.targetPublicId}
                    label={row.targetLabel}
                  />
                </p>
                <p className="text-[12px] text-text-tertiary truncate">
                  by {row.actor?.email ?? row.actorEmail ?? 'deleted user'}
                </p>
                <MetadataChips metadata={row.metadata} className="mt-2" />
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
                <th className="text-left px-4 py-2.5 font-medium">When</th>
                <th className="text-left px-4 py-2.5 font-medium">Actor</th>
                <th className="text-left px-4 py-2.5 font-medium">Action</th>
                <th className="text-left px-4 py-2.5 font-medium">Target</th>
                <th className="text-left px-4 py-2.5 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <TableSkeletonRows cols={5} rows={10} />}
              {isEmpty && <TableEmptyRow colSpan={5} {...emptyProps} />}
              {!isLoading &&
                rows.map((row) => (
                  <tr
                    key={row.publicId}
                    className="border-t border-cream-3/60 hover:bg-cream-3/20 transition-colors"
                  >
                    <td className="px-4 py-2.5 text-text-tertiary text-[12.5px] tabular-nums whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-text-secondary">
                      {row.actor ? (
                        <Link
                          to="/admin/users/$publicId"
                          params={{ publicId: row.actor.publicId }}
                          className="text-text-primary hover:text-coffee no-underline"
                        >
                          {row.actor.email}
                        </Link>
                      ) : (
                        <span className="text-text-tertiary italic">
                          {row.actorEmail ?? 'deleted user'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <ActionBadge action={row.action} label={row.actionLabel} />
                    </td>
                    <td className="px-4 py-2.5 text-text-secondary">
                      <TargetLink
                        type={row.targetType}
                        publicId={row.targetPublicId}
                        label={row.targetLabel}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <MetadataChips metadata={row.metadata} />
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
    <span className={cn('text-[11.5px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap', tone)}>
      {label}
    </span>
  );
}

function TargetLink({
  type,
  publicId,
  label,
}: {
  type: string;
  publicId: string | null;
  label: string | null;
}) {
  if (!publicId) return <span className="text-text-tertiary">—</span>;
  if (type === 'user') {
    return (
      <Link
        to="/admin/users/$publicId"
        params={{ publicId }}
        className="text-text-primary hover:text-coffee no-underline"
      >
        {label ?? publicId}
      </Link>
    );
  }
  if (type === 'workspace') {
    return (
      <Link
        to="/admin/workspaces/$publicId"
        params={{ publicId }}
        className="text-text-primary hover:text-coffee no-underline"
      >
        {label ?? publicId}
      </Link>
    );
  }
  return <span>{label ?? publicId}</span>;
}

/**
 * Metadata is free-form JSON per action (`{from: 'free', to: 'espresso'}`).
 * Chips keep the key/value boundary readable where the old `k=v · k=v` string
 * ran together at 12px.
 */
function MetadataChips({
  metadata,
  className,
}: {
  metadata: Record<string, unknown> | null;
  className?: string;
}) {
  const entries = Object.entries(metadata ?? {});
  if (entries.length === 0) return <span className="text-text-tertiary">—</span>;
  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {entries.map(([k, v]) => (
        <span
          key={k}
          className="inline-flex items-center gap-1 rounded-md bg-cream-3/60 px-1.5 py-0.5 text-[11.5px]"
        >
          <span className="text-text-tertiary">{k}</span>
          <span className="font-mono text-text-secondary">{String(v)}</span>
        </span>
      ))}
    </div>
  );
}
