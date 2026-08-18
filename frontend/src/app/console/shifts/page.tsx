"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock, Crown, Plus } from "lucide-react";
import { toast } from "sonner";
import { getWorkspacePublicId } from "@/lib/api";
import { shiftCrossesMidnight } from "@/lib/shiftTime";
import { useCreateShift, useDeleteShift, useShifts } from "@/hooks/useShifts";
import { useEmployees } from "@/hooks/useEmployees";
import { usePlan } from "@/hooks/usePlan";
import type { Shift } from "@/types/shift";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { CustomTimePicker } from "@/components/shared/CustomTimePicker";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ShiftCard } from "@/components/console/ShiftCard";
import { UpgradeModal } from "@/components/console/UpgradeModal";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { Skeleton } from "@/components/admin/AdminDataStates";

export default function ShiftsPage() {
  const { t } = useTranslation();
  const [workspaceId] = useState<string | null>(() => getWorkspacePublicId());
  const wsId = workspaceId ?? "";

  const { data: shifts, isLoading, isError } = useShifts(wsId);
  const { data: employees } = useEmployees(wsId);
  const { data: plan } = usePlan(wsId);
  const createShift = useCreateShift(wsId);
  const deleteShift = useDeleteShift(wsId);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [deleteTarget, setDeleteTarget] = useState<Shift | null>(null);
  // Only one card shows its day schedule at a time — seven rows per card makes
  // an all-expanded grid unreadable.
  const [expandedShift, setExpandedShift] = useState<string | null>(null);

  const canUseTimeRules = plan?.canUseShiftTimeRules ?? false;
  const upgrade = useUpgradeModal();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createShift.mutateAsync({ name, startTime, endTime });
      toast.success(t("shift.created", "Shift created"));
      setShowForm(false);
      setName("");
      // Drop straight into the day schedule — setting per-day hours is the
      // usual next step once the shift exists.
      if (canUseTimeRules) setExpandedShift(created.publicId);
    } catch {
      toast.error(t("shift.createError", "Failed to create shift"));
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteShift.mutate(deleteTarget.publicId, {
      onSuccess: () => {
        toast.success(t("shift.deleted", "Shift deleted"));
        if (expandedShift === deleteTarget.publicId) setExpandedShift(null);
        setDeleteTarget(null);
      },
      onError: () => toast.error(t("shift.deleteError", "Failed to delete shift")),
    });
  };

  return (
    <div className="page-enter">
      <PageHeader
        title={t("nav.shifts", "Shifts")}
        help={{ href: "/guides/owner#step-owner-3", label: "How shifts work" }}
        action={
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-all duration-150 hover:bg-coffee-light"
          >
            <Plus size={15} />
            {t("common.create", "Create")}
          </button>
        }
      />

      <p className="-mt-2 mb-5 text-[15px] leading-relaxed text-text-secondary">
        {t(
          "shift.description",
          "Define your restaurant's working hours. Assign employees to shifts so DailyBrew can track late arrivals and early departures automatically.",
        )}
      </p>

      {showForm && (
        <GlassCard hover={false} className="mb-4 overflow-visible">
          <form onSubmit={handleCreate} className="space-y-3 p-5">
            <label htmlFor="shift-name" className="sr-only">
              {t("shift.name", "Shift name")}
            </label>
            <input
              id="shift-name"
              name="shiftName"
              type="text"
              placeholder={t("shift.namePlaceholder", "Shift name (e.g. Morning)")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[15.5px] text-text-primary outline-none focus:border-coffee"
            />
            <div className="flex gap-3">
              <div className="flex-1">
                <label
                  htmlFor="shift-start"
                  className="mb-1 block text-[13px] font-medium text-text-secondary"
                >
                  {t("shift.startTime", "Start time")}
                </label>
                <CustomTimePicker id="shift-start" value={startTime} onChange={setStartTime} />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="shift-end"
                  className="mb-1 block text-[13px] font-medium text-text-secondary"
                >
                  {t("shift.endTime", "End time")}
                </label>
                <CustomTimePicker id="shift-end" value={endTime} onChange={setEndTime} />
              </div>
            </div>
            {shiftCrossesMidnight(startTime, endTime) && (
              <p className="text-[12.5px] text-amber">
                {t(
                  "shift.endsNextDay",
                  "Ends the next day — attendance stays on the day the shift started.",
                )}
              </p>
            )}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={createShift.isPending || !name.trim()}
                className="rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50"
              >
                {createShift.isPending
                  ? t("common.loading", "Loading...")
                  : t("common.create", "Create")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setName("");
                }}
                className="rounded-lg border border-cream-3 bg-glass-bg px-4 py-2 text-[15px] font-medium text-text-secondary transition-colors hover:bg-cream-3/40"
              >
                {t("common.cancel", "Cancel")}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {plan && !canUseTimeRules && (
        <GlassCard hover={false} className="mb-4">
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber/10">
              <Crown size={16} className="text-amber" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-medium text-text-primary">
                {t("shift.perDaySchedules", "Per-day shift schedules")}
              </p>
              <p className="mt-0.5 text-[13.5px] text-text-tertiary">
                {t(
                  "shift.perDaySchedulesDesc",
                  "Override shift hours for specific days of the week. Available with Espresso.",
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => upgrade.openFor("shiftTimeRules")}
              className="shrink-0 cursor-pointer rounded-full border-none bg-amber/10 px-3 py-1 text-[12.5px] font-medium text-amber transition-colors hover:bg-amber/20"
            >
              {t("upgrade.upgradeButton", "Upgrade to Espresso")}
            </button>
          </div>
        </GlassCard>
      )}

      {isError && <p className="text-red">{t("shift.loadError", "Could not load shifts.")}</p>}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : shifts?.length === 0 ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex min-h-50 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-[1.5px] border-dashed border-cream-3 bg-glass-bg backdrop-blur-md transition-colors hover:bg-cream-3/30"
        >
          <Clock size={28} className="mb-2 text-text-tertiary" />
          <span className="text-[15px] text-text-tertiary">
            {t("shift.emptyTitle", "No shifts created yet")}
          </span>
          <span className="mt-1 text-[13px] text-text-tertiary">
            {t("shift.emptyHint", "Click to create your first shift")}
          </span>
        </button>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shifts?.map((shift) => (
            <ShiftCard
              key={shift.publicId}
              shift={shift}
              workspaceId={wsId}
              assignedEmployees={employees?.filter((e) => e.shiftPublicId === shift.publicId) ?? []}
              unassignedEmployees={employees?.filter((e) => !e.shiftPublicId && e.active) ?? []}
              canUseTimeRules={canUseTimeRules}
              isExpanded={expandedShift === shift.publicId}
              onToggleExpand={() =>
                setExpandedShift((prev) => (prev === shift.publicId ? null : shift.publicId))
              }
              onDelete={() => setDeleteTarget(shift)}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("shift.deleteTitle", "Delete shift")}
        description={t(
          "shift.deleteConfirm",
          "Delete the {{name}} shift? Employees assigned to this shift will be unassigned.",
          { name: deleteTarget?.name ?? "" },
        )}
        confirmLabel={t("common.delete", "Delete")}
        cancelLabel={t("common.cancel", "Cancel")}
        variant="danger"
        loading={deleteShift.isPending}
        onConfirm={confirmDelete}
      />

      {upgrade.feature && (
        <UpgradeModal
          open={upgrade.isOpen}
          onOpenChange={(open) => {
            if (!open) upgrade.close();
          }}
          feature={upgrade.feature}
        />
      )}
    </div>
  );
}
