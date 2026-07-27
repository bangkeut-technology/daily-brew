"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2, Coffee, KeyRound, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { getWorkspacePublicId, setWorkspacePublicId } from "@/lib/api";
import { useLinkEmployee, useRoleContext } from "@/hooks/useRoleContext";
import { useCreateWorkspace } from "@/hooks/useWorkspaces";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { OwnerDashboard } from "@/components/console/OwnerDashboard";
import { EmployeeDashboard } from "@/components/console/EmployeeDashboard";
import { Skeleton } from "@/components/admin/AdminDataStates";

export default function DashboardPage() {
  const workspaceId = getWorkspacePublicId() || "";
  const { data: roleContext, isLoading } = useRoleContext();

  if (!workspaceId) return <NoWorkspaceView />;

  if (isLoading || !roleContext) {
    return (
      <div className="page-enter" aria-busy="true">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  // Managers see the owner dashboard (attendance overview, leave approvals);
  // plain employees see their own data only.
  if (roleContext.isEmployee && !roleContext.isOwner && !roleContext.isManager) {
    return <EmployeeDashboard />;
  }

  return <OwnerDashboard />;
}

function NoWorkspaceView() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<null | "owner" | "employee">(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const createWorkspace = useCreateWorkspace();
  const linkEmployee = useLinkEmployee();

  const handleCreateWorkspace = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const name = workspaceName.trim();
      if (!name) return;
      try {
        const ws = await createWorkspace.mutateAsync(name);
        setWorkspacePublicId(ws.publicId);
        // Full reload so every workspace-scoped query refetches against the
        // new id rather than replaying cached "no workspace" state.
        window.location.reload();
      } catch {
        toast.error(t("workspace.createFailed", "Failed to create workspace"));
      }
    },
    [createWorkspace, t, workspaceName],
  );

  const handleLinkEmployee = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const id = employeeId.trim();
      if (!id) return;
      try {
        await linkEmployee.mutateAsync(id);
        toast.success(t("profile.employeeLinked", "Employee linked successfully"));
        window.location.reload();
      } catch {
        toast.error(t("profile.employeeLinkError", "Failed to link. Check the ID and try again."));
      }
    },
    [employeeId, linkEmployee, t],
  );

  return (
    <div className="page-enter">
      <PageHeader
        title={t("nav.dashboard", "Dashboard")}
        help={{ href: "/guides/owner", label: "Open the owner setup guide" }}
      />

      <div className="mb-8 text-center">
        <Coffee size={40} className="mx-auto mb-4 text-coffee/60" strokeWidth={1.5} />
        <h2 className="mb-2 font-serif text-[22px] font-semibold text-text-primary">
          {t("dashboard.getStarted", "Get started with DailyBrew")}
        </h2>
        <p className="text-[15.5px] text-text-secondary">
          {t("dashboard.chooseRole", "Choose how you want to use DailyBrew.")}
        </p>
      </div>

      {!mode && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <RoleCard
            icon={Building2}
            iconClass="bg-amber/10 text-amber"
            title={t("dashboard.becomeOwner", "I own a restaurant")}
            hint={t(
              "dashboard.becomeOwnerDesc",
              "Create a workspace to manage your staff, shifts, and attendance.",
            )}
            onClick={() => setMode("owner")}
          />
          <RoleCard
            icon={UserCheck}
            iconClass="bg-blue/10 text-blue"
            title={t("dashboard.linkEmployee", "I'm a staff member")}
            hint={t(
              "dashboard.linkEmployeeDesc",
              "Enter the employee ID your employer gave you to link your account.",
            )}
            onClick={() => setMode("employee")}
          />
        </div>
      )}

      {mode === "owner" && (
        <GlassCard hover={false}>
          <form onSubmit={handleCreateWorkspace} className="p-6">
            <p className="mb-1 text-base font-semibold text-text-primary">
              {t("dashboard.createWorkspace", "Create your workspace")}
            </p>
            <p className="mb-5 text-[14.5px] text-text-secondary">
              {t("dashboard.createWorkspaceDesc", "Enter your restaurant name to get started.")}
            </p>
            <div className="flex gap-3">
              <label htmlFor="workspace-name" className="sr-only">
                Restaurant name
              </label>
              <input
                id="workspace-name"
                name="workspaceName"
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder={t("workspace.newPlaceholder", "Restaurant name")}
                autoFocus
                className="flex-1 rounded-lg border border-cream-3 bg-glass-bg px-3 py-2.5 text-[15.5px] text-text-primary outline-none transition-all focus:border-coffee focus:ring-1 focus:ring-coffee/20"
              />
              <button
                type="submit"
                disabled={createWorkspace.isPending || !workspaceName.trim()}
                className="rounded-lg bg-coffee px-5 py-2 text-[15px] font-medium text-white transition-all hover:bg-coffee-light disabled:opacity-50"
              >
                {t("common.create", "Create")}
              </button>
            </div>
            <BackButton onClick={() => setMode(null)} />
          </form>
        </GlassCard>
      )}

      {mode === "employee" && (
        <GlassCard hover={false}>
          <form onSubmit={handleLinkEmployee} className="p-6">
            <p className="mb-1 text-base font-semibold text-text-primary">
              {t("dashboard.linkToEmployee", "Link to your employee profile")}
            </p>
            <p className="mb-5 text-[14.5px] text-text-secondary">
              Paste the public ID your employer shared with you. Ask them to open DailyBrew →
              Employees → your name → Share.
            </p>
            <div className="flex gap-3">
              <label htmlFor="employee-id" className="sr-only">
                Employee public ID
              </label>
              <input
                id="employee-id"
                name="employeeId"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder={t("onboarding.employeePublicId", "Employee public ID")}
                autoFocus
                className="flex-1 rounded-lg border border-cream-3 bg-glass-bg px-3 py-2.5 font-mono text-[15.5px] text-text-primary outline-none transition-all focus:border-coffee focus:ring-1 focus:ring-coffee/20"
              />
              <button
                type="submit"
                disabled={linkEmployee.isPending || !employeeId.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-coffee px-5 py-2 text-[15px] font-medium text-white transition-all hover:bg-coffee-light disabled:opacity-50"
              >
                <KeyRound size={14} />
                {t("profile.link", "Link")}
              </button>
            </div>
            <BackButton onClick={() => setMode(null)} />
          </form>
        </GlassCard>
      )}
    </div>
  );
}

function RoleCard({
  icon: Icon,
  iconClass,
  title,
  hint,
  onClick,
}: {
  icon: typeof Building2;
  iconClass: string;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-glass-border bg-glass-bg p-6 text-left backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${iconClass}`}
      >
        <Icon size={22} />
      </div>
      <p className="mb-1 text-base font-semibold text-text-primary">{title}</p>
      <p className="text-sm leading-relaxed text-text-secondary">{hint}</p>
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 text-sm text-text-tertiary transition-colors hover:text-text-secondary"
    >
      &larr; Back
    </button>
  );
}
