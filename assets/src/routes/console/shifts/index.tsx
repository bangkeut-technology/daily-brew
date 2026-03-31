import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  useShifts,
  useCreateShift,
  useUpdateShift,
  useDeleteShift,
  useCreateShiftTimeRule,
  useUpdateShiftTimeRule,
  useDeleteShiftTimeRule,
} from '@/hooks/queries/useShifts';
import { useEmployees, useUpdateEmployee } from '@/hooks/queries/useEmployees';
import { usePlan } from '@/hooks/queries/usePlan';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { Avatar } from '@/components/shared/Avatar';
import { CustomSelect } from '@/components/shared/CustomSelect';
import { CustomTimePicker } from '@/components/shared/CustomTimePicker';
import { UpgradeModal } from '@/components/shared/UpgradeModal';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import { ChevronDown, ChevronUp, Crown, Clock, Pencil, Trash2, Plus, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Shift, Employee, ShiftTimeRule } from '@/types';

export const Route = createFileRoute('/console/shifts/')({
  component: ShiftsPage,
});

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function ShiftsPage() {
  const { t } = useTranslation();
  const workspaceId = getWorkspacePublicId() || '';
  const { data: shifts, isLoading } = useShifts(workspaceId);
  const { data: employees } = useEmployees(workspaceId);
  const createShift = useCreateShift(workspaceId);
  const deleteShift = useDeleteShift(workspaceId);
  const { data: plan } = usePlan(workspaceId);
  const upgradeModal = useUpgradeModal();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [deleteTarget, setDeleteTarget] = useState<{ publicId: string; name: string } | null>(null);

  // Track which shift card has its day schedule expanded
  const [selectedShift, setSelectedShift] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newShift = await createShift.mutateAsync({ name, startTime, endTime });
      toast.success('Shift created');
      setShowForm(false);
      setName('');
      if (plan?.canUseShiftTimeRules) {
        setSelectedShift(newShift.publicId);
      }
    } catch {
      toast.error('Failed to create shift');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteShift.mutateAsync(deleteTarget.publicId);
      toast.success('Shift deleted');
      if (selectedShift === deleteTarget.publicId) {
        setSelectedShift(null);
      }
    } catch {
      toast.error('Failed to delete shift');
    }
    setDeleteTarget(null);
  };

  const toggleShiftSchedule = (publicId: string) => {
    setSelectedShift((prev) => (prev === publicId ? null : publicId));
  };

  return (
    <div className="page-enter">
      <PageHeader
        title={t('nav.shifts')}
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[15px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light"
          >
            + {t('common.create')}
          </button>
        }
      />

      <p className="text-[15px] text-text-secondary mb-5 -mt-2 leading-relaxed">
        Define your restaurant's working hours. Assign employees to shifts so DailyBrew can track late arrivals and early departures automatically.
      </p>

      {showForm && (
        <GlassCard hover={false} className="mb-4">
          <form onSubmit={handleCreate} className="p-5 space-y-3">
            <input
              id="shift-name"
              name="shiftName"
              type="text"
              placeholder="Shift name (e.g. Morning)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg text-[15.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee"
            />
            <div className="flex gap-3">
              <div className="flex-1">
                <label id="shift-start-label" className="block text-[13px] font-medium text-text-secondary mb-1">
                  Start time
                </label>
                <CustomTimePicker value={startTime} onChange={setStartTime} />
              </div>
              <div className="flex-1">
                <label id="shift-end-label" className="block text-[13px] font-medium text-text-secondary mb-1">
                  End time
                </label>
                <CustomTimePicker value={endTime} onChange={setEndTime} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={createShift.isPending}
                className="px-4 py-2 rounded-lg text-[15px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50"
              >
                {createShift.isPending ? t('common.loading') : t('common.create')}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setName(''); }}
                className="px-4 py-2 rounded-lg text-[15px] font-medium bg-glass-bg border border-cream-3 text-text-secondary cursor-pointer hover:bg-cream-3/40 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Espresso per-day schedules banner for free plan */}
      {plan && !plan.canUseShiftTimeRules && (
        <div className="mb-4">
          <GlassCard hover={false}>
            <div className="px-5 py-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber/10 shrink-0">
                <Crown size={16} className="text-amber" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-medium text-text-primary">Per-day shift schedules</p>
                <p className="text-[13.5px] text-text-tertiary mt-0.5">
                  Override shift hours for specific days of the week. Available with Espresso.
                </p>
              </div>
              <span className="text-[12.5px] font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber shrink-0">
                Espresso
              </span>
            </div>
          </GlassCard>
        </div>
      )}

      {isLoading ? (
        <p className="text-text-tertiary">{t('common.loading')}</p>
      ) : shifts?.length === 0 ? (
        <div className="border-[1.5px] border-dashed border-cream-3 rounded-2xl bg-glass-bg backdrop-blur-md flex flex-col items-center justify-center min-h-50 cursor-pointer transition-colors hover:bg-cream-3/30" onClick={() => setShowForm(true)}>
          <Clock size={28} className="text-text-tertiary mb-2" />
          <span className="text-[15px] text-text-tertiary">No shifts created yet</span>
          <span className="text-[13px] text-text-tertiary mt-1">Click to create your first shift</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shifts?.map((shift) => {
            const assignedEmployees = employees?.filter((e) => e.shiftPublicId === shift.publicId) ?? [];
            const unassignedEmployees = employees?.filter((e) => !e.shiftPublicId && e.active) ?? [];
            return (
              <ShiftCard
                key={shift.publicId}
                shift={shift}
                workspaceId={workspaceId}
                assignedEmployees={assignedEmployees}
                unassignedEmployees={unassignedEmployees}
                canUseTimeRules={plan?.canUseShiftTimeRules ?? false}
                isExpanded={selectedShift === shift.publicId}
                onToggleExpand={() => toggleShiftSchedule(shift.publicId)}
                onDelete={() => setDeleteTarget({ publicId: shift.publicId, name: shift.name })}
                onUpgradeClick={() => upgradeModal.openFor('shiftTimeRules')}
              />
            );
          })}
        </div>
      )}

      {upgradeModal.feature && (
        <UpgradeModal
          open={upgradeModal.isOpen}
          onOpenChange={(open) => { if (!open) upgradeModal.close(); }}
          feature={upgradeModal.feature}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={t('shift.deleteTitle', 'Delete shift')}
        description={t('shift.deleteConfirm', 'Delete the {{name}} shift? Employees assigned to this shift will be unassigned.', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('common.delete', 'Delete')}
        cancelLabel={t('common.cancel', 'Cancel')}
        variant="danger"
        loading={deleteShift.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

// ── ShiftCard with collapsible day schedule ────────────────────────

interface ShiftCardProps {
  shift: Shift;
  workspaceId: string;
  assignedEmployees: Employee[];
  unassignedEmployees: Employee[];
  canUseTimeRules: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  onUpgradeClick: () => void;
}

function ShiftCard({
  shift,
  workspaceId,
  assignedEmployees,
  unassignedEmployees,
  canUseTimeRules,
  isExpanded,
  onToggleExpand,
  onDelete,
  onUpgradeClick,
}: ShiftCardProps) {
  const { t } = useTranslation();
  const updateEmployee = useUpdateEmployee(workspaceId);
  const updateShift = useUpdateShift(workspaceId);
  const [showAssign, setShowAssign] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [unassignTarget, setUnassignTarget] = useState<{ publicId: string; name: string } | null>(null);
  const [editName, setEditName] = useState(shift.name);
  const [editStartTime, setEditStartTime] = useState(shift.startTime);
  const [editEndTime, setEditEndTime] = useState(shift.endTime);

  const handleStartEdit = () => {
    setEditName(shift.name);
    setEditStartTime(shift.startTime);
    setEditEndTime(shift.endTime);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    try {
      await updateShift.mutateAsync({
        publicId: shift.publicId,
        name: editName,
        startTime: editStartTime,
        endTime: editEndTime,
      });
      toast.success(t('shift.updated', 'Shift updated'));
      setIsEditing(false);
    } catch {
      toast.error(t('shift.updateError', 'Failed to update shift'));
    }
  };

  const handleAssign = async (employeePublicId: string) => {
    try {
      await updateEmployee.mutateAsync({
        publicId: employeePublicId,
        shiftPublicId: shift.publicId,
      });
      toast.success(t('shift.employeeAssigned', 'Employee assigned'));
      setShowAssign(false);
    } catch {
      toast.error(t('shift.assignError', 'Failed to assign employee'));
    }
  };

  const handleUnassign = async () => {
    if (!unassignTarget) return;
    try {
      await updateEmployee.mutateAsync({
        publicId: unassignTarget.publicId,
        shiftPublicId: null,
      });
      toast.success(t('shift.employeeUnassigned', 'Employee unassigned'));
    } catch {
      toast.error(t('shift.unassignError', 'Failed to unassign employee'));
    }
    setUnassignTarget(null);
  };

  // Calculate shift duration for display
  const [startH, startM] = shift.startTime.split(':').map(Number);
  const [endH, endM] = shift.endTime.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const durationMinutes = endMinutes > startMinutes ? endMinutes - startMinutes : (1440 - startMinutes) + endMinutes;
  const durationHours = Math.floor(durationMinutes / 60);
  const durationMins = durationMinutes % 60;

  return (
    <GlassCard hover={!isExpanded && !showAssign && !isEditing} className={isExpanded ? 'overflow-visible' : undefined}>
      {/* Header with time accent bar */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-linear-to-r from-amber to-coffee" />
        <div className="px-5 pt-5 pb-3">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Shift name"
                required
                className="w-full px-3 py-2 rounded-lg text-[15.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee"
              />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[13px] font-medium text-text-secondary mb-1">
                    Start time
                  </label>
                  <CustomTimePicker value={editStartTime} onChange={setEditStartTime} />
                </div>
                <div className="flex-1">
                  <label className="block text-[13px] font-medium text-text-secondary mb-1">
                    End time
                  </label>
                  <CustomTimePicker value={editEndTime} onChange={setEditEndTime} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={updateShift.isPending || !editName.trim()}
                  className="px-4 py-2 rounded-lg text-[15px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50 transition-colors"
                >
                  {updateShift.isPending ? t('common.loading') : t('common.save', 'Save')}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-lg text-[15px] font-medium bg-glass-bg border border-cream-3 text-text-secondary cursor-pointer hover:bg-cream-3/40 transition-colors"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[17px] font-semibold text-text-primary">{shift.name}</h3>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1.5 text-[15px] font-mono tabular-nums text-text-secondary">
                    <Clock size={13} className="text-amber" />
                    {shift.startTime} &ndash; {shift.endTime}
                  </div>
                  <span className="text-[12.5px] font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber">
                    {durationHours}h{durationMins > 0 ? ` ${durationMins}m` : ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleStartEdit}
                  className="text-text-tertiary hover:text-coffee transition-colors bg-transparent border-none cursor-pointer p-1.5 rounded-lg hover:bg-coffee/8"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={onDelete}
                  className="text-text-tertiary hover:text-red transition-colors bg-transparent border-none cursor-pointer p-1.5 rounded-lg hover:bg-red/8"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Employees section */}
      <div className="border-t border-cream-3/80 px-5 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <span className="flex items-center gap-1.5 text-[14px] font-medium text-text-secondary">
            <Users size={13} />
            {assignedEmployees.length} {assignedEmployees.length === 1 ? 'employee' : 'employees'}
          </span>
          <button
            onClick={() => setShowAssign(!showAssign)}
            className="text-[13px] font-medium text-coffee hover:text-coffee-light bg-transparent border-none cursor-pointer transition-colors flex items-center gap-0.5"
          >
            <Plus size={11} />
            {t('shift.assign', 'Assign')}
          </button>
        </div>

        {showAssign && (
          <div className="mb-3">
            <CustomSelect
              value=""
              onChange={(v) => { if (v) handleAssign(v); }}
              options={unassignedEmployees.map((e) => ({
                value: e.publicId,
                label: e.name,
              }))}
              placeholder={t('shift.selectEmployee', 'Select employee…')}
            />
          </div>
        )}

        {assignedEmployees.length === 0 ? (
          <p className="text-[13.5px] text-text-tertiary italic">
            No employees assigned. Assign staff to track their attendance against this shift's hours.
          </p>
        ) : (
          <div className="space-y-1.5">
            {assignedEmployees.map((emp, i) => (
              <div
                key={emp.publicId}
                className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-cream-3/30 transition-colors group"
              >
                <Avatar name={emp.name} index={i} size={24} />
                <span className="text-[14.5px] text-text-primary flex-1 truncate">
                  {emp.name}
                </span>
                <button
                  onClick={() => setUnassignTarget({ publicId: emp.publicId, name: emp.name })}
                  className="text-text-tertiary hover:text-red bg-transparent border-none cursor-pointer p-1 rounded-md hover:bg-red/8 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Day schedule toggle */}
      <div className="border-t border-cream-3/80">
        <button
          onClick={canUseTimeRules ? onToggleExpand : onUpgradeClick}
          className={cn(
            'w-full flex items-center justify-between px-5 py-3 text-[14px] font-medium transition-colors border-none cursor-pointer',
            canUseTimeRules
              ? 'text-text-secondary hover:bg-cream-3/40 bg-transparent'
              : 'text-text-tertiary bg-transparent hover:bg-amber/5',
          )}
        >
          <span className="flex items-center gap-1.5">
            Day schedule
            {!canUseTimeRules && (
              <span className="text-[12.5px] font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber">
                Espresso
              </span>
            )}
            {canUseTimeRules && shift.timeRules.length > 0 && (
              <span className="text-[12px] font-medium px-1.5 py-px rounded-full bg-coffee/10 text-coffee">
                {shift.timeRules.length}
              </span>
            )}
          </span>
          {canUseTimeRules &&
            (isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </button>

        {isExpanded && canUseTimeRules && (
          <DaySchedulePanel shift={shift} workspaceId={workspaceId} />
        )}
      </div>

      <ConfirmModal
        open={!!unassignTarget}
        onOpenChange={(open) => { if (!open) setUnassignTarget(null); }}
        title={t('shift.unassignTitle', 'Remove from shift')}
        description={t('shift.unassignConfirm', 'Remove {{name}} from the {{shift}} shift? Their attendance will no longer be tracked against this shift.', { name: unassignTarget?.name ?? '', shift: shift.name })}
        confirmLabel={t('shift.unassign', 'Remove')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        loading={updateEmployee.isPending}
        onConfirm={handleUnassign}
      />
    </GlassCard>
  );
}

// ── DaySchedulePanel — 7-row editor inside the shift card ──────────

interface DaySchedulePanelProps {
  shift: Shift;
  workspaceId: string;
}

function DaySchedulePanel({ shift, workspaceId }: DaySchedulePanelProps) {
  // Build a map of dayOfWeek => rule for quick lookup
  const rulesByDay: Record<number, ShiftTimeRule> = {};
  for (const rule of shift.timeRules) {
    rulesByDay[rule.dayOfWeek] = rule;
  }

  return (
    <div className="px-5 pb-4 space-y-1">
      {DAY_LABELS.map((dayLabel, index) => {
        const dayOfWeek = index + 1; // 1=Monday ... 7=Sunday
        const existingRule = rulesByDay[dayOfWeek];

        return (
          <DayRow
            key={dayOfWeek}
            dayLabel={dayLabel}
            dayOfWeek={dayOfWeek}
            existingRule={existingRule ?? null}
            shiftDefault={{ startTime: shift.startTime, endTime: shift.endTime }}
            workspaceId={workspaceId}
            shiftPublicId={shift.publicId}
          />
        );
      })}
    </div>
  );
}

// ── DayRow — a single day's override ───────────────────────────────

interface DayRowProps {
  dayLabel: string;
  dayOfWeek: number;
  existingRule: ShiftTimeRule | null;
  shiftDefault: { startTime: string; endTime: string };
  workspaceId: string;
  shiftPublicId: string;
}

function DayRow({
  dayLabel,
  dayOfWeek,
  existingRule,
  shiftDefault,
  workspaceId,
  shiftPublicId,
}: DayRowProps) {
  const [editing, setEditing] = useState(false);
  const [ruleStart, setRuleStart] = useState(existingRule?.startTime ?? shiftDefault.startTime);
  const [ruleEnd, setRuleEnd] = useState(existingRule?.endTime ?? shiftDefault.endTime);

  const createRule = useCreateShiftTimeRule(workspaceId, shiftPublicId);
  const updateRule = useUpdateShiftTimeRule(workspaceId, shiftPublicId);
  const deleteRule = useDeleteShiftTimeRule(workspaceId, shiftPublicId);

  const isPending = createRule.isPending || updateRule.isPending || deleteRule.isPending;

  const handleSave = async () => {
    try {
      if (existingRule) {
        await updateRule.mutateAsync({
          publicId: existingRule.publicId,
          startTime: ruleStart,
          endTime: ruleEnd,
        });
        toast.success(`${dayLabel} schedule updated`);
      } else {
        await createRule.mutateAsync({
          dayOfWeek,
          startTime: ruleStart,
          endTime: ruleEnd,
        });
        toast.success(`${dayLabel} schedule created`);
      }
      setEditing(false);
    } catch {
      toast.error(`Failed to save ${dayLabel} schedule`);
    }
  };

  const handleDelete = async () => {
    if (!existingRule) return;
    try {
      await deleteRule.mutateAsync(existingRule.publicId);
      toast.success(`${dayLabel} override removed`);
      setRuleStart(shiftDefault.startTime);
      setRuleEnd(shiftDefault.endTime);
      setEditing(false);
    } catch {
      toast.error(`Failed to remove ${dayLabel} override`);
    }
  };

  const handleStartEdit = () => {
    setRuleStart(existingRule?.startTime ?? shiftDefault.startTime);
    setRuleEnd(existingRule?.endTime ?? shiftDefault.endTime);
    setEditing(true);
  };

  // Editing mode
  if (editing) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-cream-3/30">
        <span className="text-[13.5px] font-medium text-text-primary w-16 shrink-0">
          {dayLabel.slice(0, 3)}
        </span>
        <CustomTimePicker value={ruleStart} onChange={setRuleStart} className="w-25" />
        <span className="text-[13px] text-text-tertiary">&ndash;</span>
        <CustomTimePicker value={ruleEnd} onChange={setRuleEnd} className="w-25" />
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="text-[13px] font-medium px-2.5 py-1 rounded-md border-none cursor-pointer bg-coffee/10 text-coffee transition-colors hover:bg-coffee/20 disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-[13px] font-medium px-2.5 py-1 rounded-md border-none cursor-pointer bg-transparent text-text-tertiary transition-colors hover:text-text-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Display mode — existing rule
  if (existingRule) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-cream-3/30 transition-colors group">
        <span className="text-[13.5px] font-medium text-text-primary w-16 shrink-0">
          {dayLabel.slice(0, 3)}
        </span>
        <span className="text-[14px] font-mono text-text-secondary tabular-nums">
          {existingRule.startTime} &ndash; {existingRule.endTime}
        </span>
        <span className="text-[11.5px] font-medium px-1.5 py-px rounded-full bg-coffee/8 text-coffee ml-1">
          override
        </span>
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={handleStartEdit}
            className="text-[13px] font-medium px-2 py-0.5 rounded-md border-none cursor-pointer bg-transparent text-text-secondary transition-colors hover:text-coffee"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-text-tertiary hover:text-red transition-colors bg-transparent border-none cursor-pointer p-0.5 disabled:opacity-50"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    );
  }

  // Display mode — no rule, show shift defaults muted
  return (
    <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-cream-3/30 transition-colors group">
      <span className="text-[13.5px] font-medium text-text-tertiary w-16 shrink-0">
        {dayLabel.slice(0, 3)}
      </span>
      <span className="text-[14px] font-mono text-text-tertiary tabular-nums">
        {shiftDefault.startTime} &ndash; {shiftDefault.endTime}
      </span>
      <span className="text-[11.5px] text-text-tertiary ml-1">default</span>
      <button
        onClick={handleStartEdit}
        className="flex items-center gap-1 ml-auto text-[13px] font-medium px-2 py-0.5 rounded-md border-none cursor-pointer bg-transparent text-text-tertiary transition-colors hover:text-coffee"
      >
        <Plus size={10} />
        Override
      </button>
    </div>
  );
}
