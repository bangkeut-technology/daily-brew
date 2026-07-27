"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, ShieldOff, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { useAdminUsers, usePromoteUser, useDemoteUser } from "@/hooks/useAdmin";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAuth } from "@/providers/auth-provider";
import type { AdminUserRow } from "@/types/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Toggle } from "@/components/shared/Toggle";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { Pager } from "@/components/admin/Pager";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import {
  AdminEmpty,
  CardSkeletonList,
  MobileCard,
  MobileField,
  STICKY_HEAD,
  TABLE_SCROLL,
  TableEmptyRow,
  TableSkeletonRows,
} from "@/components/admin/AdminDataStates";
import { cn } from "@/lib/utils";
import { formatAdminDate } from "@/lib/adminDate";

function authMethods(u: AdminUserRow): string {
  return (
    [u.hasPassword && "pw", u.hasGoogle && "google", u.hasApple && "apple"]
      .filter(Boolean)
      .join(" · ") || "—"
  );
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [superAdminOnly, setSuperAdminOnly] = useState(false);
  const debouncedSearch = useDebouncedValue(search);
  const { data, isLoading } = useAdminUsers({
    page,
    search: debouncedSearch || undefined,
    superAdminOnly: superAdminOnly || undefined,
  });
  const promote = usePromoteUser();
  const demote = useDemoteUser();
  const [target, setTarget] = useState<{ user: AdminUserRow; action: "promote" | "demote" } | null>(
    null,
  );

  const users = data?.items ?? [];
  const isEmpty = !isLoading && users.length === 0;
  const isFiltered = debouncedSearch !== "" || superAdminOnly;
  const pending = promote.isPending || demote.isPending;

  const confirm = () => {
    if (!target) return;
    const mutation = target.action === "promote" ? promote : demote;
    mutation.mutate(target.user.publicId, {
      onSuccess: () => {
        toast.success(`${target.user.email} ${target.action}d`);
        setTarget(null);
      },
      onError: () => toast.error("Action failed"),
    });
  };

  const emptyProps = {
    icon: UserCircle,
    title: isFiltered ? "No users match these filters" : "No users yet",
    hint: isFiltered ? "Try a different email, or turn off the super-admins filter." : undefined,
  };

  return (
    <div className="page-enter">
      <PageHeader title="Users" />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <AdminSearchInput
          id="admin-user-search"
          label="Search users"
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by email or name…"
          className="flex-1 sm:max-w-sm"
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
        </div>
      </div>

      {/* Phones get cards — a 6-column table forces horizontal scrolling that
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
            {users.map((u) => (
              <MobileCard key={u.publicId}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/users/${u.publicId}`}
                      className="block truncate text-[14.5px] font-medium text-text-primary no-underline hover:text-coffee"
                    >
                      {u.email}
                    </Link>
                    {u.fullName && (
                      <p className="truncate text-[12.5px] text-text-tertiary">{u.fullName}</p>
                    )}
                  </div>
                  <RoleActionButton
                    user={u}
                    isSelf={u.publicId === currentUser?.publicId}
                    pending={pending}
                    onAction={(action) => setTarget({ user: u, action })}
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
            ))}
          </div>
        )}
      </div>

      <GlassCard hover={false} className="hidden md:block">
        <div className={TABLE_SCROLL}>
          <table className="w-full text-[13.5px]">
            <thead className={STICKY_HEAD}>
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Email</th>
                <th className="px-4 py-2.5 text-left font-medium">Name</th>
                <th className="px-4 py-2.5 text-left font-medium">Auth</th>
                <th className="px-4 py-2.5 text-left font-medium">Role</th>
                <th className="px-4 py-2.5 text-left font-medium">Created</th>
                <th className="w-10 px-4 py-2.5 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <TableSkeletonRows cols={6} />}
              {isEmpty && <TableEmptyRow colSpan={6} {...emptyProps} />}
              {!isLoading &&
                users.map((u) => (
                  <tr
                    key={u.publicId}
                    className="border-t border-cream-3/60 transition-colors hover:bg-cream-3/20"
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/admin/users/${u.publicId}`}
                        className="font-medium text-text-primary no-underline hover:text-coffee"
                      >
                        {u.email}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-text-secondary">{u.fullName || "—"}</td>
                    <td className="px-4 py-2.5 text-[12.5px] text-text-secondary">{authMethods(u)}</td>
                    <td className="px-4 py-2.5">{u.isSuperAdmin && <SuperAdminPill />}</td>
                    <td className="px-4 py-2.5 text-[12.5px] tabular-nums text-text-tertiary">
                      {formatAdminDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <RoleActionButton
                        user={u}
                        isSelf={u.publicId === currentUser?.publicId}
                        pending={pending}
                        onAction={(action) => setTarget({ user: u, action })}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {data && (
        <Pager page={data.page} total={data.total} pageSize={data.pageSize} onPage={setPage} noun="user" />
      )}

      <ConfirmModal
        open={target !== null}
        onOpenChange={(open) => !open && setTarget(null)}
        title={target?.action === "promote" ? "Grant super-admin role" : "Revoke super-admin role"}
        description={
          target?.action === "promote"
            ? `Grant super admin to ${target?.user.email}? They get full read/write access to every workspace, user, and subscription on the platform.`
            : `Revoke super-admin from ${target?.user.email}? They will lose access to /admin immediately.`
        }
        confirmLabel={target?.action === "promote" ? "Grant" : "Revoke"}
        variant={target?.action === "demote" ? "danger" : "default"}
        loading={pending}
        onConfirm={confirm}
      />
    </div>
  );
}

function SuperAdminPill() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-coffee/15 px-2 py-0.5 text-[11.5px] font-medium text-coffee">
      <ShieldCheck size={11} /> Super admin
    </span>
  );
}

function RoleActionButton({
  user,
  isSelf,
  pending,
  onAction,
}: {
  user: AdminUserRow;
  isSelf: boolean;
  pending: boolean;
  onAction: (action: "promote" | "demote") => void;
}) {
  const base =
    "rounded-lg p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-30";
  if (user.isSuperAdmin) {
    return (
      <button
        type="button"
        disabled={isSelf || pending}
        onClick={() => onAction("demote")}
        title={isSelf ? "You cannot demote yourself" : "Revoke super-admin role"}
        aria-label="Revoke super admin"
        className={cn(base, "text-text-tertiary hover:bg-red/10 hover:text-red")}
      >
        <ShieldOff size={16} />
      </button>
    );
  }
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => onAction("promote")}
      title="Promote to super admin"
      aria-label="Promote to super admin"
      className={cn(base, "text-text-tertiary hover:bg-coffee/10 hover:text-coffee")}
    >
      <ShieldCheck size={16} />
    </button>
  );
}
