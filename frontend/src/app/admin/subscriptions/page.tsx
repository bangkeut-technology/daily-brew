"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { useAdminSubscriptions } from "@/hooks/useAdmin";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { PlanBadge } from "@/components/shared/PlanBadge";
import { SubscriptionStatusBadge } from "@/components/shared/SubscriptionStatusBadge";
import { Pager } from "@/components/admin/Pager";
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

// Values must be the serialised `SubscriptionStatusEnum` values — the API
// compares them straight against the stored column.
const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "trialing", label: "Trialing" },
  { value: "past_due", label: "Past due" },
  { value: "paused", label: "Paused" },
  { value: "canceled", label: "Canceled" },
];

const PLAN_OPTIONS = [
  { value: "", label: "All plans" },
  { value: "free", label: "Free" },
  { value: "espresso", label: "Espresso" },
  { value: "double_espresso", label: "Double Espresso" },
];

export default function AdminSubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");
  const { data, isLoading } = useAdminSubscriptions({
    page,
    status: status || undefined,
    plan: plan || undefined,
  });

  const subscriptions = data?.items ?? [];
  const isEmpty = !isLoading && subscriptions.length === 0;

  const emptyProps = {
    icon: CreditCard,
    title: status || plan ? "No subscriptions match these filters" : "No subscriptions yet",
    hint: status || plan ? "Clear a filter to widen the search." : undefined,
  };

  return (
    <div className="page-enter">
      <PageHeader title="Subscriptions" />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="w-44">
          <CustomSelect
            id="admin-subscription-status"
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            options={STATUS_OPTIONS}
          />
        </div>
        <div className="w-48">
          <CustomSelect
            id="admin-subscription-plan"
            value={plan}
            onChange={(v) => {
              setPlan(v);
              setPage(1);
            }}
            options={PLAN_OPTIONS}
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
        {!isLoading &&
          subscriptions.length > 0 && (
            <div className="space-y-2">
              {subscriptions.map((s) => (
                <MobileCard key={s.publicId} className={cn(!s.isActive && "opacity-70")}>
                  <Link
                    href={`/admin/workspaces/${s.workspace.publicId}`}
                    className="block truncate text-[14.5px] font-medium text-text-primary no-underline hover:text-coffee"
                  >
                    {s.workspace.name || "(unnamed)"}
                  </Link>
                  <p className="truncate text-[12.5px] text-text-tertiary">{s.owner?.email ?? "—"}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <PlanBadge plan={s.plan} />
                    <SubscriptionStatusBadge status={s.status} />
                    {s.isTrialing && s.trialDaysRemaining != null && (
                      <span className="text-[11.5px] text-amber">{s.trialDaysRemaining}d left</span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    <MobileField label="Period end">{formatAdminDate(s.currentPeriodEnd)}</MobileField>
                    <MobileField label="Paddle ID">
                      <span className="font-mono text-[11.5px]">{s.paddleSubscriptionId ?? "—"}</span>
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
                <th className="px-4 py-2.5 text-left font-medium">Workspace</th>
                <th className="px-4 py-2.5 text-left font-medium">Owner</th>
                <th className="px-4 py-2.5 text-left font-medium">Plan</th>
                <th className="px-4 py-2.5 text-left font-medium">Status</th>
                <th className="px-4 py-2.5 text-left font-medium">Period end</th>
                <th className="px-4 py-2.5 text-left font-medium">Paddle ID</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <TableSkeletonRows cols={6} />}
              {isEmpty && <TableEmptyRow colSpan={6} {...emptyProps} />}
              {!isLoading &&
                subscriptions.map((s) => (
                  <tr
                    key={s.publicId}
                    className={cn(
                      "border-t border-cream-3/60 transition-colors hover:bg-cream-3/20",
                      !s.isActive && "opacity-70",
                    )}
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/admin/workspaces/${s.workspace.publicId}`}
                        className="font-medium text-text-primary no-underline hover:text-coffee"
                      >
                        {s.workspace.name || "(unnamed)"}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-text-secondary">{s.owner?.email ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      <PlanBadge plan={s.plan} />
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <SubscriptionStatusBadge status={s.status} />
                        {s.isTrialing && s.trialDaysRemaining != null && (
                          <span className="text-[11.5px] text-amber">{s.trialDaysRemaining}d left</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[12.5px] tabular-nums text-text-tertiary">
                      {formatAdminDate(s.currentPeriodEnd)}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11.5px] text-text-tertiary">
                      {s.paddleSubscriptionId ? (
                        <span title={s.paddleSubscriptionId}>
                          {s.paddleSubscriptionId.slice(0, 16)}…
                        </span>
                      ) : (
                        "—"
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
          noun="subscription"
        />
      )}
    </div>
  );
}
