"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getWorkspacePublicId } from "@/lib/api";
import { useEmployees, useDeleteEmployee } from "@/hooks/useEmployees";
import type { Employee } from "@/types/employee";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Avatar } from "@/components/shared/Avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

export default function EmployeesPage() {
  const { t } = useTranslation();
  // This page only renders client-side (the console shell withholds children
  // until auth resolves), so reading localStorage in a lazy initializer is safe.
  const [workspaceId] = useState<string | null>(() => getWorkspacePublicId());

  const { data: employees, isLoading, isError } = useEmployees(workspaceId ?? "");
  const deleteEmployee = useDeleteEmployee(workspaceId ?? "");
  const [target, setTarget] = useState<Employee | null>(null);

  const handleDelete = () => {
    if (!target) return;
    deleteEmployee.mutate(target.publicId, {
      onSuccess: () => toast.success(`${target.name} removed`),
      onError: () => toast.error("Could not remove employee"),
    });
  };

  return (
    <div className="page-enter">
      <PageHeader title={t("nav.employees", "Employees")} />

      {isLoading && <p className="text-text-secondary">Loading…</p>}
      {isError && <p className="text-red">Could not load employees.</p>}

      {employees && employees.length === 0 && (
        <GlassCard hover={false} className="p-8 text-center">
          <p className="text-text-secondary">No employees yet.</p>
        </GlassCard>
      )}

      {employees && employees.length > 0 && (
        <GlassCard hover={false} className="divide-y divide-cream-3/70">
          {employees.map((emp, i) => (
            <div key={emp.publicId} className="flex items-center gap-4 px-5 py-4">
              <Avatar name={emp.name} index={i} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-text-primary">{emp.name}</p>
                {emp.jobTitle && (
                  <p className="truncate text-sm text-text-tertiary">{emp.jobTitle}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {emp.role === "manager" && <StatusBadge label="Manager" variant="blue" />}
                {emp.attendanceTracking === "none" && (
                  <StatusBadge label="Not tracked" variant="gray" />
                )}
                {!emp.active && <StatusBadge label="Inactive" variant="red" />}
              </div>
              <button
                type="button"
                onClick={() => setTarget(emp)}
                aria-label={`Remove ${emp.name}`}
                className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-red/10 hover:text-red"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </GlassCard>
      )}

      <ConfirmModal
        open={target !== null}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Remove employee"
        description={`Remove ${target?.name ?? "this employee"}? Their attendance history is kept.`}
        confirmLabel="Remove"
        variant="danger"
        loading={deleteEmployee.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
