"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useAdminWorkspaces, useRestoreWorkspace } from "@/hooks/useAdmin";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { AdminWorkspaceRow } from "@/types/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { PlanBadge } from "@/components/shared/PlanBadge";
import { SubscriptionStatusBadge } from "@/components/shared/SubscriptionStatusBadge";
import { TestingTrackBadge } from "@/components/shared/TestingTrackBadge";
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

export default function AdminWorkspacesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const debouncedSearch = useDebouncedValue(search);
  const { data, isLoading } = useAdminWorkspaces({
    page,
    search: debouncedSearch || undefined,
    includeDeleted: includeDeleted || undefined,
  });
  const restore = useRestoreWorkspace();
  const [target, setTarget] = useState<AdminWorkspaceRow | null>(null);

  const workspaces = data?.items ?? [];
  const isEmpty = !isLoading && workspaces.length === 0;

  const emptyProps = {
    icon: Building2,
    title: debouncedSearch ? "No workspaces match this search" : "No workspaces yet",
    hint: debouncedSearch ? "Search matches workspace name and owner email." : undefined,
  };

  return (
    <div className="page-enter">
      <PageHeader title="Workspaces" />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <AdminSearchInput
          id="admin-workspace-search"
          label="Search workspaces"
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by name or owner email…"
          className="flex-1 sm:max-w-sm"
        />
        <div className="flex items-center gap-3">
          <label htmlFor="admin-workspaces-deleted" className="text-[13px] text-text-secondary">
            Include deleted
          </label>
          <Toggle
            id="admin-workspaces-deleted"
            checked={includeDeleted}
            onChange={(v) => {
              setIncludeDeleted(v);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Phones get cards — an 8-column table only ever shows its first two
          columns on a 390px screen. */}
      <div className="md:hidden">
        {isLoading && <CardSkeletonList />}
        {isEmpty && (
          <GlassCard hover={false}>
            <AdminEmpty {...emptyProps} />
          </GlassCard>
        )}
        {!isLoading && workspaces.length > 0 && (
          <div className="space-y-2">
            {workspaces.map((ws) => (
              <MobileCard key={ws.publicId} className={cn(ws.deletedAt && "opacity-60")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/workspaces/${ws.publicId}`}
                      className="block truncate text-[14.5px] font-medium text-text-primary no-underline hover:text-coffee"
                    >
                      {ws.name || "(unnamed)"}
                    </Link>
                    <p className="truncate text-[12.5px] text-text-tertiary">
                      {ws.owner?.email ?? "no owner"}
                    </p>
                  </div>
                  {ws.deletedAt && (
                    <button
                      type="button"
                      onClick={() => setTarget(ws)}
                      aria-label={`Restore ${ws.name}`}
                      title="Restore workspace"
                      className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-coffee/10 hover:text-coffee"
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <PlanBadge plan={ws.plan} />
                  <SubscriptionStatusBadge status={ws.subscriptionStatus} />
                  <TestingTrackBadge track={ws.testingTrack} />
                  {ws.deletedAt && (
                    <span className="rounded-full bg-red/12 px-2 py-0.5 text-[11.5px] font-medium text-red">
                      Deleted
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  <MobileField label="Employees">{ws.employeeCount}</MobileField>
                  <MobileField label="Created">
                    {new Date(ws.createdAt).toLocaleDateString()}
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
                <th className="px-4 py-2.5 text-left font-medium">Name</th>
                <th className="px-4 py-2.5 text-left font-medium">Owner</th>
                <th className="px-4 py-2.5 text-left font-medium">Plan</th>
                <th className="px-4 py-2.5 text-left font-medium">Track</th>
                <th className="px-4 py-2.5 text-left font-medium">Status</th>
                <th className="px-4 py-2.5 text-right font-medium">Employees</th>
                <th className="px-4 py-2.5 text-left font-medium">Created</th>
                <th className="w-10 px-4 py-2.5 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <TableSkeletonRows cols={8} />}
              {isEmpty && <TableEmptyRow colSpan={8} {...emptyProps} />}
              {!isLoading &&
                workspaces.map((ws) => (
                  <tr
                    key={ws.publicId}
                    className={cn(
                      "border-t border-cream-3/60 transition-colors hover:bg-cream-3/20",
                      ws.deletedAt && "opacity-60",
                    )}
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/admin/workspaces/${ws.publicId}`}
                        className="font-medium text-text-primary no-underline hover:text-coffee"
                      >
                        {ws.name || "(unnamed)"}
                      </Link>
                      {ws.deletedAt && <span className="ml-2 text-[11px] text-red">deleted</span>}
                    </td>
                    <td className="px-4 py-2.5 text-text-secondary">
                      {ws.owner ? <span title={ws.owner.fullName}>{ws.owner.email}</span> : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <PlanBadge plan={ws.plan} />
                    </td>
                    <td className="px-4 py-2.5">
                      <TestingTrackBadge track={ws.testingTrack} />
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <SubscriptionStatusBadge status={ws.subscriptionStatus} />
                        {ws.isTrialing && <span className="text-[11.5px] text-amber">trial</span>}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{ws.employeeCount}</td>
                    <td className="px-4 py-2.5 text-[12.5px] tabular-nums text-text-tertiary">
                      {new Date(ws.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {ws.deletedAt && (
                        <button
                          type="button"
                          onClick={() => setTarget(ws)}
                          aria-label={`Restore ${ws.name}`}
                          title="Restore workspace"
                          className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-coffee/10 hover:text-coffee"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {data && (
        <Pager
          page={data.page}
          total={data.total}
          pageSize={data.pageSize}
          onPage={setPage}
          noun="workspace"
        />
      )}

      <ConfirmModal
        open={target !== null}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Restore workspace"
        description={`Restore ${target?.name ?? "this workspace"}? Employees soft-deleted with the workspace are reactivated, but their user links were severed at delete time and must be re-linked by the owner.`}
        confirmLabel="Restore"
        loading={restore.isPending}
        onConfirm={() => {
          if (!target) return;
          const name = target.name || "(unnamed)";
          restore.mutate(target.publicId, {
            onSuccess: (result) => {
              toast.success(`${name} restored — ${result.restoredEmployees} employee(s) reactivated`);
              setTarget(null);
            },
            onError: () => toast.error("Could not restore workspace"),
          });
        }}
      />
    </div>
  );
}
