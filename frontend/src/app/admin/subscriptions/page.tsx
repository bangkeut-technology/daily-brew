"use client";

import { useState } from "react";
import { useAdminSubscriptions } from "@/hooks/useAdmin";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Pager } from "@/components/admin/Pager";

const PLAN: Record<string, string> = {
  free: "Free",
  espresso: "Espresso",
  double_espresso: "Double Espresso",
};

const STATUS_VARIANT: Record<string, "green" | "amber" | "red" | "gray"> = {
  active: "green",
  trialing: "amber",
  past_due: "red",
  paused: "amber",
  canceled: "gray",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminSubscriptionsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminSubscriptions({ page });

  return (
    <div className="page-enter">
      <PageHeader title="Subscriptions" />

      {isLoading || !data ? (
        <p className="text-text-secondary">Loading…</p>
      ) : (
        <>
          <GlassCard hover={false} className="divide-y divide-cream-3/70">
            {data.items.map((sub) => (
              <div key={sub.publicId} className="flex items-center gap-4 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-text-primary">{sub.workspace.name}</p>
                  <p className="truncate text-sm text-text-tertiary">{sub.owner?.email ?? "—"}</p>
                </div>
                <StatusBadge label={PLAN[sub.plan] ?? sub.plan} variant={sub.plan === "free" ? "gray" : "green"} />
                <StatusBadge label={sub.status.replace("_", " ")} variant={STATUS_VARIANT[sub.status] ?? "gray"} />
                <span className="hidden w-32 text-right text-sm text-text-tertiary sm:block">
                  {sub.isTrialing && sub.trialDaysRemaining != null
                    ? `${sub.trialDaysRemaining}d trial left`
                    : `ends ${fmtDate(sub.currentPeriodEnd)}`}
                </span>
              </div>
            ))}
            {data.items.length === 0 && (
              <p className="px-5 py-8 text-center text-text-secondary">No subscriptions.</p>
            )}
          </GlassCard>
          <Pager page={data.page} total={data.total} pageSize={data.pageSize} onPage={setPage} noun="subscription" />
        </>
      )}
    </div>
  );
}
