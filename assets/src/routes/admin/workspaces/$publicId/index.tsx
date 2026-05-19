import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Ban, RotateCcw } from 'lucide-react';
import {
  useAdminWorkspace,
  useCancelWorkspaceSubscription,
  useRestoreWorkspace,
  useUpdateAdminWorkspaceTestingTrack,
  type WorkspaceTestingTrack,
} from '@/hooks/queries/useAdmin';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { CustomSelect } from '@/components/shared/CustomSelect';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/admin/workspaces/$publicId/')({
  component: AdminWorkspaceDetailPage,
});

function AdminWorkspaceDetailPage() {
  const { publicId } = Route.useParams();
  const { data: ws, isLoading } = useAdminWorkspace(publicId);
  const cancelMutation = useCancelWorkspaceSubscription();
  const restoreMutation = useRestoreWorkspace();
  const trackMutation = useUpdateAdminWorkspaceTestingTrack();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);

  if (isLoading || !ws) {
    return (
      <div>
        <PageHeader title="Workspace" />
        <p className="text-text-tertiary">Loading…</p>
      </div>
    );
  }

  const canCancel = ws.subscription !== null && ws.subscription.isActive;
  const isDeleted = ws.deletedAt !== null;

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(publicId);
      toast.success('Subscription canceled');
      setConfirmCancel(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to cancel subscription');
    }
  };

  const handleRestore = async () => {
    try {
      const result = await restoreMutation.mutateAsync(publicId);
      toast.success(`Workspace restored — ${result.restoredEmployees} employee(s) reactivated`);
      setConfirmRestore(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to restore workspace');
    }
  };

  return (
    <div>
      <Link to="/admin/workspaces" className="inline-flex items-center gap-1.5 text-[13.5px] text-text-secondary hover:text-coffee mb-3 no-underline">
        <ArrowLeft size={14} />
        Back to workspaces
      </Link>
      <PageHeader
        title={ws.name || '(unnamed)'}
        action={
          isDeleted ? (
            <button
              onClick={() => setConfirmRestore(true)}
              disabled={restoreMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[14px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50 transition-colors"
            >
              <RotateCcw size={14} /> Restore workspace
            </button>
          ) : canCancel ? (
            <button
              onClick={() => setConfirmCancel(true)}
              disabled={cancelMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[14px] font-medium bg-glass-bg border border-cream-3 text-red cursor-pointer hover:bg-red/8 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Ban size={14} /> Cancel subscription
            </button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard hover={false}>
          <GlassCardHeader title="Identity" />
          <dl className="p-5 grid grid-cols-[140px_1fr] gap-y-2 text-[13.5px]">
            <Field label="Public ID" value={ws.publicId} mono />
            <Field label="QR token" value={ws.qrToken} mono />
            <Field label="Created" value={new Date(ws.createdAt).toLocaleString()} />
            <Field label="Updated" value={new Date(ws.updatedAt).toLocaleString()} />
            {ws.deletedAt && <Field label="Deleted" value={new Date(ws.deletedAt).toLocaleString()} className="text-red" />}
          </dl>
        </GlassCard>

        <GlassCard hover={false}>
          <GlassCardHeader title="Owner" />
          <dl className="p-5 grid grid-cols-[140px_1fr] gap-y-2 text-[13.5px]">
            {ws.owner ? (
              <>
                <Field label="Email" value={ws.owner.email ?? '—'} />
                <Field label="Name" value={ws.owner.fullName} />
                <dt className="text-text-tertiary">Profile</dt>
                <dd>
                  <Link to="/admin/users/$publicId" params={{ publicId: ws.owner.publicId }} className="text-coffee no-underline hover:underline">
                    Open user
                  </Link>
                </dd>
              </>
            ) : <Field label="Owner" value="—" />}
          </dl>
        </GlassCard>

        <GlassCard hover={false}>
          <GlassCardHeader title="Subscription" />
          <dl className="p-5 grid grid-cols-[140px_1fr] gap-y-2 text-[13.5px]">
            {ws.subscription ? (
              <>
                <Field label="Plan" value={ws.subscription.plan} />
                <Field label="Status" value={ws.subscription.status + (ws.subscription.isActive ? ' (active)' : '')} />
                <Field label="Period end" value={ws.subscription.currentPeriodEnd ? new Date(ws.subscription.currentPeriodEnd).toLocaleString() : '—'} />
                <Field label="Trial end" value={ws.subscription.trialEndsAt ? new Date(ws.subscription.trialEndsAt).toLocaleString() : '—'} />
                {ws.subscription.canceledAt && <Field label="Canceled" value={new Date(ws.subscription.canceledAt).toLocaleString()} className="text-red" />}
                <Field label="Paddle sub" value={ws.subscription.paddleSubscriptionId ?? '—'} mono />
                <Field label="Paddle cust" value={ws.subscription.paddleCustomerId ?? '—'} mono />
              </>
            ) : <Field label="Subscription" value="None (free tier)" />}
          </dl>
        </GlassCard>

        <GlassCard hover={false}>
          <GlassCardHeader title="Counts & settings" />
          <dl className="p-5 grid grid-cols-[140px_1fr] gap-y-2 text-[13.5px]">
            <Field label="Employees" value={String(ws.employeeCount)} />
            <Field label="QR codes" value={String(ws.qrCodeCount)} />
            {ws.settings && (
              <>
                <Field label="Timezone" value={ws.settings.timezone} />
                <Field label="IP restriction" value={ws.settings.ipRestrictionEnabled ? 'On' : 'Off'} />
                <Field label="Geofencing" value={ws.settings.geofencingEnabled ? 'On' : 'Off'} />
                <Field label="Device verify" value={ws.settings.deviceVerificationEnabled ? 'On' : 'Off'} />
              </>
            )}
          </dl>
        </GlassCard>

        <GlassCard hover={false}>
          <GlassCardHeader title="Testing track" />
          <div className="p-5 space-y-3">
            <p className="text-[13px] text-text-secondary leading-relaxed">
              Opts this workspace into early access for feature-flagged surfaces. Alpha sees every stage (dev when running locally + alpha + beta + release); beta sees beta + release; none sees release only.
            </p>
            <div className="w-48">
              <CustomSelect
                value={ws.testingTrack}
                onChange={async (v) => {
                  try {
                    await trackMutation.mutateAsync({ publicId, track: v as WorkspaceTestingTrack });
                    toast.success(`Testing track set to ${v}`);
                  } catch {
                    toast.error('Failed to update testing track');
                  }
                }}
                options={[
                  { value: 'none', label: 'No testing track' },
                  { value: 'alpha', label: 'Alpha tester' },
                  { value: 'beta', label: 'Beta tester' },
                ]}
              />
            </div>
          </div>
        </GlassCard>
      </div>

      <ConfirmModal
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel subscription"
        description={`Cancel the ${ws.subscription?.plan ?? ''} subscription for ${ws.name}? This calls Paddle and marks it canceled locally. The workspace will revert to free-tier limits immediately.`}
        confirmLabel="Cancel subscription"
        cancelLabel="Keep active"
        variant="danger"
        loading={cancelMutation.isPending}
        onConfirm={handleCancel}
      />

      <ConfirmModal
        open={confirmRestore}
        onOpenChange={setConfirmRestore}
        title="Restore workspace"
        description={`Restore ${ws.name}? Employees soft-deleted with the workspace will be reactivated, but their User links were severed at delete time and must be re-linked manually by the owner.`}
        confirmLabel="Restore"
        cancelLabel="Cancel"
        variant="default"
        loading={restoreMutation.isPending}
        onConfirm={handleRestore}
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
