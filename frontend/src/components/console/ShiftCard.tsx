"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Clock, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateEmployee } from "@/hooks/useEmployees";
import {
  useCreateShiftTimeRule,
  useDeleteShiftTimeRule,
  useUpdateShift,
  useUpdateShiftTimeRule,
} from "@/hooks/useShifts";
import type { Employee } from "@/types/employee";
import type { Shift, ShiftTimeRule } from "@/types/shift";
import { GlassCard } from "@/components/shared/GlassCard";
import { Avatar } from "@/components/shared/Avatar";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { CustomTimePicker } from "@/components/shared/CustomTimePicker";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

/**
 * Stable keys for the 7 days. The full label and 3-letter abbreviation come
 * from `shift.day.*` / `shift.dayShort.*` so each locale can pick a natural
 * abbreviation — FR and KM don't truncate cleanly from English.
 */
const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

interface Props {
  shift: Shift;
  workspaceId: string;
  assignedEmployees: Employee[];
  unassignedEmployees: Employee[];
  canUseTimeRules: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
}

export function ShiftCard({
  shift,
  workspaceId,
  assignedEmployees,
  unassignedEmployees,
  canUseTimeRules,
  isExpanded,
  onToggleExpand,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const updateEmployee = useUpdateEmployee(workspaceId);
  const updateShift = useUpdateShift(workspaceId);

  const [showAssign, setShowAssign] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [unassignTarget, setUnassignTarget] = useState<Employee | null>(null);
  const [editName, setEditName] = useState(shift.name);
  const [editStartTime, setEditStartTime] = useState(shift.startTime);
  const [editEndTime, setEditEndTime] = useState(shift.endTime);

  const startEdit = () => {
    setEditName(shift.name);
    setEditStartTime(shift.startTime);
    setEditEndTime(shift.endTime);
    setIsEditing(true);
  };

  const saveEdit = async () => {
    try {
      await updateShift.mutateAsync({
        publicId: shift.publicId,
        name: editName,
        startTime: editStartTime,
        endTime: editEndTime,
      });
      toast.success(t("shift.updated", "Shift updated"));
      setIsEditing(false);
    } catch {
      toast.error(t("shift.updateError", "Failed to update shift"));
    }
  };

  const assign = async (employeePublicId: string) => {
    try {
      await updateEmployee.mutateAsync({ publicId: employeePublicId, shiftPublicId: shift.publicId });
      toast.success(t("shift.employeeAssigned", "Employee assigned"));
      setShowAssign(false);
    } catch {
      toast.error(t("shift.assignError", "Failed to assign employee"));
    }
  };

  const unassign = async () => {
    if (!unassignTarget) return;
    try {
      await updateEmployee.mutateAsync({ publicId: unassignTarget.publicId, shiftPublicId: null });
      toast.success(t("shift.employeeUnassigned", "Employee unassigned"));
    } catch {
      toast.error(t("shift.unassignError", "Failed to unassign employee"));
    }
    setUnassignTarget(null);
  };

  return (
    <GlassCard
      hover={!isExpanded && !showAssign && !isEditing}
      className={isExpanded || isEditing ? "overflow-visible" : undefined}
    >
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-linear-to-r from-amber to-coffee" />
        <div className="px-5 pb-3 pt-5">
          {isEditing ? (
            <div className="space-y-3">
              <label htmlFor={`shift-name-${shift.publicId}`} className="sr-only">
                {t("shift.name", "Shift name")}
              </label>
              <input
                id={`shift-name-${shift.publicId}`}
                name="shiftName"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder={t("shift.name", "Shift name")}
                className="w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[15.5px] text-text-primary outline-none focus:border-coffee"
              />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label
                    htmlFor={`shift-start-${shift.publicId}`}
                    className="mb-1 block text-[13px] font-medium text-text-secondary"
                  >
                    {t("shift.startTime", "Start time")}
                  </label>
                  <CustomTimePicker
                    id={`shift-start-${shift.publicId}`}
                    value={editStartTime}
                    onChange={setEditStartTime}
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor={`shift-end-${shift.publicId}`}
                    className="mb-1 block text-[13px] font-medium text-text-secondary"
                  >
                    {t("shift.endTime", "End time")}
                  </label>
                  <CustomTimePicker
                    id={`shift-end-${shift.publicId}`}
                    value={editEndTime}
                    onChange={setEditEndTime}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={updateShift.isPending || !editName.trim()}
                  className="rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50"
                >
                  {updateShift.isPending ? t("common.loading", "Loading...") : t("common.save", "Save")}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg border border-cream-3 bg-glass-bg px-4 py-2 text-[15px] font-medium text-text-secondary transition-colors hover:bg-cream-3/40"
                >
                  {t("common.cancel", "Cancel")}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[17px] font-semibold text-text-primary">{shift.name}</h3>
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 font-mono text-[15px] tabular-nums text-text-secondary">
                    <Clock size={13} className="text-amber" />
                    {shift.startTime} &ndash; {shift.endTime}
                  </div>
                  <span className="rounded-full bg-amber/10 px-2 py-0.5 text-[12.5px] font-medium text-amber">
                    {shiftDuration(shift.startTime, shift.endTime)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={startEdit}
                  aria-label={t("shift.editAria", "Edit shift")}
                  className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-coffee/8 hover:text-coffee"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  aria-label={t("shift.deleteAria", "Delete shift")}
                  className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-red/8 hover:text-red"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-cream-3/80 px-5 py-3">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-medium text-text-secondary">
            <Users size={13} />
            {t("shift.employeeCount", {
              count: assignedEmployees.length,
              defaultValue: "{{count}} employees",
            })}
          </span>
          <button
            type="button"
            onClick={() => setShowAssign((v) => !v)}
            className="flex items-center gap-0.5 text-[13px] font-medium text-coffee transition-colors hover:text-coffee-light"
          >
            <Plus size={11} />
            {t("shift.assign", "Assign")}
          </button>
        </div>

        {showAssign && (
          <div className="mb-3">
            <CustomSelect
              value=""
              onChange={(v) => {
                if (v) assign(v);
              }}
              options={unassignedEmployees.map((e) => ({ value: e.publicId, label: e.name }))}
              placeholder={t("shift.selectEmployee", "Select employee…")}
            />
          </div>
        )}

        {assignedEmployees.length === 0 ? (
          <p className="text-[13.5px] italic text-text-tertiary">
            {t(
              "shift.noEmployeesAssigned",
              "No employees assigned. Assign staff to track their attendance against this shift's hours.",
            )}
          </p>
        ) : (
          <div className="space-y-1.5">
            {assignedEmployees.map((emp, i) => (
              <div
                key={emp.publicId}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-cream-3/30"
              >
                <Avatar name={emp.name} imageUrl={emp.photoUrl} index={i} size={24} />
                <span className="flex-1 truncate text-[14.5px] text-text-primary">{emp.name}</span>
                <button
                  type="button"
                  onClick={() => setUnassignTarget(emp)}
                  aria-label={t("shift.unassignAria", "Remove {{name}} from this shift", {
                    name: emp.name,
                  })}
                  className="rounded-md p-1 text-text-tertiary transition-all hover:bg-red/8 hover:text-red"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-cream-3/80">
        <button
          type="button"
          onClick={onToggleExpand}
          disabled={!canUseTimeRules}
          aria-expanded={isExpanded}
          className={cn(
            "flex w-full items-center justify-between px-5 py-3 text-sm font-medium transition-colors",
            canUseTimeRules
              ? "text-text-secondary hover:bg-cream-3/40"
              : "cursor-not-allowed text-text-tertiary",
          )}
        >
          <span className="flex items-center gap-1.5">
            {t("shift.daySchedule", "Day schedule")}
            {!canUseTimeRules && (
              <span className="rounded-full bg-amber/10 px-2 py-0.5 text-[12.5px] font-medium text-amber">
                Espresso
              </span>
            )}
            {canUseTimeRules && shift.timeRules.length > 0 && (
              <span className="rounded-full bg-coffee/10 px-1.5 py-px text-[12px] font-medium text-coffee">
                {shift.timeRules.length}
              </span>
            )}
          </span>
          {canUseTimeRules && (isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </button>

        {isExpanded && canUseTimeRules && (
          <DaySchedulePanel shift={shift} workspaceId={workspaceId} />
        )}
      </div>

      <ConfirmModal
        open={unassignTarget !== null}
        onOpenChange={(open) => !open && setUnassignTarget(null)}
        title={t("shift.unassignTitle", "Remove from shift")}
        description={t(
          "shift.unassignConfirm",
          "Remove {{name}} from the {{shift}} shift? Their attendance will no longer be tracked against this shift.",
          { name: unassignTarget?.name ?? "", shift: shift.name },
        )}
        confirmLabel={t("shift.unassign", "Remove")}
        cancelLabel={t("common.cancel", "Cancel")}
        variant="danger"
        loading={updateEmployee.isPending}
        onConfirm={unassign}
      />
    </GlassCard>
  );
}

/** The 7-row per-day editor inside an expanded shift card. */
function DaySchedulePanel({ shift, workspaceId }: { shift: Shift; workspaceId: string }) {
  const { t } = useTranslation();
  const rulesByDay = new Map(shift.timeRules.map((r) => [r.dayOfWeek, r]));

  return (
    <div className="space-y-1 px-5 pb-4">
      <p className="pb-2 text-[12.5px] leading-snug text-text-tertiary">
        {t(
          "shift.daysAreSchedule",
          "Days left blank are off-days — staff aren't expected to check in and won't be counted absent. Changes apply to past dates too.",
        )}
      </p>
      {DAY_KEYS.map((dayKey, index) => {
        const dayOfWeek = index + 1; // 1 = Monday … 7 = Sunday
        return (
          <DayRow
            key={dayOfWeek}
            dayLabel={t(`shift.day.${dayKey}`, dayKey)}
            dayLabelShort={t(`shift.dayShort.${dayKey}`, dayKey.slice(0, 3))}
            dayOfWeek={dayOfWeek}
            existingRule={rulesByDay.get(dayOfWeek) ?? null}
            shiftDefault={{ startTime: shift.startTime, endTime: shift.endTime }}
            workspaceId={workspaceId}
            shiftPublicId={shift.publicId}
          />
        );
      })}
    </div>
  );
}

function DayRow({
  dayLabel,
  dayLabelShort,
  dayOfWeek,
  existingRule,
  shiftDefault,
  workspaceId,
  shiftPublicId,
}: {
  dayLabel: string;
  /** Pre-translated 3-letter abbreviation (Mon / Lun / ច័ន្ទ). */
  dayLabelShort: string;
  dayOfWeek: number;
  existingRule: ShiftTimeRule | null;
  shiftDefault: { startTime: string; endTime: string };
  workspaceId: string;
  shiftPublicId: string;
}) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [ruleStart, setRuleStart] = useState(existingRule?.startTime ?? shiftDefault.startTime);
  const [ruleEnd, setRuleEnd] = useState(existingRule?.endTime ?? shiftDefault.endTime);

  const createRule = useCreateShiftTimeRule(workspaceId, shiftPublicId);
  const updateRule = useUpdateShiftTimeRule(workspaceId, shiftPublicId);
  const deleteRule = useDeleteShiftTimeRule(workspaceId, shiftPublicId);
  const isPending = createRule.isPending || updateRule.isPending || deleteRule.isPending;

  const save = async () => {
    try {
      if (existingRule) {
        await updateRule.mutateAsync({
          publicId: existingRule.publicId,
          startTime: ruleStart,
          endTime: ruleEnd,
        });
      } else {
        await createRule.mutateAsync({ dayOfWeek, startTime: ruleStart, endTime: ruleEnd });
      }
      toast.success(t("shift.dayScheduleSaved", "{{day}} schedule saved", { day: dayLabel }));
      setEditing(false);
    } catch {
      toast.error(t("shift.dayScheduleError", "Failed to save the {{day}} schedule", { day: dayLabel }));
    }
  };

  const remove = async () => {
    if (!existingRule) return;
    try {
      await deleteRule.mutateAsync(existingRule.publicId);
      toast.success(t("shift.dayOverrideRemoved", "{{day}} override removed", { day: dayLabel }));
      setRuleStart(shiftDefault.startTime);
      setRuleEnd(shiftDefault.endTime);
      setEditing(false);
    } catch {
      toast.error(
        t("shift.dayOverrideRemoveError", "Failed to remove the {{day}} override", { day: dayLabel }),
      );
    }
  };

  const startEdit = () => {
    setRuleStart(existingRule?.startTime ?? shiftDefault.startTime);
    setRuleEnd(existingRule?.endTime ?? shiftDefault.endTime);
    setEditing(true);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-cream-3/30 px-3 py-2">
        <span className="w-16 shrink-0 text-[13.5px] font-medium text-text-primary">
          {dayLabelShort}
        </span>
        <CustomTimePicker value={ruleStart} onChange={setRuleStart} className="w-25" />
        <span className="text-[13px] text-text-tertiary">&ndash;</span>
        <CustomTimePicker value={ruleEnd} onChange={setRuleEnd} className="w-25" />
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            className="rounded-md bg-coffee/10 px-2.5 py-1 text-[13px] font-medium text-coffee transition-colors hover:bg-coffee/20 disabled:opacity-50"
          >
            {t("common.save", "Save")}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md px-2.5 py-1 text-[13px] font-medium text-text-tertiary transition-colors hover:text-text-secondary"
          >
            {t("common.cancel", "Cancel")}
          </button>
        </div>
      </div>
    );
  }

  if (existingRule) {
    return (
      <div className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-cream-3/30">
        <span className="w-16 shrink-0 text-[13.5px] font-medium text-text-primary">
          {dayLabelShort}
        </span>
        <span className="font-mono text-sm tabular-nums text-text-secondary">
          {existingRule.startTime} &ndash; {existingRule.endTime}
        </span>
        <span className="ml-1 rounded-full bg-coffee/8 px-1.5 py-px text-[11.5px] font-medium text-coffee">
          {t("shift.overrideBadge", "override")}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={startEdit}
            className="rounded-md px-2 py-0.5 text-[13px] font-medium text-text-secondary transition-colors hover:text-coffee"
          >
            {t("common.edit", "Edit")}
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={isPending}
            aria-label={t("shift.removeOverrideAria", "Remove override")}
            className="p-0.5 text-text-tertiary transition-colors hover:text-red disabled:opacity-50"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    );
  }

  // No rule for this day — show the shift defaults, muted.
  return (
    <div className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-cream-3/30">
      <span className="w-16 shrink-0 text-[13.5px] font-medium text-text-tertiary">
        {dayLabelShort}
      </span>
      <span className="font-mono text-sm tabular-nums text-text-tertiary">
        {shiftDefault.startTime} &ndash; {shiftDefault.endTime}
      </span>
      <span className="ml-1 text-[11.5px] text-text-tertiary">
        {t("shift.dayDefault", "default")}
      </span>
      <button
        type="button"
        onClick={startEdit}
        className="ml-auto flex items-center gap-1 rounded-md px-2 py-0.5 text-[13px] font-medium text-text-tertiary transition-colors hover:text-coffee"
      >
        <Plus size={10} />
        {t("shift.override", "Override")}
      </button>
    </div>
  );
}

/** "8h 30m", handling shifts that run past midnight. */
function shiftDuration(startTime: string, endTime: string): string {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const total = endMinutes > startMinutes ? endMinutes - startMinutes : 1440 - startMinutes + endMinutes;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
}
