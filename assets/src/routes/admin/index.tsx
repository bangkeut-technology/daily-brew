import { createFileRoute, Link } from '@tanstack/react-router';
import { useAdminDashboard } from '@/hooks/queries/useAdmin';
import {
  Building2,
  CreditCard,
  UserCircle,
  Users,
  TrendingUp,
  Coffee,
  Crown,
  ScrollText,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/admin/')({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminDashboard();

  return (
    <div>
      <PageHeader title="Admin dashboard" />
      <p className="text-[15px] text-text-secondary mb-5 -mt-2">
        Platform-wide totals across all workspaces. Visible only to staff with super-admin role.
      </p>

      {isLoading && <p className="text-[15px] text-text-tertiary">Loading…</p>}
      {error && <p className="text-[14px] text-red">Failed to load admin data.</p>}

      {data && (
        <>
          {/* Totals row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Users" value={data.totals.users} icon={UserCircle} accent="from-blue to-blue/70" />
            <StatCard label="Workspaces" value={data.totals.workspaces} icon={Building2} accent="from-coffee to-amber" />
            <StatCard label="Employees" value={data.totals.employees} icon={Users} accent="from-amber to-amber-light" />
            <StatCard label="Subscriptions" value={data.totals.subscriptions} icon={CreditCard} accent="from-green to-green/70" />
          </div>

          {/* Plan distribution + growth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <GlassCard>
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 text-text-tertiary mb-3">
                  <Coffee size={14} />
                  <span className="text-[12.5px] font-medium uppercase tracking-wide">Active plans</span>
                </div>
                <div className="space-y-2.5">
                  <PlanRow label="Free" count={data.byPlan.free} total={data.totals.workspaces} color="bg-text-tertiary" />
                  <PlanRow label="Espresso" count={data.byPlan.espresso} total={data.totals.workspaces} color="bg-amber" icon={Coffee} />
                  <PlanRow label="Double Espresso" count={data.byPlan.double_espresso} total={data.totals.workspaces} color="bg-coffee" icon={Crown} />
                </div>
                <p className="text-[11.5px] text-text-tertiary mt-3 leading-snug">
                  Paid counts include only <span className="font-medium">active</span> and <span className="font-medium">trialing</span> subscriptions. Canceled, paused, and past-due fall back to Free.
                </p>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 text-text-tertiary mb-3">
                  <TrendingUp size={14} />
                  <span className="text-[12.5px] font-medium uppercase tracking-wide">Growth</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <GrowthCell label="New users · 7d" value={data.growth.usersLast7d} />
                  <GrowthCell label="New workspaces · 7d" value={data.growth.workspacesLast7d} />
                  <GrowthCell label="New employees · 7d" value={data.growth.employeesLast7d} />
                  <GrowthCell label="New users · 30d" value={data.growth.usersLast30d} />
                  <GrowthCell label="New workspaces · 30d" value={data.growth.workspacesLast30d} />
                  <GrowthCell label="New employees · 30d" value={data.growth.employeesLast30d} />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Subscription status breakdown */}
          <GlassCard className="mt-4">
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 text-text-tertiary mb-3">
                <CreditCard size={14} />
                <span className="text-[12.5px] font-medium uppercase tracking-wide">Subscription status</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatusCell label="Active" value={data.byStatus.active} variant="green" />
                <StatusCell label="Trialing" value={data.byStatus.trialing} variant="blue" />
                <StatusCell label="Past due" value={data.byStatus.past_due} variant="red" />
                <StatusCell label="Paused" value={data.byStatus.paused} variant="amber" />
                <StatusCell label="Canceled" value={data.byStatus.canceled} variant="gray" />
              </div>
            </div>
          </GlassCard>

          {/* Recent activity / signups / workspaces */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <GlassCard>
              <ListHeader icon={ScrollText} label="Recent admin actions" linkTo="/admin/audit-log" linkLabel="Audit log" />
              <div className="px-5 pb-4">
                {data.recentActivity.length === 0 ? (
                  <EmptyHint>No actions yet.</EmptyHint>
                ) : (
                  <ul className="space-y-2.5">
                    {data.recentActivity.map((a) => (
                      <li key={a.publicId} className="flex items-start gap-2 text-[13.5px]">
                        <span className="mt-1 w-1 h-1 rounded-full bg-coffee shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-text-primary truncate">
                            <span className="font-medium">{a.actionLabel}</span>
                            {a.targetLabel && <span className="text-text-secondary"> · {a.targetLabel}</span>}
                          </div>
                          <div className="text-[12px] text-text-tertiary tabular-nums">
                            {a.actorEmail ?? 'system'} · {formatRelative(a.createdAt)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </GlassCard>

            <GlassCard>
              <ListHeader icon={UserCircle} label="Recent signups" linkTo="/admin/users" linkLabel="All users" />
              <div className="px-5 pb-4">
                {data.recentSignups.length === 0 ? (
                  <EmptyHint>No users yet.</EmptyHint>
                ) : (
                  <ul className="space-y-2.5">
                    {data.recentSignups.map((u) => (
                      <li key={u.publicId} className="flex items-start gap-2 text-[13.5px]">
                        <span className="mt-1 w-1 h-1 rounded-full bg-blue shrink-0" />
                        <div className="min-w-0 flex-1">
                          <Link
                            to="/admin/users/$publicId"
                            params={{ publicId: u.publicId }}
                            className="text-text-primary truncate hover:text-coffee no-underline block"
                          >
                            {u.fullName.trim() || u.email}
                          </Link>
                          <div className="text-[12px] text-text-tertiary tabular-nums">
                            {formatRelative(u.createdAt)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </GlassCard>

            <GlassCard>
              <ListHeader icon={Building2} label="Recent workspaces" linkTo="/admin/workspaces" linkLabel="All workspaces" />
              <div className="px-5 pb-4">
                {data.recentWorkspaces.length === 0 ? (
                  <EmptyHint>No workspaces yet.</EmptyHint>
                ) : (
                  <ul className="space-y-2.5">
                    {data.recentWorkspaces.map((w) => (
                      <li key={w.publicId} className="flex items-start gap-2 text-[13.5px]">
                        <span className="mt-1 w-1 h-1 rounded-full bg-amber shrink-0" />
                        <div className="min-w-0 flex-1">
                          <Link
                            to="/admin/workspaces/$publicId"
                            params={{ publicId: w.publicId }}
                            className="text-text-primary truncate hover:text-coffee no-underline block"
                          >
                            {w.name}
                          </Link>
                          <div className="text-[12px] text-text-tertiary tabular-nums">
                            {w.owner?.email ?? 'no owner'} · {formatRelative(w.createdAt)}
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

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent: string;
}) {
  return (
    <GlassCard hover>
      <div className="relative">
        <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${accent}`} />
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-2 text-text-tertiary mb-2">
            <Icon size={14} />
            <span className="text-[12.5px] font-medium uppercase tracking-wide">{label}</span>
          </div>
          <p className="text-[28px] font-semibold text-text-primary tabular-nums">{value.toLocaleString()}</p>
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
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-[13.5px] mb-1">
        <span className="flex items-center gap-1.5 text-text-secondary">
          {Icon && <Icon size={12} className="opacity-70" />}
          {label}
        </span>
        <span className="tabular-nums text-text-primary">
          <span className="font-semibold">{count.toLocaleString()}</span>
          <span className="text-text-tertiary"> · {pct}%</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-cream-3 overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function GrowthCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-cream-3/40 px-3 py-2.5">
      <div className="text-[11.5px] text-text-tertiary uppercase tracking-wide">{label}</div>
      <div className="text-[22px] font-semibold text-text-primary tabular-nums leading-tight mt-0.5">
        {value > 0 ? '+' : ''}
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
  variant: 'green' | 'blue' | 'red' | 'amber' | 'gray';
}) {
  const dotClass = {
    green: 'bg-green',
    blue: 'bg-blue',
    red: 'bg-red',
    amber: 'bg-amber',
    gray: 'bg-text-tertiary',
  }[variant];
  return (
    <div className="rounded-xl bg-cream-3/40 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[12px] text-text-tertiary mb-1">
        <span className={cn('w-1.5 h-1.5 rounded-full', dotClass)} />
        {label}
      </div>
      <div className="text-[20px] font-semibold text-text-primary tabular-nums leading-tight">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function ListHeader({
  icon: Icon,
  label,
  linkTo,
  linkLabel,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  linkTo: string;
  linkLabel: string;
}) {
  return (
    <div className="px-5 pt-4 pb-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-text-tertiary">
        <Icon size={14} />
        <span className="text-[12.5px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <Link
        to={linkTo}
        className="text-[12px] text-coffee hover:text-coffee-light no-underline flex items-center gap-1"
      >
        {linkLabel}
        <ArrowRight size={11} />
      </Link>
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] text-text-tertiary py-2">{children}</p>;
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diffSec = (Date.now() - d.getTime()) / 1000;
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
