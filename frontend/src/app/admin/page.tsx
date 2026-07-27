"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Building2,
  CalendarCheck,
  Coffee,
  CreditCard,
  Crown,
  ScrollText,
  TrendingUp,
  UserCircle,
  Users,
} from "lucide-react";
import { useAdminDashboard } from "@/hooks/useAdmin";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { GrowthChart } from "@/components/admin/GrowthChart";
import { Skeleton } from "@/components/admin/AdminDataStates";
import { cn } from "@/lib/utils";
import { formatAdminDate } from "@/lib/adminDate";

export default function AdminDashboardPage() {
  const { data, isLoading, error, refetch, isFetching } = useAdminDashboard();

  return (
    <div className="page-enter">
      <PageHeader title="Admin dashboard" />
      <p className="-mt-2 mb-5 text-[15px] text-text-secondary">
        Platform-wide totals across all workspaces. Visible only to staff with super-admin role.
      </p>

      {isLoading && <DashboardSkeleton />}

      {error && (
        <GlassCard hover={false}>
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <p className="text-sm text-red">Failed to load admin data.</p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-lg border border-cream-3 bg-glass-bg px-3 py-1.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-cream-3/40 disabled:opacity-40"
            >
              {isFetching ? "Retrying…" : "Try again"}
            </button>
          </div>
        </GlassCard>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <StatTile label="Users" value={data.totals.users} icon={UserCircle} accent="from-blue to-blue/70" />
            <StatTile label="Workspaces" value={data.totals.workspaces} icon={Building2} accent="from-coffee to-amber" />
            <StatTile label="Employees" value={data.totals.employees} icon={Users} accent="from-amber to-amber-light" />
            <StatTile label="Attendances" value={data.totals.attendances} icon={CalendarCheck} accent="from-green to-amber" />
            <StatTile label="Subscriptions" value={data.totals.subscriptions} icon={CreditCard} accent="from-green to-green/70" />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <GlassCard hover={false}>
              <div className="px-5 py-4">
                <SectionLabel icon={Coffee}>Active plans</SectionLabel>
                <div className="space-y-2.5">
                  <PlanRow label="Free" count={data.byPlan.free} total={data.totals.workspaces} color="bg-text-tertiary" />
                  <PlanRow label="Espresso" count={data.byPlan.espresso} total={data.totals.workspaces} color="bg-amber" icon={Coffee} />
                  <PlanRow
                    label="Double Espresso"
                    count={data.byPlan.double_espresso}
                    total={data.totals.workspaces}
                    color="bg-coffee"
                    icon={Crown}
                  />
                </div>
                <p className="mt-3 text-[11.5px] leading-snug text-text-tertiary">
                  Paid counts include only <span className="font-medium">active</span> and{" "}
                  <span className="font-medium">trialing</span> subscriptions. Canceled, paused, and
                  past-due fall back to Free.
                </p>
              </div>
            </GlassCard>

            <GlassCard hover={false}>
              <div className="px-5 py-4">
                <SectionLabel icon={TrendingUp}>Growth</SectionLabel>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <GrowthCell label="New users · 7d" value={data.growth.usersLast7d} />
                  <GrowthCell label="New workspaces · 7d" value={data.growth.workspacesLast7d} />
                  <GrowthCell label="New employees · 7d" value={data.growth.employeesLast7d} />
                  <GrowthCell label="Attendances · 7d" value={data.growth.attendancesLast7d} />
                  <GrowthCell label="New users · 30d" value={data.growth.usersLast30d} />
                  <GrowthCell label="New workspaces · 30d" value={data.growth.workspacesLast30d} />
                  <GrowthCell label="New employees · 30d" value={data.growth.employeesLast30d} />
                  <GrowthCell label="Attendances · 30d" value={data.growth.attendancesLast30d} />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Activation funnel — signups say nothing about whether a workspace
              ever got off the ground. Each step is a subset of the one above. */}
          <GlassCard hover={false} className="mt-4">
            <div className="px-5 py-4">
              <SectionLabel icon={Activity}>Activation</SectionLabel>
              <div className="space-y-2.5">
                <FunnelRow
                  label="Workspaces created"
                  count={data.activation.workspacesTotal}
                  total={data.activation.workspacesTotal}
                  color="bg-text-tertiary"
                />
                <FunnelRow
                  label="Added an employee"
                  count={data.activation.workspacesWithEmployees}
                  total={data.activation.workspacesTotal}
                  color="bg-blue"
                />
                <FunnelRow
                  label="Recorded a check-in"
                  count={data.activation.workspacesWithAttendance}
                  total={data.activation.workspacesTotal}
                  color="bg-amber"
                />
                <FunnelRow
                  label="Active in the last 7 days"
                  count={data.activation.workspacesActiveLast7d}
                  total={data.activation.workspacesTotal}
                  color="bg-green"
                />
              </div>
              <p className="mt-3 text-[11.5px] leading-snug text-text-tertiary">
                Percentages are of all live workspaces. Deleted workspaces are excluded, and voided
                attendance doesn&apos;t count as a check-in.
              </p>
            </div>
          </GlassCard>

          <div className="mt-4">
            <GrowthChart series={data.growthSeries} />
          </div>

          <GlassCard hover={false} className="mt-4">
            <div className="px-5 py-4">
              <SectionLabel icon={CreditCard}>Subscription status</SectionLabel>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                <StatusCell label="Active" value={data.byStatus.active} variant="green" />
                <StatusCell label="Trialing" value={data.byStatus.trialing} variant="blue" />
                <StatusCell label="Past due" value={data.byStatus.past_due} variant="red" />
                <StatusCell label="Paused" value={data.byStatus.paused} variant="amber" />
                <StatusCell label="Canceled" value={data.byStatus.canceled} variant="gray" />
              </div>
            </div>
          </GlassCard>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <GlassCard hover={false}>
              <ListHeader icon={ScrollText} label="Recent admin actions" href="/admin/audit-log" linkLabel="Audit log" />
              <div className="px-5 pb-4">
                {data.recentActivity.length === 0 ? (
                  <EmptyHint>No actions yet.</EmptyHint>
                ) : (
                  <ul className="space-y-2.5">
                    {data.recentActivity.map((a) => (
                      <li key={a.publicId} className="flex items-start gap-2 text-[13.5px]">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-coffee" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-text-primary">
                            <span className="font-medium">{a.actionLabel}</span>
                            {a.targetLabel && <span className="text-text-secondary"> · {a.targetLabel}</span>}
                          </div>
                          <div className="text-xs tabular-nums text-text-tertiary">
                            {a.actorEmail ?? "system"} · {formatRelative(a.createdAt)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </GlassCard>

            <GlassCard hover={false}>
              <ListHeader icon={UserCircle} label="Recent signups" href="/admin/users" linkLabel="All users" />
              <div className="px-5 pb-4">
                {data.recentSignups.length === 0 ? (
                  <EmptyHint>No users yet.</EmptyHint>
                ) : (
                  <ul className="space-y-2.5">
                    {data.recentSignups.map((u) => (
                      <li key={u.publicId} className="flex items-start gap-2 text-[13.5px]">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-blue" />
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/admin/users/${u.publicId}`}
                            className="block truncate text-text-primary no-underline hover:text-coffee"
                          >
                            {u.fullName.trim() || u.email}
                          </Link>
                          <div className="text-xs tabular-nums text-text-tertiary">
                            {formatRelative(u.createdAt)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </GlassCard>

            <GlassCard hover={false}>
              <ListHeader icon={Building2} label="Recent workspaces" href="/admin/workspaces" linkLabel="All workspaces" />
              <div className="px-5 pb-4">
                {data.recentWorkspaces.length === 0 ? (
                  <EmptyHint>No workspaces yet.</EmptyHint>
                ) : (
                  <ul className="space-y-2.5">
                    {data.recentWorkspaces.map((w) => (
                      <li key={w.publicId} className="flex items-start gap-2 text-[13.5px]">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber" />
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/admin/workspaces/${w.publicId}`}
                            className="block truncate text-text-primary no-underline hover:text-coffee"
                          >
                            {w.name}
                          </Link>
                          <div className="text-xs tabular-nums text-text-tertiary">
                            {w.owner?.email ?? "no owner"} · {formatRelative(w.createdAt)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}

type IconType = ComponentType<{ size?: number; className?: string }>;

function SectionLabel({ icon: Icon, children }: { icon: IconType; children: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-text-tertiary">
      <Icon size={14} />
      <span className="text-[12.5px] font-medium uppercase tracking-wide">{children}</span>
    </div>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
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
          <p className="text-[28px] font-semibold tabular-nums text-text-primary">
            {value.toLocaleString()}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

function PlanRow({
  label,
  count,
  total,
  color,
  icon: Icon,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  icon?: IconType;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[13.5px]">
        <span className="flex items-center gap-1.5 text-text-secondary">
          {Icon && <Icon size={12} className="opacity-70" />}
          {label}
        </span>
        <span className="tabular-nums text-text-primary">
          <span className="font-semibold">{count.toLocaleString()}</span>
          <span className="text-text-tertiary"> · {pct}%</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-cream-3">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/**
 * One step of the activation funnel: absolute count, share of all live
 * workspaces, and a bar so the drop-off between steps is visible at a glance.
 */
function FunnelRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[13.5px]">
        <span className="text-text-secondary">{label}</span>
        <span className="tabular-nums text-text-primary">
          <span className="font-semibold">{count.toLocaleString()}</span>
          <span className="text-text-tertiary"> · {pct}%</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-cream-3">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function GrowthCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-cream-3/40 px-3 py-2.5">
      <div className="text-[11.5px] uppercase tracking-wide text-text-tertiary">{label}</div>
      <div className="mt-0.5 text-[22px] font-semibold leading-tight tabular-nums text-text-primary">
        {value > 0 ? "+" : ""}
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function StatusCell({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "green" | "blue" | "red" | "amber" | "gray";
}) {
  const dotClass = {
    green: "bg-green",
    blue: "bg-blue",
    red: "bg-red",
    amber: "bg-amber",
    gray: "bg-text-tertiary",
  }[variant];
  return (
    <div className="rounded-xl bg-cream-3/40 px-3 py-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-text-tertiary">
        <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />
        {label}
      </div>
      <div className="text-[20px] font-semibold leading-tight tabular-nums text-text-primary">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function ListHeader({
  icon: Icon,
  label,
  href,
  linkLabel,
}: {
  icon: IconType;
  label: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-center justify-between px-5 pb-3 pt-4">
      <div className="flex items-center gap-2 text-text-tertiary">
        <Icon size={14} />
        <span className="text-[12.5px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <Link href={href} className="flex items-center gap-1 text-xs text-coffee no-underline hover:text-coffee-light">
        {linkLabel}
        <ArrowRight size={11} />
      </Link>
    </div>
  );
}

function EmptyHint({ children }: { children: string }) {
  return <p className="py-2 text-[13px] text-text-tertiary">{children}</p>;
}

/**
 * Mirrors the real layout (5 stat cards, two half-width panels, the chart, the
 * status strip, three list cards) so the page doesn't reflow when data lands.
 */
function DashboardSkeleton() {
  return (
    <div aria-busy="true">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <GlassCard key={i} hover={false}>
            <div className="space-y-3 px-5 pb-4 pt-5">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-7 w-2/3" />
            </div>
          </GlassCard>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <GlassCard key={i} hover={false}>
            <div className="space-y-3 px-5 py-4">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </GlassCard>
        ))}
      </div>
      <GlassCard hover={false} className="mt-4">
        <div className="space-y-3 px-5 py-4">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-[220px]" />
        </div>
      </GlassCard>
      <GlassCard hover={false} className="mt-4">
        <div className="space-y-3 px-5 py-4">
          <Skeleton className="h-3 w-1/5" />
          <Skeleton className="h-12" />
        </div>
      </GlassCard>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <GlassCard key={i} hover={false}>
            <div className="space-y-3 px-5 py-4">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diffSec = (Date.now() - d.getTime()) / 1000;
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)}d ago`;
  return formatAdminDate(iso);
}
