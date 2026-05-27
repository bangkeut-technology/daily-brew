"use client";

import { useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useAdminWorkspaces, useRestoreWorkspace } from "@/hooks/useAdmin";
import type { AdminWorkspaceRow } from "@/types/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Toggle } from "@/components/shared/Toggle";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { Pager } from "@/components/admin/Pager";

const PLAN: Record<string, string> = {
  free: "Free",
  espresso: "Espresso",
  double_espresso: "Double Espresso",
};

export default function AdminWorkspacesPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const { data, isLoading } = useAdminWorkspaces({ page, q: q || undefined, includeDeleted });
  const restore = useRestoreWorkspace();
  const [target, setTarget] = useState<AdminWorkspaceRow | null>(null);

  return (
    <div className="page-enter">
      <PageHeader title="Workspaces" />

      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            id="ws-search"
            name="ws-search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search workspaces or owners"
            className="w-full rounded-lg border border-cream-3 bg-glass-bg py-2 pl-9 pr-3 text-[15px] text-text-primary outline-none focus:border-coffee"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          Show deleted
          <Toggle checked={includeDeleted} onChange={(v) => { setIncludeDeleted(v); setPage(1); }} />
        </label>
      </div>

      {isLoading || !data ? (
        <p className="text-text-secondary">Loading…</p>
      ) : (
        <>
          <GlassCard hover={false} className="divide-y divide-cream-3/70">
            {data.items.map((ws) => (
              <div key={ws.publicId} className="flex items-center gap-4 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-text-primary">{ws.name}</p>
                  <p className="truncate text-sm text-text-tertiary">
                    {ws.owner?.email ?? "no owner"} · {ws.employeeCount} staff
                  </p>
                </div>
                <StatusBadge label={PLAN[ws.plan] ?? ws.plan} variant={ws.plan === "free" ? "gray" : "green"} />
                {ws.isTrialing && <StatusBadge label="Trial" variant="amber" />}
                {ws.deletedAt ? (
                  <>
                    <StatusBadge label="Deleted" variant="red" />
                    <button
                      type="button"
                      onClick={() => setTarget(ws)}
                      aria-label={`Restore ${ws.name}`}
                      className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-green/10 hover:text-green"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </>
                ) : (
                  <span className="w-9" />
                )}
              </div>
            ))}
            {data.items.length === 0 && (
              <p className="px-5 py-8 text-center text-text-secondary">No workspaces.</p>
            )}
          </GlassCard>
          <Pager page={data.page} total={data.total} pageSize={data.pageSize} onPage={setPage} noun="workspace" />
        </>
      )}

      <ConfirmModal
        open={target !== null}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Restore workspace"
        description={`Restore ${target?.name ?? "this workspace"} and its employees?`}
        confirmLabel="Restore"
        loading={restore.isPending}
        onConfirm={() => {
          if (!target) return;
          restore.mutate(target.publicId, {
            onSuccess: () => toast.success(`${target.name} restored`),
            onError: () => toast.error("Could not restore workspace"),
          });
        }}
      />
    </div>
  );
}
