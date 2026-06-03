import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { RotateCcw, Search } from 'lucide-react';
import { useAdminWorkspaces, useRestoreWorkspace } from '@/hooks/queries/useAdmin';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { Pagination } from '@/components/shared/Pagination';
import { Toggle } from '@/components/shared/Toggle';
import { TestingTrackBadge } from '@/components/shared/TestingTrackBadge';
import { PlanBadge } from '@/components/shared/PlanBadge';
import { cn } from '@/lib/utils';

export const Route = createLazyFileRoute('/admin/workspaces/')({
  component: AdminWorkspacesPage,
});

function AdminWorkspacesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const { data, isLoading } = useAdminWorkspaces({ page, search, includeDeleted });
  const restore = useRestoreWorkspace();

  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? 25;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleRestore = async (publicId: string, name: string) => {
    try {
      const result = await restore.mutateAsync(publicId);
      toast.success(`${name} restored — ${result.restoredEmployees} employee(s) reactivated`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to restore');
    }
  };

  return (
    <div>
      <PageHeader title="Workspaces" />

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or owner email…"
            className="w-full pl-9 pr-3 py-2 rounded-lg text-[14.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 text-[13px] text-text-secondary">
          <span>Include deleted</span>
          <Toggle
            checked={includeDeleted}
            onChange={(v) => { setIncludeDeleted(v); setPage(1); }}
          />
        </div>
        <span className="text-[13px] text-text-tertiary tabular-nums">{total.toLocaleString()} total</span>
      </div>

      <GlassCard hover={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead className="bg-cream-3/40 text-text-tertiary text-[12px] uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">Name</th>
                <th className="text-left px-4 py-2.5 font-medium">Owner</th>
                <th className="text-left px-4 py-2.5 font-medium">Plan</th>
                <th className="text-left px-4 py-2.5 font-medium">Track</th>
                <th className="text-left px-4 py-2.5 font-medium">Status</th>
                <th className="text-right px-4 py-2.5 font-medium">Employees</th>
                <th className="text-left px-4 py-2.5 font-medium">Created</th>
                <th className="text-right px-4 py-2.5 font-medium w-10">{' '}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-text-tertiary">Loading…</td></tr>
              )}
              {!isLoading && data?.items.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-text-tertiary">No workspaces found</td></tr>
              )}
              {data?.items.map((w) => (
                <tr key={w.publicId} className={cn('border-t border-cream-3/60 hover:bg-cream-3/20 transition-colors', w.deletedAt && 'opacity-60')}>
                  <td className="px-4 py-2.5">
                    <Link to="/admin/workspaces/$publicId" params={{ publicId: w.publicId }} className="text-text-primary font-medium hover:text-coffee no-underline">
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
                  <td className="px-4 py-2.5 text-text-secondary text-[12.5px]">
                    {w.subscriptionStatus ?? '—'}{w.isTrialing ? ' (trial)' : ''}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{w.employeeCount}</td>
                  <td className="px-4 py-2.5 text-text-tertiary text-[12.5px] tabular-nums">{new Date(w.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 text-right">
                    {w.deletedAt && (
                      <button
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

