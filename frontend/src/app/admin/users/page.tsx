"use client";

import { useState } from "react";
import { Search, Shield, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { useAdminUsers, usePromoteUser, useDemoteUser } from "@/hooks/useAdmin";
import { useAuth } from "@/providers/auth-provider";
import type { AdminUserRow } from "@/types/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const { data, isLoading } = useAdminUsers({ page, q: q || undefined });
  const promote = usePromoteUser();
  const demote = useDemoteUser();
  const [target, setTarget] = useState<{ user: AdminUserRow; action: "promote" | "demote" } | null>(null);

  const confirm = () => {
    if (!target) return;
    const mutation = target.action === "promote" ? promote : demote;
    mutation.mutate(target.user.publicId, {
      onSuccess: () => toast.success(`${target.user.email} ${target.action}d`),
      onError: () => toast.error("Action failed"),
    });
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="page-enter">
      <PageHeader title="Users" />

      <div className="mb-5 max-w-sm">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            id="user-search"
            name="user-search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search by email or name"
            className="w-full rounded-lg border border-cream-3 bg-glass-bg py-2 pl-9 pr-3 text-[15px] text-text-primary outline-none focus:border-coffee"
          />
        </div>
      </div>

      {isLoading || !data ? (
        <p className="text-text-secondary">Loading…</p>
      ) : (
        <>
          <GlassCard hover={false} className="divide-y divide-cream-3/70">
            {data.items.map((u) => {
              const isSelf = u.publicId === currentUser?.publicId;
              return (
                <div key={u.publicId} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-text-primary">{u.fullName || u.email}</p>
                    <p className="truncate text-sm text-text-tertiary">{u.email}</p>
                  </div>
                  {u.isSuperAdmin && <StatusBadge label="Super admin" variant="green" />}
                  {u.isSuperAdmin ? (
                    <button
                      type="button"
                      disabled={isSelf}
                      onClick={() => setTarget({ user: u, action: "demote" })}
                      title={isSelf ? "You can't demote yourself" : "Demote"}
                      className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-red/10 hover:text-red disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ShieldOff size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setTarget({ user: u, action: "promote" })}
                      title="Promote to super admin"
                      className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-green/10 hover:text-green"
                    >
                      <Shield size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </GlassCard>

          <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
            <span>
              {data.total} user{data.total === 1 ? "" : "s"}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-cream-3 px-3 py-1.5 disabled:opacity-40"
              >
                Prev
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-cream-3 px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        open={target !== null}
        onOpenChange={(open) => !open && setTarget(null)}
        title={target?.action === "promote" ? "Promote to super admin" : "Demote super admin"}
        description={
          target?.action === "promote"
            ? `Give ${target?.user.email} full platform admin access?`
            : `Remove ${target?.user.email}'s platform admin access?`
        }
        confirmLabel={target?.action === "promote" ? "Promote" : "Demote"}
        variant={target?.action === "demote" ? "danger" : "default"}
        loading={promote.isPending || demote.isPending}
        onConfirm={confirm}
      />
    </div>
  );
}
