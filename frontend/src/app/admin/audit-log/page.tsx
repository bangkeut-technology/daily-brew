"use client";

import { useState } from "react";
import { useAdminAuditLog } from "@/hooks/useAdmin";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Pager } from "@/components/admin/Pager";

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("default", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminAuditLogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminAuditLog({ page });

  return (
    <div className="page-enter">
      <PageHeader title="Audit log" />

      {isLoading || !data ? (
        <p className="text-text-secondary">Loading…</p>
      ) : (
        <>
          <GlassCard hover={false} className="divide-y divide-cream-3/70">
            {data.items.map((row) => (
              <div key={row.publicId} className="flex items-baseline gap-4 px-5 py-3.5">
                <span className="w-32 shrink-0 font-mono text-xs tabular-nums text-text-tertiary">
                  {fmtDateTime(row.createdAt)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary">{row.actionLabel || row.action}</p>
                  <p className="truncate text-sm text-text-tertiary">
                    {(row.actor?.email ?? row.actorEmail ?? "system")}
                    {row.targetLabel ? ` → ${row.targetLabel}` : ""}
                  </p>
                </div>
              </div>
            ))}
            {data.items.length === 0 && (
              <p className="px-5 py-8 text-center text-text-secondary">No audit entries.</p>
            )}
          </GlassCard>
          <Pager page={data.page} total={data.total} pageSize={data.pageSize} onPage={setPage} noun="entry" />
        </>
      )}
    </div>
  );
}
