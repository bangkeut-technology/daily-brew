"use client";

import { use, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Ban, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  useAdminWorkspace,
  useCancelWorkspaceSubscription,
  useRestoreWorkspace,
  useUpdateAdminWorkspacePlan,
  useUpdateAdminWorkspaceTestingTrack,
} from "@/hooks/useAdmin";
import type { WorkspacePlan, WorkspaceTestingTrack } from "@/types/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard, GlassCardHeader } from "@/components/shared/GlassCard";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { PlanBadge } from "@/components/shared/PlanBadge";
import { SubscriptionStatusBadge } from "@/components/shared/SubscriptionStatusBadge";
import { TestingTrackBadge } from "@/components/shared/TestingTrackBadge";
import { DetailSkeleton } from "@/components/admin/AdminDataStates";
import { LastActivityCell } from "@/components/admin/LastActivityCell";
import { cn } from "@/lib/utils";
import { formatAdminDateTime } from "@/lib/adminDate";

const PLAN_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "espresso", label: "Espresso" },
  { value: "double_espresso", label: "Double Espresso" },
];

const TRACK_OPTIONS = [
  { value: "none", label: "No testing track" },
  { value: "alpha", label: "Alpha tester" },
  { value: "beta", label: "Beta tester" },
];

export default function AdminWorkspaceDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = use(params);
  const { data: ws, isLoading } = useAdminWorkspace(publicId);
  const cancelMutation = useCancelWorkspaceSubscription();
  const restoreMutation = useRestoreWorkspace();
  const trackMutation = useUpdateAdminWorkspaceTestingTrack();
  const planMutation = useUpdateAdminWorkspacePlan();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);

  if (isLoading || !ws) return <DetailSkeleton cards={6} />;

  const canCancel = ws.subscription !== null && ws.subscription.isActive;
  const isDeleted = ws.deletedAt !== null;
  // The endpoint refuses a comp while Paddle owns billing, so lock the control
  // instead of letting it look operable and fail on submit.
  const planLocked = ws.subscription?.paddleSubscriptionId != null;

  return (
    <div className="page-enter">
      <Link
        href="/admin/workspaces"
        className="mb-3 inline-flex items-center gap-1.5 text-[13.5px] text-text-secondary no-underline hover:text-coffee"
      >
        <ArrowLeft size={14} />
        Back to workspaces
      </Link>

      <PageHeader
        title={ws.name || "(unnamed)"}
        action={
          isDeleted ? (
            <button
              type="button"
              onClick={() => setConfirmRestore(true)}
              disabled={restoreMutation.isPending}
              className="flex items-center gap-1.5 rounded-lg bg-coffee px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50"
            >
              <RotateCcw size={14} /> Restore workspace
            </button>
          ) : canCancel ? (
            <button
              type="button"
              onClick={() => setConfirmCancel(true)}
              disabled={cancelMutation.isPending}
              className="flex items-center gap-1.5 rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-sm font-medium text-red transition-colors hover:bg-red/8 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Ban size={14} /> Cancel subscription
            </button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <GlassCard hover={false}>
          <GlassCardHeader title="Identity" />
          <dl className="grid grid-cols-[140px_1fr] gap-y-2 p-5 text-[13.5px]">
            <Field label="Public ID" value={ws.publicId} mono />
            <Field label="QR token" value={ws.qrToken} mono />
            <Field label="Created" value={formatAdminDateTime(ws.createdAt)} />
            <Field label="Updated" value={formatAdminDateTime(ws.updatedAt)} />
            {ws.deletedAt && (
              <Field label="Deleted" value={formatAdminDateTime(ws.deletedAt)} className="text-red" />
            )}
          </dl>
        </GlassCard>

        <GlassCard hover={false}>
          <GlassCardHeader title="Owner" />
          <dl className="grid grid-cols-[140px_1fr] gap-y-2 p-5 text-[13.5px]">
            {ws.owner ? (
              <>
                <Field label="Email" value={ws.owner.email} />
                <Field label="Name" value={ws.owner.fullName || "—"} />
                <dt className="text-text-tertiary">Profile</dt>
                <dd>
                  <Link
                    href={`/admin/users/${ws.owner.publicId}`}
                    className="text-coffee no-underline hover:underline"
                  >
                    Open user
                  </Link>
                </dd>
              </>
            ) : (
              <Field label="Owner" value="—" />
            )}
          </dl>
        </GlassCard>

        <GlassCard hover={false}>
          <GlassCardHeader
            title="Subscription"
            action={ws.subscription ? <PlanBadge plan={ws.subscription.plan} /> : null}
          />
          <dl className="grid grid-cols-[140px_1fr] gap-y-2 p-5 text-[13.5px]">
            {ws.subscription ? (
              <>
                <Field
                  label="Status"
                  value={<SubscriptionStatusBadge status={ws.subscription.status} />}
                />
                <Field
                  label="Period end"
                  value={formatAdminDateTime(ws.subscription.currentPeriodEnd)}
                />
                <Field
                  label="Trial end"
                  value={formatAdminDateTime(ws.subscription.trialEndsAt)}
                />
                {ws.subscription.canceledAt && (
                  <Field
                    label="Canceled"
                    value={formatAdminDateTime(ws.subscription.canceledAt)}
                    className="text-red"
                  />
                )}
                <Field label="Paddle sub" value={ws.subscription.paddleSubscriptionId ?? "—"} mono />
                <Field label="Paddle cust" value={ws.subscription.paddleCustomerId ?? "—"} mono />
              </>
            ) : (
              <Field label="Subscription" value="None (free tier)" />
            )}
          </dl>
        </GlassCard>

        <GlassCard hover={false}>
          <GlassCardHeader title="Counts & settings" />
          <dl className="grid grid-cols-[140px_1fr] gap-y-2 p-5 text-[13.5px]">
            <Field label="Employees" value={String(ws.employeeCount)} />
            <Field label="QR codes" value={String(ws.qrCodeCount)} />
            {ws.settings && (
              <>
                <Field label="Timezone" value={ws.settings.timezone} />
                <Field label="IP restriction" value={ws.settings.ipRestrictionEnabled ? "On" : "Off"} />
                <Field label="Geofencing" value={ws.settings.geofencingEnabled ? "On" : "Off"} />
                <Field
                  label="Device verify"
                  value={ws.settings.deviceVerificationEnabled ? "On" : "Off"}
                />
              </>
            )}
          </dl>
        </GlassCard>

        <GlassCard hover={false} className="md:col-span-2">
          <GlassCardHeader
            title="Activity & adoption"
            action={<LastActivityCell date={ws.activity.lastActivityDate} className="items-end" />}
          />
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <ActivityStat label="Check-ins · 7d" value={ws.activity.attendancesLast7d} />
              <ActivityStat label="Check-ins · 30d" value={ws.activity.attendancesLast30d} />
              <ActivityStat label="Check-ins · all time" value={ws.activity.attendancesTotal} />
              <ActivityStat label="Managers" value={ws.activity.managerCount} />
            </div>

            {/* An employee without a linked user account cannot check in at
                all, so this gap — not the headcount — is the real onboarding
                drop-off. */}
            <div className="mt-4 rounded-xl bg-cream-3/40 px-4 py-3">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-[13px] text-text-secondary">
                  Employees with a linked account
                </span>
                <span className="text-[13px] tabular-nums text-text-primary">
                  <span className="font-semibold">{ws.activity.linkedEmployeeCount}</span>
                  <span className="text-text-tertiary"> / {ws.employeeCount}</span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-cream-3">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    ws.employeeCount > 0 && ws.activity.linkedEmployeeCount === ws.employeeCount
                      ? "bg-green"
                      : "bg-amber",
                  )}
                  style={{
                    width: `${ws.employeeCount > 0 ? Math.round((ws.activity.linkedEmployeeCount / ws.employeeCount) * 100) : 0}%`,
                  }}
                />
              </div>
              {ws.employeeCount > ws.activity.linkedEmployeeCount && (
                <p className="mt-2 text-xs leading-snug text-text-tertiary">
                  {ws.employeeCount - ws.activity.linkedEmployeeCount} employee(s) can&apos;t check
                  in until their user account is linked.
                </p>
              )}
            </div>
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <GlassCardHeader
            title="Plan override"
            action={<PlanBadge plan={ws.subscription?.plan ?? "free"} />}
          />
          <div className="space-y-3 p-5">
            <p className="text-[13px] leading-relaxed text-text-secondary">
              Comp a workspace onto a paid plan (or back to Free) without going through Paddle.
              Disabled if a Paddle subscription is attached — cancel it in Paddle first.
            </p>
            <div className="w-56">
              <CustomSelect
                id="admin-plan-override"
                value={ws.subscription?.plan ?? "free"}
                disabled={planLocked}
                title={planLocked ? "Cancel the Paddle subscription first" : undefined}
                options={PLAN_OPTIONS}
                onChange={(v) =>
                  planMutation.mutate(
                    { publicId, plan: v as WorkspacePlan },
                    {
                      onSuccess: () => toast.success(`Plan set to ${v}`),
                      onError: () => toast.error("Failed to update plan"),
                    },
                  )
                }
              />
            </div>
            {planLocked && (
              <p className="text-[12.5px] leading-relaxed text-amber">
                Paddle subscription{" "}
                <span className="font-mono">{ws.subscription?.paddleSubscriptionId}</span> is
                attached — admin override blocked.
              </p>
            )}
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <GlassCardHeader title="Testing track" action={<TestingTrackBadge track={ws.testingTrack} />} />
          <div className="space-y-3 p-5">
            <p className="text-[13px] leading-relaxed text-text-secondary">
              Opts this workspace into early access for feature-flagged surfaces. Alpha sees every
              stage (dev when running locally + alpha + beta + release); beta sees beta + release;
              none sees release only.
            </p>
            <div className="w-48">
              <CustomSelect
                id="admin-testing-track"
                value={ws.testingTrack}
                options={TRACK_OPTIONS}
                onChange={(v) =>
                  trackMutation.mutate(
                    { publicId, track: v as WorkspaceTestingTrack },
                    {
                      onSuccess: () => toast.success(`Testing track set to ${v}`),
                      onError: () => toast.error("Failed to update testing track"),
                    },
                  )
                }
              />
            </div>
          </div>
        </GlassCard>
      </div>

      <ConfirmModal
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel subscription"
        description={`Cancel the ${ws.subscription?.plan ?? ""} subscription for ${ws.name}? This calls Paddle and marks it canceled locally. The workspace reverts to free-tier limits immediately.`}
        confirmLabel="Cancel subscription"
        cancelLabel="Keep active"
        variant="danger"
        loading={cancelMutation.isPending}
        onConfirm={() =>
          cancelMutation.mutate(publicId, {
            onSuccess: () => {
              toast.success("Subscription canceled");
              setConfirmCancel(false);
            },
            onError: () => toast.error("Failed to cancel subscription"),
          })
        }
      />

      <ConfirmModal
        open={confirmRestore}
        onOpenChange={setConfirmRestore}
        title="Restore workspace"
        description={`Restore ${ws.name}? Employees soft-deleted with the workspace are reactivated, but their user links were severed at delete time and must be re-linked manually by the owner.`}
        confirmLabel="Restore"
        loading={restoreMutation.isPending}
        onConfirm={() =>
          restoreMutation.mutate(publicId, {
            onSuccess: (result) => {
              toast.success(`Workspace restored — ${result.restoredEmployees} employee(s) reactivated`);
              setConfirmRestore(false);
            },
            onError: () => toast.error("Failed to restore workspace"),
          })
        }
      />
    </div>
  );
}

function ActivityStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-cream-3/40 px-3 py-2.5">
      <div className="text-[11.5px] uppercase tracking-wide text-text-tertiary">{label}</div>
      <div className="mt-0.5 text-[22px] font-semibold leading-tight tabular-nums text-text-primary">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <>
      <dt className="text-text-tertiary">{label}</dt>
      <dd className={cn("min-w-0 break-words text-text-primary", mono && "font-mono text-[12.5px]", className)}>
        {value}
      </dd>
    </>
  );
}
