"use client";

import { useState } from "react";
import Link from "next/link";
import { ScrollText } from "lucide-react";
import { useAdminAuditLog } from "@/hooks/useAdmin";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { Pager } from "@/components/admin/Pager";
import {
  AdminEmpty,
  CardSkeletonList,
  MobileCard,
  STICKY_HEAD,
  TABLE_SCROLL,
  TableEmptyRow,
  TableSkeletonRows,
} from "@/components/admin/AdminDataStates";
import { cn } from "@/lib/utils";
import { formatAdminDateTime } from "@/lib/adminDate";

// Fallback vocabulary for deployments where the API doesn't ship filter
// options yet; the response's own lists win when present.
const FALLBACK_ACTIONS = [
  { value: "promote_user", label: "Promoted user" },
  { value: "demote_user", label: "Demoted user" },
  { value: "cancel_subscription", label: "Canceled subscription" },
  { value: "restore_workspace", label: "Restored workspace" },
  { value: "update_mobile_app_config", label: "Updated mobile app config" },
  { value: "update_workspace_testing_track", label: "Updated workspace testing track" },
  { value: "update_workspace_plan", label: "Updated workspace plan" },
];

const FALLBACK_TARGET_TYPES = [
  { value: "user", label: "User" },
  { value: "workspace", label: "Workspace" },
  { value: "subscription", label: "Subscription" },
  { value: "mobile_app_config", label: "Mobile app config" },
];

export default function AdminAuditLogPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const { data, isLoading } = useAdminAuditLog({
    page,
    action: action || undefined,
    targetType: targetType || undefined,
  });

  const rows = data?.items ?? [];
  const isEmpty = !isLoading && rows.length === 0;

  const actionOptions = [
    { value: "", label: "All actions" },
    ...(data?.actions ?? FALLBACK_ACTIONS),
  ];
  const targetTypeOptions = [
    { value: "", label: "All targets" },
    ...(data?.targetTypes ?? FALLBACK_TARGET_TYPES),
  ];

  const emptyProps = {
    icon: ScrollText,
    title: action || targetType ? "No events match these filters" : "No audit events yet",
    hint:
      action || targetType
        ? "Clear a filter to see the full history."
        : "Every promote, demote, cancel, restore, and config change lands here.",
  };

  return (
    <div className="page-enter">
      <PageHeader title="Audit log" />
      <p className="-mt-2 mb-4 text-sm text-text-secondary">
        Append-only history of every admin action. Used for accountability and incident
        investigation.
      </p>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="w-56">
          <CustomSelect
            id="admin-audit-action"
            value={action}
            onChange={(v) => {
              setAction(v);
              setPage(1);
            }}
            options={actionOptions}
          />
        </div>
        <div className="w-48">
          <CustomSelect
            id="admin-audit-target"
            value={targetType}
            onChange={(v) => {
              setTargetType(v);
              setPage(1);
            }}
            options={targetTypeOptions}
          />
        </div>
      </div>

      <div className="md:hidden">
        {isLoading && <CardSkeletonList />}
        {isEmpty && (
          <GlassCard hover={false}>
            <AdminEmpty {...emptyProps} />
          </GlassCard>
        )}
        {!isLoading && rows.length > 0 && (
          <div className="space-y-2">
            {rows.map((row) => (
              <MobileCard key={row.publicId}>
                <div className="flex items-start justify-between gap-2">
                  <ActionBadge action={row.action} label={row.actionLabel} />
                  <span className="whitespace-nowrap text-[11.5px] tabular-nums text-text-tertiary">
                    {formatAdminDateTime(row.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-[13.5px] text-text-primary">
                  <TargetLink type={row.targetType} publicId={row.targetPublicId} label={row.targetLabel} />
                </p>
                <p className="truncate text-xs text-text-tertiary">
                  by {row.actor?.email ?? row.actorEmail ?? "deleted user"}
                </p>
                <MetadataChips metadata={row.metadata} className="mt-2" />
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
                <th className="px-4 py-2.5 text-left font-medium">When</th>
                <th className="px-4 py-2.5 text-left font-medium">Actor</th>
                <th className="px-4 py-2.5 text-left font-medium">Action</th>
                <th className="px-4 py-2.5 text-left font-medium">Target</th>
                <th className="px-4 py-2.5 text-left font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <TableSkeletonRows cols={5} rows={10} />}
              {isEmpty && <TableEmptyRow colSpan={5} {...emptyProps} />}
              {!isLoading &&
                rows.map((row) => (
                  <tr
                    key={row.publicId}
                    className="border-t border-cream-3/60 transition-colors hover:bg-cream-3/20"
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 text-[12.5px] tabular-nums text-text-tertiary">
                      {formatAdminDateTime(row.createdAt)}
                    </td>
                    <td className="px-4 py-2.5 text-text-secondary">
                      {row.actor ? (
                        <Link
                          href={`/admin/users/${row.actor.publicId}`}
                          className="text-text-primary no-underline hover:text-coffee"
                        >
                          {row.actor.email}
                        </Link>
                      ) : (
                        <span className="italic text-text-tertiary">
                          {row.actorEmail ?? "deleted user"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <ActionBadge action={row.action} label={row.actionLabel} />
                    </td>
                    <td className="px-4 py-2.5 text-text-secondary">
                      <TargetLink
                        type={row.targetType}
                        publicId={row.targetPublicId}
                        label={row.targetLabel}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <MetadataChips metadata={row.metadata} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {data && (
        <Pager page={data.page} total={data.total} pageSize={data.pageSize} onPage={setPage} noun="entry" />
      )}
    </div>
  );
}

function ActionBadge({ action, label }: { action: string; label: string }) {
  const tone = action.startsWith("promote")
    ? "bg-coffee/15 text-coffee"
    : action.startsWith("demote") || action.startsWith("cancel")
      ? "bg-red/10 text-red"
      : action.startsWith("restore")
        ? "bg-green/15 text-green"
        : "bg-cream-3 text-text-secondary";
  return (
    <span className={cn("whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-medium", tone)}>
      {label || action}
    </span>
  );
}

function TargetLink({
  type,
  publicId,
  label,
}: {
  type: string;
  publicId: string | null;
  label: string | null;
}) {
  if (!publicId) return <span className="text-text-tertiary">—</span>;
  if (type === "user" || type === "workspace") {
    return (
      <Link
        href={`/admin/${type === "user" ? "users" : "workspaces"}/${publicId}`}
        className="text-text-primary no-underline hover:text-coffee"
      >
        {label ?? publicId}
      </Link>
    );
  }
  return <span>{label ?? publicId}</span>;
}

/**
 * Metadata is free-form JSON per action (`{from: 'free', to: 'espresso'}`).
 * Chips keep the key/value boundary readable at this size.
 */
function MetadataChips({
  metadata,
  className,
}: {
  metadata: Record<string, unknown> | null;
  className?: string;
}) {
  const entries = Object.entries(metadata ?? {});
  if (entries.length === 0) return <span className="text-text-tertiary">—</span>;
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {entries.map(([k, v]) => (
        <span
          key={k}
          className="inline-flex items-center gap-1 rounded-md bg-cream-3/60 px-1.5 py-0.5 text-[11.5px]"
        >
          <span className="text-text-tertiary">{k}</span>
          <span className="font-mono text-text-secondary">{String(v)}</span>
        </span>
      ))}
    </div>
  );
}
