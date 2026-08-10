"use client";

import { useState, type ComponentType } from "react";
import Link from "next/link";
import { Building2, Clock, CreditCard, MoonStar, TrendingDown, UserMinus } from "lucide-react";
import { useAdminChurn } from "@/hooks/useAdmin";
import type { AdminChurnEvent } from "@/types/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { PlanBadge } from "@/components/shared/PlanBadge";
import { ChurnChart } from "@/components/admin/ChurnChart";
import { Pager } from "@/components/admin/Pager";
import {
  AdminEmpty,
  CardSkeletonList,
  MobileCard,
  MobileField,
  Skeleton,
  STICKY_HEAD,
  TABLE_SCROLL,
  TableEmptyRow,
  TableSkeletonRows,
} from "@/components/admin/AdminDataStates";
import { cn } from "@/lib/utils";
import { formatAdminDate } from "@/lib/adminDate";

// Must match AdminChurnService::WINDOW_OPTIONS — anything else falls back to 90.
const WINDOW_OPTIONS = [
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last 12 months" },
];

export default function AdminChurnPage() {
  const [days, setDays] = useState("90");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminChurn({ days: Number(days), page });

  const summary = data?.summary;
  const events = data?.events.items ?? [];
  const isEmpty = !isLoading && events.length === 0;
  const windowLabel = WINDOW_OPTIONS.find((o) => o.value === days)?.label.toLowerCase() ?? "";

  const emptyProps = {
    icon: TrendingDown,
    title: "No churn in this window",
    hint: "Nobody canceled a paid plan or deleted a workspace. Widen the window to see further back.",
  };

  return (
    <div className="page-enter">
      <PageHeader title="Churn" />
      <p className="-mt-2 mb-5 text-[15px] text-text-secondary">
        Paid plans that stopped paying, workspaces that were deleted, and the paying accounts that
        have gone quiet.
      </p>

      <div className="mb-5 w-48">
        <CustomSelect
          id="admin-churn-window"
          value={days}
          onChange={(v) => {
            setDays(v);
            setPage(1);
          }}
          options={WINDOW_OPTIONS}
        />
      </div>

      {isLoading && !summary && <ChurnSkeleton />}

      {summary && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Tile
              label="Paid churn rate"
              value={`${summary.paidChurnRate}%`}
              hint={`${summary.paidChurned.toLocaleString()} of ${(summary.livePaid + summary.paidChurned).toLocaleString()} paid workspaces`}
              icon={TrendingDown}
              accent="from-red to-amber"
            />
            <Tile
              label="Paid cancellations"
              value={summary.paidChurned.toLocaleString()}
              hint={`${summary.paidChurnedLast30d.toLocaleString()} in the last 30 days`}
              icon={CreditCard}
              accent="from-amber to-amber-light"
            />
            <Tile
              label="Workspaces deleted"
              value={summary.workspacesDeleted.toLocaleString()}
              hint={`${summary.workspaceChurnRate}% of all workspaces`}
              icon={UserMinus}
              accent="from-coffee to-amber"
            />
            <Tile
              label="Avg lifetime"
              value={summary.avgLifetimeDays === null ? "—" : `${summary.avgLifetimeDays}d`}
              hint="Signup to churn, this window"
              icon={Clock}
              accent="from-blue to-blue/70"
            />
          </div>

          <p className="mt-3 text-[11.5px] leading-snug text-text-tertiary">
            Rates are churned ÷ (churned + still live) over the {windowLabel}. Deleting a workspace
            also cancels its subscription, so a deleted paid account counts once in each rate — the
            timeline below shows it as a single deletion.
          </p>

          <div className="mt-4">
            <ChurnChart series={data.series} />
          </div>

          <GlassCard hover={false} className="mt-4">
            <div className="px-5 py-4">
              <div className="mb-3 flex items-center gap-2 text-text-tertiary">
                <MoonStar size={14} />
                <span className="text-[12.5px] font-medium uppercase tracking-wide">
                  At risk · paid and quiet
                </span>
              </div>
              {data.dormant.length === 0 ? (
                <p className="py-2 text-[13px] text-text-tertiary">
                  Every paying workspace has recorded a check-in in the last {data.dormantAfterDays}{" "}
                  days.
                </p>
              ) : (
                <ul className="space-y-2">
                  {data.dormant.map((w) => (
                    <li
                      key={w.publicId}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-cream-3/40 px-3 py-2.5"
                    >
                      <Link
                        href={`/admin/workspaces/${w.publicId}`}
                        className="text-[14px] font-medium text-text-primary no-underline hover:text-coffee"
                      >
                        {w.name || "(unnamed)"}
                      </Link>
                      <PlanBadge plan={w.plan} />
                      <span className="text-[12.5px] text-text-tertiary">{w.ownerEmail ?? "—"}</span>
                      <span className="ml-auto text-[12.5px] tabular-nums text-red">
                        quiet {w.daysQuiet}d · last check-in {formatAdminDate(w.lastActivity)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-[11.5px] leading-snug text-text-tertiary">
                Paying workspaces with no check-in for {data.dormantAfterDays}+ days. Workspaces that
                never recorded one are excluded — that&apos;s activation, not churn.
              </p>
            </div>
          </GlassCard>

          <h2 className="mb-3 mt-6 font-serif text-lg font-semibold text-text-primary">Timeline</h2>

          <div className="md:hidden">
            {isLoading && <CardSkeletonList />}
            {isEmpty && (
              <GlassCard hover={false}>
                <AdminEmpty {...emptyProps} />
              </GlassCard>
            )}
            {!isLoading && events.length > 0 && (
              <div className="space-y-2">
                {events.map((event) => (
                  <MobileCard key={event.id}>
                    <Link
                      href={`/admin/workspaces/${event.workspace.publicId}`}
                      className="block truncate text-[14.5px] font-medium text-text-primary no-underline hover:text-coffee"
                    >
                      {event.workspace.name || "(unnamed)"}
                    </Link>
                    <p className="truncate text-[12.5px] text-text-tertiary">
                      {event.owner?.email ?? "—"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <EventBadge type={event.type} />
                      {event.plan && <PlanBadge plan={event.plan} />}
                    </div>
                    <div className="mt-2 space-y-1">
                      <MobileField label="When">{formatAdminDate(event.occurredAt)}</MobileField>
                      <MobileField label="Lifetime">{event.lifetimeDays}d</MobileField>
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
                    <th className="px-4 py-2.5 text-left font-medium">What happened</th>
                    <th className="px-4 py-2.5 text-left font-medium">Plan</th>
                    <th className="px-4 py-2.5 text-left font-medium">Lifetime</th>
                    <th className="px-4 py-2.5 text-left font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && <TableSkeletonRows cols={6} />}
                  {isEmpty && <TableEmptyRow colSpan={6} {...emptyProps} />}
                  {!isLoading &&
                    events.map((event) => (
                      <tr
                        key={event.id}
                        className="border-t border-cream-3/60 transition-colors hover:bg-cream-3/20"
                      >
                        <td className="px-4 py-2.5">
                          <Link
                            href={`/admin/workspaces/${event.workspace.publicId}`}
                            className="font-medium text-text-primary no-underline hover:text-coffee"
                          >
                            {event.workspace.name || "(unnamed)"}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5 text-text-secondary">
                          {event.owner?.email ?? "—"}
                        </td>
                        <td className="px-4 py-2.5">
                          <EventBadge type={event.type} />
                        </td>
                        <td className="px-4 py-2.5">
                          {event.plan ? (
                            <PlanBadge plan={event.plan} />
                          ) : (
                            <span className="text-text-tertiary">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 tabular-nums text-text-secondary">
                          {event.lifetimeDays}d
                        </td>
                        <td className="px-4 py-2.5 text-[12.5px] tabular-nums text-text-tertiary">
                          {formatAdminDate(event.occurredAt)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {data && (
            <Pager
              page={data.events.page}
              total={data.events.total}
              pageSize={data.events.pageSize}
              onPage={setPage}
              noun="churn event"
            />
          )}
        </>
      )}
    </div>
  );
}

type IconType = ComponentType<{ size?: number; className?: string }>;

function Tile({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  icon: IconType;
  accent: string;
}) {
  return (
    <GlassCard>
      <div className="relative">
        <div className={cn("absolute left-0 right-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r", accent)} />
        <div className="px-5 pb-4 pt-5">
          <div className="mb-2 flex items-center gap-2 text-text-tertiary">
            <Icon size={14} />
            <span className="text-[12.5px] font-medium uppercase tracking-wide">{label}</span>
          </div>
          <p className="text-[28px] font-semibold tabular-nums text-text-primary">{value}</p>
          <p className="mt-1 text-[11.5px] leading-snug text-text-tertiary">{hint}</p>
        </div>
      </div>
    </GlassCard>
  );
}

function EventBadge({ type }: { type: AdminChurnEvent["type"] }) {
  const isDeletion = type === "workspace_deleted";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-medium",
        isDeletion ? "bg-red/12 text-red" : "bg-amber/15 text-amber",
      )}
    >
      {isDeletion ? <Building2 size={11} /> : <CreditCard size={11} />}
      {isDeletion ? "Workspace deleted" : "Subscription canceled"}
    </span>
  );
}

/** Mirrors the real layout (4 tiles, chart, at-risk card, table) so nothing reflows. */
function ChurnSkeleton() {
  return (
    <div aria-busy="true">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassCard key={i} hover={false}>
            <div className="space-y-3 px-5 pb-4 pt-5">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </GlassCard>
        ))}
      </div>
      <GlassCard hover={false} className="mt-4">
        <div className="space-y-3 px-5 py-4">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-[180px]" />
        </div>
      </GlassCard>
      <GlassCard hover={false} className="mt-4">
        <div className="space-y-3 px-5 py-4">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      </GlassCard>
      <GlassCard hover={false} className="mt-4">
        <div className="space-y-3 px-5 py-4">
          <Skeleton className="h-3 w-1/5" />
          <Skeleton className="h-32" />
        </div>
      </GlassCard>
    </div>
  );
}
