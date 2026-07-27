import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, ShieldOff, UserCircle } from 'lucide-react';
import { useAdminUsers, useDemoteUser, usePromoteUser } from '@/hooks/queries/useAdmin';
import { useAuthenticationState } from '@/hooks/use-authentication';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { Toggle } from '@/components/shared/Toggle';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { Pagination } from '@/components/shared/Pagination';
import { AdminSearchInput } from '@/components/admin/AdminSearchInput';
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
import type { AdminUserRow } from '@/types';

export const Route = createLazyFileRoute('/admin/users/')({
  component: AdminUsersPage,
});

function authMethods(u: AdminUserRow): string {
  return [u.hasPassword && 'pw', u.hasGoogle && 'google', u.hasApple && 'apple']
    .filter(Boolean)
    .join(' · ') || '—';
}

function AdminUsersPage() {
  const auth = useAuthenticationState();
  const [search, setSearch] = useState('');
  const [superAdminOnly, setSuperAdminOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [demoteTarget, setDemoteTarget] = useState<AdminUserRow | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<AdminUserRow | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const { data, isLoading } = useAdminUsers({ page, search: debouncedSearch, superAdminOnly });
  const promote = usePromoteUser();
  const demote = useDemoteUser();

  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? 25;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const users = data?.items ?? [];
  const isEmpty = !isLoading && users.length === 0;
  const isFiltered = debouncedSearch !== '' || superAdminOnly;

  const handlePromote = async () => {
    if (!promoteTarget) return;
    try {
      await promote.mutateAsync(promoteTarget.publicId);
      toast.success(`${promoteTarget.email} promoted`);
      setPromoteTarget(null);
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

  const emptyProps = {
    icon: UserCircle,
    title: isFiltered ? 'No users match these filters' : 'No users yet',
    hint: isFiltered ? 'Try a different email, or turn off the super-admins filter.' : undefined,
  };

  return (
    <div>
      <PageHeader title="Users" />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <AdminSearchInput
          id="admin-user-search"
          label="Search users"
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by email or name…"
          className="flex-1 sm:max-w-md"
        />
        <div className="flex items-center gap-3">
          <label htmlFor="admin-users-super-only" className="text-[13px] text-text-secondary">
            Super admins only
          </label>
          <Toggle
            id="admin-users-super-only"
            checked={superAdminOnly}
            onChange={(v) => {
              setSuperAdminOnly(v);
              setPage(1);
            }}
          />
          <span className="text-[13px] text-text-tertiary tabular-nums ml-auto sm:ml-0">
            {total.toLocaleString()} total
          </span>
        </div>
      </div>

      {/* Phones get cards — an 6-column table forces horizontal scrolling that
          hides the promote/demote action off-screen. */}
      <div className="md:hidden">
        {isLoading && <CardSkeletonList />}
        {isEmpty && (
          <GlassCard hover={false}>
            <AdminEmpty {...emptyProps} />
          </GlassCard>
        )}
        {!isLoading && users.length > 0 && (
          <div className="space-y-2">
            {users.map((u) => {
              const isSelf = auth.user?.publicId === u.publicId;
              return (
                <MobileCard key={u.publicId}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        to="/admin/users/$publicId"
                        params={{ publicId: u.publicId }}
                        className="text-[14.5px] font-medium text-text-primary hover:text-coffee no-underline block truncate"
                      >
                        {u.email}
                      </Link>
                      {u.fullName && (
                        <p className="text-[12.5px] text-text-tertiary truncate">{u.fullName}</p>
                      )}
                    </div>
                    <RoleActionButton
                      user={u}
                      isSelf={isSelf}
                      pending={promote.isPending || demote.isPending}
                      onPromote={() => setPromoteTarget(u)}
                      onDemote={() => setDemoteTarget(u)}
                    />
                  </div>
                  <div className="mt-2 space-y-1">
                    {u.isSuperAdmin && (
                      <MobileField label="Role">
                        <SuperAdminPill />
                      </MobileField>
                    )}
                    <MobileField label="Auth">{authMethods(u)}</MobileField>
                    <MobileField label="Created">
                      {formatAdminDate(u.createdAt)}
                    </MobileField>
                  </div>
                </MobileCard>
              );
            })}
          </div>
        )}
      </div>

      <GlassCard hover={false} className="hidden md:block">
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full text-[13.5px]">
            <thead className={STICKY_HEAD}>
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">Email</th>
                <th className="text-left px-4 py-2.5 font-medium">Name</th>
                <th className="text-left px-4 py-2.5 font-medium">Auth</th>
                <th className="text-left px-4 py-2.5 font-medium">Role</th>
                <th className="text-left px-4 py-2.5 font-medium">Created</th>
                <th className="text-right px-4 py-2.5 font-medium w-10">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <TableSkeletonRows cols={6} />}
              {isEmpty && <TableEmptyRow colSpan={6} {...emptyProps} />}
              {!isLoading &&
                users.map((u) => {
                  const isSelf = auth.user?.publicId === u.publicId;
                  return (
                    <tr
                      key={u.publicId}
                      className="border-t border-cream-3/60 hover:bg-cream-3/20 transition-colors"
                    >
                      <td className="px-4 py-2.5">
                        <Link
                          to="/admin/users/$publicId"
                          params={{ publicId: u.publicId }}
                          className="text-text-primary font-medium hover:text-coffee no-underline"
                        >
                          {u.email}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-text-secondary">{u.fullName || '—'}</td>
                      <td className="px-4 py-2.5 text-text-secondary text-[12.5px]">
                        {authMethods(u)}
                      </td>
                      <td className="px-4 py-2.5">{u.isSuperAdmin && <SuperAdminPill />}</td>
                      <td className="px-4 py-2.5 text-text-tertiary text-[12.5px] tabular-nums">
                        {formatAdminDate(u.createdAt)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <RoleActionButton
                          user={u}
                          isSelf={isSelf}
                          pending={promote.isPending || demote.isPending}
                          onPromote={() => setPromoteTarget(u)}
                          onDemote={() => setDemoteTarget(u)}
                        />
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
        open={!!promoteTarget}
        onOpenChange={(open) => {
          if (!open) setPromoteTarget(null);
        }}
        title="Grant super-admin role"
        description={`Grant super admin to ${promoteTarget?.email ?? ''}? They get full read/write access to every workspace, user, and subscription on the platform.`}
        confirmLabel="Grant"
        cancelLabel="Cancel"
        variant="default"
        loading={promote.isPending}
        onConfirm={handlePromote}
      />

      <ConfirmModal
        open={!!demoteTarget}
        onOpenChange={(open) => {
          if (!open) setDemoteTarget(null);
        }}
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

function SuperAdminPill() {
  return (
    <span className="inline-flex items-center gap-1 text-[11.5px] px-2 py-0.5 rounded-full bg-coffee/15 text-coffee font-medium">
      <ShieldCheck size={11} /> Super admin
    </span>
  );
}

function RoleActionButton({
  user,
  isSelf,
  pending,
  onPromote,
  onDemote,
}: {
  user: AdminUserRow;
  isSelf: boolean;
  pending: boolean;
  onPromote: () => void;
  onDemote: () => void;
}) {
  const base =
    'p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer transition-colors';
  if (user.isSuperAdmin) {
    return (
      <button
        type="button"
        onClick={onDemote}
        disabled={isSelf || pending}
        title={isSelf ? 'You cannot demote yourself' : 'Revoke super-admin role'}
        aria-label="Revoke super admin"
        className={cn(base, 'text-text-tertiary hover:text-red hover:bg-red/8')}
      >
        <ShieldOff size={14} />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onPromote}
      disabled={pending}
      title="Promote to super admin"
      aria-label="Promote to super admin"
      className={cn(base, 'text-text-tertiary hover:text-coffee hover:bg-coffee/8')}
    >
      <ShieldCheck size={14} />
    </button>
  );
}
