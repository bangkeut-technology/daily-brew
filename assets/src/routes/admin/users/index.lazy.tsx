import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { Search, ShieldCheck, ShieldOff } from 'lucide-react';
import { useAdminUsers, useDemoteUser, usePromoteUser } from '@/hooks/queries/useAdmin';
import { useAuthenticationState } from '@/hooks/use-authentication';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { Toggle } from '@/components/shared/Toggle';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { Pagination } from '@/components/shared/Pagination';
import type { AdminUserRow } from '@/types';

export const Route = createLazyFileRoute('/admin/users/')({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const auth = useAuthenticationState();
  const [search, setSearch] = useState('');
  const [superAdminOnly, setSuperAdminOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [demoteTarget, setDemoteTarget] = useState<AdminUserRow | null>(null);
  const { data, isLoading } = useAdminUsers({ page, search, superAdminOnly });
  const promote = usePromoteUser();
  const demote = useDemoteUser();

  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? 25;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handlePromote = async (u: AdminUserRow) => {
    try {
      await promote.mutateAsync(u.publicId);
      toast.success(`${u.email} promoted`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to promote');
    }
  };

  const handleDemote = async () => {
    if (!demoteTarget) return;
    try {
      await demote.mutateAsync(demoteTarget.publicId);
      toast.success(`${demoteTarget.email} demoted`);
      setDemoteTarget(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to demote');
    }
  };

  return (
    <div>
      <PageHeader title="Users" />

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by email or name…"
            className="w-full pl-9 pr-3 py-2 rounded-lg text-[14.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 text-[13px] text-text-secondary">
          <span>Super admins only</span>
          <Toggle
            checked={superAdminOnly}
            onChange={(v) => { setSuperAdminOnly(v); setPage(1); }}
          />
        </div>
        <span className="text-[13px] text-text-tertiary tabular-nums">{total.toLocaleString()} total</span>
      </div>

      <GlassCard hover={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead className="bg-cream-3/40 text-text-tertiary text-[12px] uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">Email</th>
                <th className="text-left px-4 py-2.5 font-medium">Name</th>
                <th className="text-left px-4 py-2.5 font-medium">Auth</th>
                <th className="text-left px-4 py-2.5 font-medium">Role</th>
                <th className="text-left px-4 py-2.5 font-medium">Created</th>
                <th className="text-right px-4 py-2.5 font-medium w-10">{' '}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={6} className="px-4 py-6 text-center text-text-tertiary">Loading…</td></tr>}
              {!isLoading && data?.items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-text-tertiary">No users found</td></tr>
              )}
              {data?.items.map((u) => {
                const isSelf = auth.user?.publicId === u.publicId;
                return (
                  <tr key={u.publicId} className="border-t border-cream-3/60 hover:bg-cream-3/20 transition-colors">
                    <td className="px-4 py-2.5">
                      <Link to="/admin/users/$publicId" params={{ publicId: u.publicId }} className="text-text-primary font-medium hover:text-coffee no-underline">
                        {u.email}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-text-secondary">{u.fullName || '—'}</td>
                    <td className="px-4 py-2.5 text-text-secondary text-[12.5px]">
                      {[u.hasPassword && 'pw', u.hasGoogle && 'google', u.hasApple && 'apple'].filter(Boolean).join(' · ') || '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      {u.isSuperAdmin && (
                        <span className="inline-flex items-center gap-1 text-[11.5px] px-2 py-0.5 rounded-full bg-coffee/15 text-coffee font-medium">
                          <ShieldCheck size={11} /> Super admin
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-text-tertiary text-[12.5px] tabular-nums">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 text-right">
                      {u.isSuperAdmin ? (
                        <button
                          onClick={() => setDemoteTarget(u)}
                          disabled={isSelf || demote.isPending}
                          title={isSelf ? 'You cannot demote yourself' : 'Revoke super-admin role'}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-red hover:bg-red/8 disabled:opacity-30 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer transition-colors"
                          aria-label="Revoke super admin"
                        >
                          <ShieldOff size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePromote(u)}
                          disabled={promote.isPending}
                          title="Promote to super admin"
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-coffee hover:bg-coffee/8 disabled:opacity-30 bg-transparent border-none cursor-pointer transition-colors"
                          aria-label="Promote to super admin"
                        >
                          <ShieldCheck size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmModal
        open={!!demoteTarget}
        onOpenChange={(open) => { if (!open) setDemoteTarget(null); }}
        title="Revoke super-admin role"
        description={`Revoke super-admin from ${demoteTarget?.email ?? ''}? They will lose access to /admin immediately.`}
        confirmLabel="Revoke"
        cancelLabel="Cancel"
        variant="danger"
        loading={demote.isPending}
        onConfirm={handleDemote}
      />
    </div>
  );
}
