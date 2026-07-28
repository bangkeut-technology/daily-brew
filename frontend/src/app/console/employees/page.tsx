"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Link2, Pencil, Plus, Search, ShieldCheck, Trash2, Unlink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getWorkspacePublicId } from "@/lib/api";
import { useEmployees, useDeleteEmployee } from "@/hooks/useEmployees";
import { useRoleContext } from "@/hooks/useRoleContext";
import type { Employee } from "@/types/employee";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Avatar } from "@/components/shared/Avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { EmployeeFormModal } from "@/components/console/EmployeeFormModal";
import { ManagerPermissionsModal } from "@/components/console/ManagerPermissionsModal";
import { Skeleton } from "@/components/admin/AdminDataStates";

type LinkFilter = "" | "linked" | "unlinked";
type StatusFilter = "" | "active" | "inactive";

export default function EmployeesPage() {
  const { t } = useTranslation();
  // This page only renders client-side (the console shell withholds children
  // until auth resolves), so reading localStorage in a lazy initializer is safe.
  const [workspaceId] = useState<string | null>(() => getWorkspacePublicId());

  const { data: employees, isLoading, isError } = useEmployees(workspaceId ?? "");
  const { data: roleContext } = useRoleContext();
  const deleteEmployee = useDeleteEmployee(workspaceId ?? "");

  const [search, setSearch] = useState("");
  const [linkFilter, setLinkFilter] = useState<LinkFilter>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [target, setTarget] = useState<Employee | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [permTarget, setPermTarget] = useState<Employee | null>(null);

  const isOwner = roleContext?.isOwner ?? false;

  const counts = useMemo(() => {
    const list = employees ?? [];
    return {
      all: list.length,
      linked: list.filter((e) => e.linkedUserEmail).length,
      unlinked: list.filter((e) => !e.linkedUserEmail).length,
      active: list.filter((e) => e.active).length,
      inactive: list.filter((e) => !e.active).length,
    };
  }, [employees]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (employees ?? []).filter((emp) => {
      if (needle && !emp.name.toLowerCase().includes(needle)) return false;
      if (linkFilter === "linked" && !emp.linkedUserEmail) return false;
      if (linkFilter === "unlinked" && emp.linkedUserEmail) return false;
      if (statusFilter === "active" && !emp.active) return false;
      if (statusFilter === "inactive" && emp.active) return false;
      return true;
    });
  }, [employees, search, linkFilter, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (emp: Employee) => {
    setEditing(emp);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!target) return;
    deleteEmployee.mutate(target.publicId, {
      onSuccess: () => {
        toast.success(t("employee.deleteSuccess", "Employee deleted"));
        setTarget(null);
      },
      onError: () => toast.error(t("employee.deleteError", "Failed to delete employee")),
    });
  };

  return (
    <div className="page-enter">
      <PageHeader
        title={t("nav.employees", "Employees")}
        help={{ href: "/guides/owner#step-owner-4", label: "How to add and link employees" }}
        action={
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-coffee-light hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)]"
          >
            <Plus size={15} />
            {t("employee.add", "Add employee")}
          </button>
        }
      />

      {/* Stacks below sm so the search input gets a full row of its own on
          phones instead of fighting the filter chips for horizontal space. */}
      <div className="mb-4 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:w-auto">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <label htmlFor="employee-search" className="sr-only">
            {t("common.search", "Search")}
          </label>
          <input
            id="employee-search"
            name="search"
            type="text"
            placeholder={t("common.search", "Search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-cream-3 bg-glass-bg py-2 pl-9 pr-3 text-[15.5px] text-text-primary outline-none transition-colors focus:border-coffee sm:w-56"
          />
        </div>

        <div className="flex gap-1">
          <FilterChip
            active={linkFilter === ""}
            activeClass="bg-coffee text-white"
            onClick={() => setLinkFilter("")}
          >
            {t("employee.filterAll", "All ({{count}})", { count: counts.all })}
          </FilterChip>
          <FilterChip
            active={linkFilter === "linked"}
            activeClass="bg-green/15 text-green"
            onClick={() => setLinkFilter(linkFilter === "linked" ? "" : "linked")}
          >
            <Link2 size={11} />
            {t("employee.filterLinked", "Linked ({{count}})", { count: counts.linked })}
          </FilterChip>
          <FilterChip
            active={linkFilter === "unlinked"}
            activeClass="bg-red/15 text-red"
            onClick={() => setLinkFilter(linkFilter === "unlinked" ? "" : "unlinked")}
          >
            <Unlink size={11} />
            {t("employee.filterUnlinked", "Unlinked ({{count}})", { count: counts.unlinked })}
          </FilterChip>
        </div>

        <div className="flex gap-1">
          <FilterChip
            active={statusFilter === "active"}
            activeClass="bg-green/15 text-green"
            onClick={() => setStatusFilter(statusFilter === "active" ? "" : "active")}
          >
            {t("employee.filterActive", "Active ({{count}})", { count: counts.active })}
          </FilterChip>
          <FilterChip
            active={statusFilter === "inactive"}
            activeClass="bg-amber/15 text-amber"
            onClick={() => setStatusFilter(statusFilter === "inactive" ? "" : "inactive")}
          >
            {t("employee.filterInactive", "Inactive ({{count}})", { count: counts.inactive })}
          </FilterChip>
        </div>
      </div>

      {isError && <p className="text-red">{t("employee.loadError", "Could not load employees.")}</p>}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : (
        <GlassCard hover={false}>
          <div>
            {filtered.length === 0 ? (
              <p className="px-5 py-8 text-center text-[15px] text-text-tertiary">
                {employees?.length === 0
                  ? t("employee.noneYet", "No employees yet.")
                  : t("common.noResults", "No results")}
              </p>
            ) : (
              filtered.map((emp, i) => (
                <div
                  key={emp.publicId}
                  className="flex items-center gap-3 px-5 py-3 transition-colors duration-[120ms] hover:bg-cream-3/35"
                >
                  <Link
                    href={`/console/employees/${emp.publicId}`}
                    className="flex min-w-0 flex-1 items-center gap-3 no-underline"
                  >
                    <Avatar
                      name={emp.name}
                      imageUrl={emp.photoUrl}
                      index={i}
                      size={42}
                      radius="12px"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15.5px] font-medium text-text-primary">
                        {emp.name}
                      </div>
                      <div className="truncate text-[13px] text-text-tertiary">
                        {emp.shiftName || t("employee.noShift", "No shift")}
                        {emp.phoneNumber ? ` · ${emp.phoneNumber}` : ""}
                      </div>
                    </div>
                  </Link>

                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {emp.jobTitle && <StatusBadge label={emp.jobTitle} variant="blue" />}
                    {/* Badges double as filters — clicking one narrows the list
                        to that cohort, which is the usual next question. */}
                    <BadgeButton
                      onClick={() =>
                        setLinkFilter((f) =>
                          emp.linkedUserEmail
                            ? f === "linked"
                              ? ""
                              : "linked"
                            : f === "unlinked"
                              ? ""
                              : "unlinked",
                        )
                      }
                    >
                      <StatusBadge
                        label={
                          emp.linkedUserEmail
                            ? t("employee.linked", "Linked")
                            : t("employee.unlinked", "Unlinked")
                        }
                        variant={emp.linkedUserEmail ? "green" : "red"}
                      />
                    </BadgeButton>
                    <BadgeButton
                      onClick={() =>
                        setStatusFilter((f) =>
                          emp.active
                            ? f === "active"
                              ? ""
                              : "active"
                            : f === "inactive"
                              ? ""
                              : "inactive",
                        )
                      }
                    >
                      <StatusBadge
                        label={
                          emp.active
                            ? t("employee.active", "Active")
                            : t("employee.inactive", "Inactive")
                        }
                        variant={emp.active ? "green" : "gray"}
                      />
                    </BadgeButton>
                    {emp.role === "manager" && (
                      <StatusBadge label={t("employee.manager", "Manager")} variant="amber" />
                    )}
                    {emp.attendanceTracking === "none" && (
                      <StatusBadge
                        label={t("employee.notTrackedBadge", "Not tracked")}
                        variant="gray"
                      />
                    )}
                  </div>

                  {isOwner && emp.role === "manager" && (
                    <button
                      type="button"
                      onClick={() => setPermTarget(emp)}
                      aria-label={t("employee.editPermissionsAria", "Edit permissions for {{name}}", {
                        name: emp.name,
                      })}
                      className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-cream-3 hover:text-coffee"
                    >
                      <ShieldCheck size={15} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openEdit(emp)}
                    aria-label={t("employee.editAria", "Edit {{name}}", { name: emp.name })}
                    className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-cream-3 hover:text-coffee"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTarget(emp)}
                    aria-label={t("employee.deleteAria", "Remove {{name}}", { name: emp.name })}
                    className="rounded-lg p-1.5 text-text-tertiary transition-all hover:bg-red/8 hover:text-red"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      )}

      <ConfirmModal
        open={target !== null}
        onOpenChange={(open) => !open && setTarget(null)}
        title={t("employee.deleteTitle", "Delete employee")}
        description={t("employee.deleteConfirm", "Delete {{name}}? This cannot be undone.", {
          name: target?.name ?? "",
        })}
        confirmLabel={t("common.delete", "Delete")}
        cancelLabel={t("common.cancel", "Cancel")}
        variant="danger"
        loading={deleteEmployee.isPending}
        onConfirm={handleDelete}
      />

      <EmployeeFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        workspaceId={workspaceId ?? ""}
        employee={editing}
      />

      <ManagerPermissionsModal
        open={permTarget !== null}
        onOpenChange={(open) => !open && setPermTarget(null)}
        workspaceId={workspaceId ?? ""}
        employee={permTarget}
      />
    </div>
  );
}

function FilterChip({
  active,
  activeClass,
  onClick,
  children,
}: {
  active: boolean;
  activeClass: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        active ? activeClass : "bg-glass-bg text-text-secondary hover:bg-cream-3",
      )}
    >
      {children}
    </button>
  );
}

/** Wraps a badge so it can act as a one-click filter without looking like a button. */
function BadgeButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="cursor-pointer p-0">
      {children}
    </button>
  );
}
