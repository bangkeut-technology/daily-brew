import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, ShieldCheck, ShieldOff } from 'lucide-react';
import { useAdminUser, useDemoteUser, usePromoteUser } from '@/hooks/queries/useAdmin';
import { useAuthenticationState } from '@/hooks/use-authentication';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { cn } from '@/lib/utils';

export const Route = createLazyFileRoute('/admin/users/$publicId/')({
  component: AdminUserDetailPage,
});

function AdminUserDetailPage() {
  const { publicId } = Route.useParams();
  const auth = useAuthenticationState();
  const { data: user, isLoading } = useAdminUser(publicId);
  const promote = usePromoteUser();
  const demote = useDemoteUser();
  const [confirmDemote, setConfirmDemote] = useState(false);

  if (isLoading || !user) {
    return <div><PageHeader title="User" /><p className="text-text-tertiary">Loading…</p></div>;
  }

  const isSelf = auth.user?.publicId === user.publicId;

  const handlePromote = async () => {
    try {
      await promote.mutateAsync(user.publicId);
      toast.success('User promoted to super admin');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to promote');
    }
  };

  const handleDemote = async () => {
    try {
      await demote.mutateAsync(user.publicId);
      toast.success('Super-admin role revoked');
      setConfirmDemote(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to demote');
    }
  };

  return (
    <div>
      <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-[13.5px] text-text-secondary hover:text-coffee mb-3 no-underline">
        <ArrowLeft size={14} />
        Back to users
      </Link>
      <PageHeader
        title={user.email}
        action={
          user.isSuperAdmin ? (
            <button
              onClick={() => setConfirmDemote(true)}
              disabled={isSelf || demote.isPending}
              title={isSelf ? 'You cannot demote yourself' : undefined}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[14px] font-medium bg-glass-bg border border-cream-3 text-red cursor-pointer hover:bg-red/8 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ShieldOff size={14} /> Revoke super admin
            </button>
          ) : (
            <button
              onClick={handlePromote}
              disabled={promote.isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[14px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50 transition-colors"
            >
              <ShieldCheck size={14} /> Promote to super admin
            </button>
          )
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard hover={false}>
          <GlassCardHeader title="Profile" />
          <dl className="p-5 grid grid-cols-[140px_1fr] gap-y-2 text-[13.5px]">
            <Field label="Public ID" value={user.publicId} mono />
            <Field label="Email" value={user.email} />
            <Field label="Full name" value={user.fullName || '—'} />
            <Field label="Locale" value={user.locale ?? '—'} />
            <Field label="Onboarding" value={user.onboardingCompleted ? 'Completed' : 'Pending'} />
            <Field label="Auth" value={[user.hasPassword && 'password', user.hasGoogle && 'Google', user.hasApple && 'Apple'].filter(Boolean).join(' · ') || '—'} />
            <Field label="Role" value={user.isSuperAdmin ? 'Super admin' : 'User'} className={user.isSuperAdmin ? 'text-coffee font-medium' : ''} />
            <Field label="Created" value={new Date(user.createdAt).toLocaleString()} />
            <Field label="Updated" value={new Date(user.updatedAt).toLocaleString()} />
          </dl>
        </GlassCard>

        <GlassCard hover={false}>
          <GlassCardHeader title={`Owned workspaces (${user.ownedWorkspaces.length})`} />
          <div className="p-3 space-y-1">
            {user.ownedWorkspaces.length === 0 && <p className="px-2 py-2 text-text-tertiary text-[13px]">None</p>}
            {user.ownedWorkspaces.map((w) => (
              <Link
                key={w.publicId}
                to="/admin/workspaces/$publicId"
                params={{ publicId: w.publicId }}
                className={cn('flex items-center justify-between px-3 py-2 rounded-lg hover:bg-cream-3/40 transition-colors no-underline text-text-primary', w.deletedAt && 'opacity-60')}
              >
                <span className="text-[14px]">{w.name || '(unnamed)'}</span>
                {w.deletedAt && <span className="text-[11px] text-red">deleted</span>}
              </Link>
            ))}
          </div>
        </GlassCard>

        <GlassCard hover={false} className="md:col-span-2">
          <GlassCardHeader title={`Linked employee records (${user.linkedWorkspaces.length})`} />
          <div className="p-3 space-y-1">
            {user.linkedWorkspaces.length === 0 && <p className="px-2 py-2 text-text-tertiary text-[13px]">None</p>}
            {user.linkedWorkspaces.map((l) => (
              <div key={l.employeePublicId} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-cream-3/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] text-text-primary truncate">{l.employeeName}</p>
                  <p className="text-[12px] text-text-tertiary">at {l.workspaceName ?? '—'} · {l.role}</p>
                </div>
                {l.workspacePublicId && (
                  <Link
                    to="/admin/workspaces/$publicId"
                    params={{ publicId: l.workspacePublicId }}
                    className="text-[12.5px] text-coffee no-underline hover:underline"
                  >
                    Open workspace
                  </Link>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <ConfirmModal
        open={confirmDemote}
        onOpenChange={setConfirmDemote}
        title="Revoke super-admin role"
        description={`Revoke super-admin from ${user.email}? They will lose access to /admin immediately.`}
        confirmLabel="Revoke"
        cancelLabel="Cancel"
        variant="danger"
        loading={demote.isPending}
        onConfirm={handleDemote}
      />
    </div>
  );
}

function Field({ label, value, mono, className }: { label: string; value: string; mono?: boolean; className?: string }) {
  return (
    <>
      <dt className="text-text-tertiary">{label}</dt>
      <dd className={cn('text-text-primary', mono && 'font-mono text-[12.5px]', className)}>{value}</dd>
    </>
  );
}
