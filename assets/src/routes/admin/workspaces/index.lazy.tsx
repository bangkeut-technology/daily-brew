import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { Building2, RotateCcw } from 'lucide-react';
import { useAdminWorkspaces, useRestoreWorkspace } from '@/hooks/queries/useAdmin';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { Pagination } from '@/components/shared/Pagination';
import { Toggle } from '@/components/shared/Toggle';
import { TestingTrackBadge } from '@/components/shared/TestingTrackBadge';
import { PlanBadge } from '@/components/shared/PlanBadge';
import { SubscriptionStatusBadge } from '@/components/shared/SubscriptionStatusBadge';
import { AdminSearchInput } from '@/components/admin/AdminSearchInput';
import { LastActivityCell } from '@/components/admin/LastActivityCell';
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
import { formatAdminDate } from '@/lib/adminDate';

export const Route = createLazyFileRoute('/admin/workspaces/')({
  component: AdminWorkspacesPage,
});

function AdminWorkspacesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const debouncedSearch = useDebouncedValue(search);
  const { data, isLoading } = useAdminWorkspaces({ page, search: debouncedSearch, includeDeleted });
  const restore = useRestoreWorkspace();

  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? 25;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const workspaces = data?.items ?? [];
  const isEmpty = !isLoading && workspaces.length === 0;

  const handleRestore = async (publicId: string, name: string) => {
    try {
      const result = await restore.mutateAsync(publicId);
      toast.success(`${name} restored — ${result.restoredEmployees} employee(s) reactivated`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to restore');
    }
  };

  const emptyProps = {
    icon: Building2,
    title: debouncedSearch ? 'No workspaces match this search' : 'No workspaces yet',
    hint: debouncedSearch
      ? 'Search matches workspace name and owner email.'
      : undefined,
  };

  return (
    <div>
      <PageHeader title="Workspaces" />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <AdminSearchInput
          id="admin-workspace-search"
          label="Search workspaces"
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by name or owner email…"
          className="flex-1 sm:max-w-md"
        />
        <div className="flex items-center gap-3">
          <label htmlFor="admin-workspaces-deleted" className="text-[13px] text-text-secondary">
            Include deleted
          </label>
          <Toggle
            id="admin-workspaces-deleted"
            checked={includeDeleted}
            onChange={(v) => {
              setIncludeDeleted(v);
              setPage(1);
            }}
          />
          <span className="text-[13px] text-text-tertiary tabular-nums ml-auto sm:ml-0">
            {total.toLocaleString()} total
          </span>
        </div>
      </div>

      {/* Phones get cards — an 8-column table only ever shows its first two
          columns on a 390px screen. */}
      <div className="md:hidden">
        {isLoading && <CardSkeletonList />}
        {isEmpty && (
          <GlassCard hover={false}>
            <AdminEmpty {...emptyProps} />
          </GlassCard>
        )}
        {!isLoading && workspaces.length > 0 && (
          <div className="space-y-2">
            {workspaces.map((w) => (
              <MobileCard key={w.publicId} className={cn(w.deletedAt && 'opacity-60')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/admin/workspaces/$publicId"
                      params={{ publicId: w.publicId }}
                      className="text-[14.5px] font-medium text-text-primary hover:text-coffee no-underline block truncate"
                    >
                      {w.name || '(unnamed)'}
                    </Link>
                    <p className="text-[12.5px] text-text-tertiary truncate">
                      {w.owner?.email ?? 'no owner'}
                    </p>
                  </div>
                  {w.deletedAt && (
                    <button
                      type="button"
                      onClick={() => handleRestore(w.publicId, w.name || '(unnamed)')}
                      disabled={restore.isPending}
                      title="Restore workspace"
                      aria-label="Restore workspace"
                      className="p-1.5 rounded-lg text-text-tertiary hover:text-coffee hover:bg-coffee/8 disabled:opacity-30 bg-transparent border-none cursor-pointer transition-colors"
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <PlanBadge plan={w.plan} />
                  <SubscriptionStatusBadge status={w.subscriptionStatus} />
                  <TestingTrackBadge track={w.testingTrack} />
                  {w.deletedAt && (
                    <span className="text-[11.5px] px-2 py-0.5 rounded-full bg-red/12 text-red font-medium">
                      Deleted
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  <MobileField label="Employees">{w.employeeCount}</MobileField>
                  <MobileField label="Last activity">
                    <LastActivityCell date={w.lastActivityDate} className="items-end" />
                  </MobileField>
                  <MobileField label="Created">
                    {formatAdminDate(w.createdAt)}
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
                <th className="text-left px-4 py-2.5 font-medium">Name</th>
                <th className="text-left px-4 py-2.5 font-medium">Owner</th>
                <th className="text-left px-4 py-2.5 font-medium">Plan</th>
                <th className="text-left px-4 py-2.5 font-medium">Track</th>
                <th className="text-left px-4 py-2.5 font-medium">Status</th>
                <th className="text-right px-4 py-2.5 font-medium">Employees</th>
                <th className="text-left px-4 py-2.5 font-medium">Last activity</th>
                <th className="text-left px-4 py-2.5 font-medium">Created</th>
                <th className="text-right px-4 py-2.5 font-medium w-10">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <TableSkeletonRows cols={9} />}
              {isEmpty && <TableEmptyRow colSpan={9} {...emptyProps} />}
              {!isLoading &&
                workspaces.map((w) => (
                  <tr
                    key={w.publicId}
                    className={cn(
                      'border-t border-cream-3/60 hover:bg-cream-3/20 transition-colors',
                      w.deletedAt && 'opacity-60',
                    )}
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        to="/admin/workspaces/$publicId"
                        params={{ publicId: w.publicId }}
                        className="text-text-primary font-medium hover:text-coffee no-underline"
                      >
                        {w.name || '(unnamed)'}
                      </Link>
                      {w.deletedAt && <span className="ml-2 text-[11px] text-red">deleted</span>}
                    </td>
                    <td className="px-4 py-2.5 text-text-secondary">
                      {w.owner ? <span title={w.owner.fullName}>{w.owner.email}</span> : '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <PlanBadge plan={w.plan} />
                    </td>
                    <td className="px-4 py-2.5">
                      <TestingTrackBadge track={w.testingTrack} />
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5">
                        <SubscriptionStatusBadge status={w.subscriptionStatus} />
                        {w.isTrialing && <span className="text-[11.5px] text-amber">trial</span>}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{w.employeeCount}</td>
                    <td className="px-4 py-2.5">
                      <LastActivityCell date={w.lastActivityDate} />
                    </td>
                    <td className="px-4 py-2.5 text-text-tertiary text-[12.5px] tabular-nums">
                      {formatAdminDate(w.createdAt)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {w.deletedAt && (
                        <button
                          type="button"
                          onClick={() => handleRestore(w.publicId, w.name || '(unnamed)')}
                          disabled={restore.isPending}
                          title="Restore workspace"
                          aria-label="Restore workspace"
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-coffee hover:bg-coffee/8 disabled:opacity-30 bg-transparent border-none cursor-pointer transition-colors"
                        >
                          <RotateCcw size={14} />
                        </button>
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
