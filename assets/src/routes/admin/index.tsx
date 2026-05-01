import { createFileRoute } from '@tanstack/react-router';
import { useAdminDashboard } from '@/hooks/queries/useAdmin';
import { Building2, CreditCard, UserCircle, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Users" value={data.totals.users} icon={UserCircle} accent="from-blue to-blue/70" />
          <StatCard label="Workspaces" value={data.totals.workspaces} icon={Building2} accent="from-coffee to-amber" />
          <StatCard label="Employees" value={data.totals.employees} icon={Users} accent="from-amber to-amber-light" />
          <StatCard label="Subscriptions" value={data.totals.subscriptions} icon={CreditCard} accent="from-green to-green/70" />
        </div>
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
