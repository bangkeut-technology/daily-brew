"use client";

import { use, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { useAdminUser, useDemoteUser, usePromoteUser } from "@/hooks/useAdmin";
import { useAuth } from "@/providers/auth-provider";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard, GlassCardHeader } from "@/components/shared/GlassCard";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { DetailSkeleton } from "@/components/admin/AdminDataStates";
import { cn } from "@/lib/utils";

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = use(params);
  const { user: currentUser } = useAuth();
  const { data: user, isLoading } = useAdminUser(publicId);
  const promote = usePromoteUser();
  const demote = useDemoteUser();
  const [confirm, setConfirm] = useState<"promote" | "demote" | null>(null);

  if (isLoading || !user) return <DetailSkeleton cards={3} />;

  const isSelf = currentUser?.publicId === user.publicId;
  const pending = promote.isPending || demote.isPending;

  const runConfirm = () => {
    if (!confirm) return;
    const mutation = confirm === "promote" ? promote : demote;
    mutation.mutate(user.publicId, {
      onSuccess: () => {
        toast.success(confirm === "promote" ? "User promoted to super admin" : "Super-admin role revoked");
        setConfirm(null);
      },
      onError: () => toast.error("Action failed"),
    });
  };

  return (
    <div className="page-enter">
      <Link
        href="/admin/users"
        className="mb-3 inline-flex items-center gap-1.5 text-[13.5px] text-text-secondary no-underline hover:text-coffee"
      >
        <ArrowLeft size={14} />
        Back to users
      </Link>

      <PageHeader
        title={user.email}
        action={
          user.isSuperAdmin ? (
            <button
              type="button"
              onClick={() => setConfirm("demote")}
              disabled={isSelf || pending}
              title={isSelf ? "You cannot demote yourself" : undefined}
              className="flex items-center gap-1.5 rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-sm font-medium text-red transition-colors hover:bg-red/8 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShieldOff size={14} /> Revoke super admin
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirm("promote")}
              disabled={pending}
              className="flex items-center gap-1.5 rounded-lg bg-coffee px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50"
            >
              <ShieldCheck size={14} /> Promote to super admin
            </button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <GlassCard hover={false}>
          <GlassCardHeader title="Profile" />
          <dl className="grid grid-cols-[140px_1fr] gap-y-2 p-5 text-[13.5px]">
            <Field label="Public ID" value={user.publicId} mono />
            <Field label="Email" value={user.email} />
            <Field label="Full name" value={user.fullName || "—"} />
            <Field label="Locale" value={user.locale ?? "—"} />
            <Field label="Onboarding" value={user.onboardingCompleted ? "Completed" : "Pending"} />
            <Field
              label="Auth"
              value={
                [user.hasPassword && "password", user.hasGoogle && "Google", user.hasApple && "Apple"]
                  .filter(Boolean)
                  .join(" · ") || "—"
              }
            />
            <Field
              label="Role"
              value={user.isSuperAdmin ? "Super admin" : "User"}
              className={user.isSuperAdmin ? "font-medium text-coffee" : undefined}
            />
            <Field label="Created" value={new Date(user.createdAt).toLocaleString()} />
            <Field label="Updated" value={new Date(user.updatedAt).toLocaleString()} />
          </dl>
        </GlassCard>

        <GlassCard hover={false}>
          <GlassCardHeader title={`Owned workspaces (${user.ownedWorkspaces.length})`} />
          <div className="space-y-1 p-3">
            {user.ownedWorkspaces.length === 0 && (
              <p className="px-2 py-2 text-[13px] text-text-tertiary">None</p>
            )}
            {user.ownedWorkspaces.map((w) => (
              <Link
                key={w.publicId}
                href={`/admin/workspaces/${w.publicId}`}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-text-primary no-underline transition-colors hover:bg-cream-3/40",
                  w.deletedAt && "opacity-60",
                )}
              >
                <span className="text-sm">{w.name || "(unnamed)"}</span>
                {w.deletedAt && <span className="text-[11px] text-red">deleted</span>}
              </Link>
            ))}
          </div>
        </GlassCard>

        <GlassCard hover={false} className="md:col-span-2">
          <GlassCardHeader title={`Linked employee records (${user.linkedWorkspaces.length})`} />
          <div className="space-y-1 p-3">
            {user.linkedWorkspaces.length === 0 && (
              <p className="px-2 py-2 text-[13px] text-text-tertiary">None</p>
            )}
            {user.linkedWorkspaces.map((l) => (
              <div
                key={l.employeePublicId}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-cream-3/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-text-primary">{l.employeeName}</p>
                  <p className="text-xs text-text-tertiary">
                    at {l.workspaceName ?? "—"} · {l.role}
                  </p>
                </div>
                {l.workspacePublicId && (
                  <Link
                    href={`/admin/workspaces/${l.workspacePublicId}`}
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
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm === "promote" ? "Grant super-admin role" : "Revoke super-admin role"}
        description={
          confirm === "promote"
            ? `Grant super admin to ${user.email}? They get full read/write access to every workspace, user, and subscription on the platform.`
            : `Revoke super-admin from ${user.email}? They will lose access to /admin immediately.`
        }
        confirmLabel={confirm === "promote" ? "Grant" : "Revoke"}
        variant={confirm === "demote" ? "danger" : "default"}
        loading={pending}
        onConfirm={runConfirm}
      />
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
      <dd className={cn("text-text-primary", mono && "font-mono text-[12.5px]", className)}>
        {value}
      </dd>
    </>
  );
}
