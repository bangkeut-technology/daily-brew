"use client";

import { Users, Building2, UserCircle, CalendarCheck, CreditCard } from "lucide-react";
import { useAdminDashboard } from "@/hooks/useAdmin";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { GlassCard, GlassCardHeader } from "@/components/shared/GlassCard";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  espresso: "Espresso",
  double_espresso: "Double Espresso",
};

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminDashboard();

  return (
    <div className="page-enter">
      <PageHeader title="Admin dashboard" />

      {isLoading || !data ? (
        <p className="text-text-secondary">Loading…</p>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Users" value={data.totals.users} subtitle="total" accent="#6B4226" icon={<UserCircle size={28} />} />
            <StatCard label="Workspaces" value={data.totals.workspaces} subtitle="total" accent="#C17F3B" icon={<Building2 size={28} />} />
            <StatCard label="Employees" value={data.totals.employees} subtitle="total" accent="#4A7C59" icon={<Users size={28} />} />
            <StatCard label="Attendances" value={data.totals.attendances} subtitle="total" accent="#3B6FA0" icon={<CalendarCheck size={28} />} />
            <StatCard label="Subscriptions" value={data.totals.subscriptions} subtitle="total" accent="#7C5C9B" icon={<CreditCard size={28} />} />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <GlassCard hover={false}>
              <GlassCardHeader title="By plan" />
              <div className="divide-y divide-cream-3/70">
                {Object.entries(data.byPlan).map(([plan, count]) => (
                  <div key={plan} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span className="text-text-secondary">{PLAN_LABELS[plan] ?? plan}</span>
                    <span className="font-mono font-semibold tabular-nums text-text-primary">{count}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard hover={false}>
              <GlassCardHeader title="By subscription status" />
              <div className="divide-y divide-cream-3/70">
                {Object.entries(data.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span className="capitalize text-text-secondary">{status.replace("_", " ")}</span>
                    <span className="font-mono font-semibold tabular-nums text-text-primary">{count}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
