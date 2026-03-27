import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  useShifts,
  useCreateShift,
  useDeleteShift,
  useCreateShiftTimeRule,
  useUpdateShiftTimeRule,
  useDeleteShiftTimeRule,
} from '@/hooks/queries/useShifts';
import { usePlan } from '@/hooks/queries/usePlan';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { ChevronDown, ChevronUp, Crown, Clock, Trash2, Plus } from 'lucide-react';
import type { Shift, ShiftTimeRule } from '@/types';

export const Route = createFileRoute('/console/shifts/')({
  component: ShiftsPage,
});

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function ShiftsPage() {
  const { t } = useTranslation();
  const workspaceId = getWorkspacePublicId() || '';
  const { data: shifts, isLoading } = useShifts(workspaceId);
  const createShift = useCreateShift(workspaceId);
  const deleteShift = useDeleteShift(workspaceId);
  const { data: plan } = usePlan(workspaceId);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');

  // Track which shift card has its day schedule expanded
  const [selectedShift, setSelectedShift] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createShift.mutateAsync({ name, startTime, endTime });
      toast.success('Shift created');
      setShowForm(false);
      setName('');
    } catch {
      toast.error('Failed to create shift');
    }
  };

  const handleDelete = async (publicId: string) => {
    try {
      await deleteShift.mutateAsync(publicId);
      toast.success('Shift deleted');
      if (selectedShift === publicId) {
        setSelectedShift(null);
      }
    } catch {
      toast.error('Failed to delete shift');
    }
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light"
          >
            + {t('common.create')}
          </button>
        }
      />

      {showForm && (
        <GlassCard hover={false} className="mb-4 max-w-lg">
          <form onSubmit={handleCreate} className="p-5 space-y-3">
            <input
              type="text"
              placeholder="Shift name (e.g. Morning)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg text-[13.5px] bg-white/62 border border-cream-3 text-text-primary outline-none focus:border-coffee"
            />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
                  Start time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-[13px] bg-white/62 border border-cream-3 text-text-primary outline-none focus:border-coffee"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
                  End time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-[13px] bg-white/62 border border-cream-3 text-text-primary outline-none focus:border-coffee"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={createShift.isPending}
              className="px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50"
            >
              {createShift.isPending ? t('common.loading') : t('common.create')}
            </button>
          </form>
        </GlassCard>
      )}

      {/* Brew+ per-day schedules banner for free plan */}
      {plan && !plan.canUseShiftTimeRules && (
        <div className="mb-4">
          <GlassCard hover={false}>
            <div className="px-5 py-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber/10 flex-shrink-0">
                <Crown size={16} className="text-amber" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium text-text-primary">Per-day shift schedules</p>
                <p className="text-[11.5px] text-text-tertiary mt-0.5">
                  Override shift hours for specific days of the week. Available with Brew+.
                </p>
              </div>
              <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber flex-shrink-0">
                Brew+
              </span>
            </div>
          </GlassCard>
        </div>
      )}

      {isLoading ? (
        <p className="text-text-tertiary">{t('common.loading')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shifts?.map((shift) => (
            <ShiftCard
              key={shift.publicId}
              shift={shift}
              workspaceId={workspaceId}
              canUseTimeRules={plan?.canUseShiftTimeRules ?? false}
              isExpanded={selectedShift === shift.publicId}
              onToggleExpand={() => toggleShiftSchedule(shift.publicId)}
              onDelete={() => handleDelete(shift.publicId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── ShiftCard with collapsible day schedule ────────────────────────

interface ShiftCardProps {
  shift: Shift;
  workspaceId: string;
  canUseTimeRules: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
}

function ShiftCard({
  shift,
  workspaceId,
  canUseTimeRules,
  isExpanded,
  onToggleExpand,
  onDelete,
}: ShiftCardProps) {
  return (
    <GlassCard hover={!isExpanded}>
      <GlassCardHeader
        title={shift.name}
        action={
          <button
            onClick={onDelete}
            className="text-text-tertiary hover:text-red transition-colors bg-transparent border-none cursor-pointer p-1"
          >
            <Trash2 size={14} />
          </button>
        }
      />
      <div className="px-5 py-4 flex items-center gap-2 text-[13px] text-text-secondary">
        <Clock size={14} className="text-amber" />
        {shift.startTime} &mdash; {shift.endTime}
      </div>

      {/* Day schedule toggle */}
      <div className="border-t border-[#EBE2D6]/80">
        <button
          onClick={onToggleExpand}
          disabled={!canUseTimeRules}
          className={`w-full flex items-center justify-between px-5 py-3 text-[12px] font-medium transition-colors border-none cursor-pointer ${
            canUseTimeRules
              ? 'text-text-secondary hover:bg-cream-3/40 bg-transparent'
              : 'text-text-tertiary bg-transparent cursor-not-allowed'
          }`}
        >
          <span className="flex items-center gap-1.5">
            Day schedule
            {!canUseTimeRules && (
              <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber">
                Brew+
              </span>
            )}
            {canUseTimeRules && shift.timeRules.length > 0 && (
              <span className="text-[10px] font-medium px-1.5 py-px rounded-full bg-coffee/10 text-coffee">
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
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-white/40">
        <span className="text-[11.5px] font-medium text-text-primary w-16 flex-shrink-0">
          {dayLabel.slice(0, 3)}
        </span>
        <input
          type="time"
          value={ruleStart}
          onChange={(e) => setRuleStart(e.target.value)}
          className="px-2 py-1 rounded-md text-[12px] bg-white/62 border border-cream-3 text-text-primary outline-none focus:border-coffee w-[90px]"
        />
        <span className="text-[11px] text-text-tertiary">&ndash;</span>
        <input
          type="time"
          value={ruleEnd}
          onChange={(e) => setRuleEnd(e.target.value)}
          className="px-2 py-1 rounded-md text-[12px] bg-white/62 border border-cream-3 text-text-primary outline-none focus:border-coffee w-[90px]"
        />
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="text-[11px] font-medium px-2.5 py-1 rounded-md border-none cursor-pointer bg-coffee/10 text-coffee transition-colors hover:bg-coffee/20 disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-[11px] font-medium px-2.5 py-1 rounded-md border-none cursor-pointer bg-transparent text-text-tertiary transition-colors hover:text-text-secondary"
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
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-white/30 transition-colors group">
        <span className="text-[11.5px] font-medium text-text-primary w-16 flex-shrink-0">
          {dayLabel.slice(0, 3)}
        </span>
        <span className="text-[12px] font-mono text-text-secondary tabular-nums">
          {existingRule.startTime} &ndash; {existingRule.endTime}
        </span>
        <span className="text-[9.5px] font-medium px-1.5 py-px rounded-full bg-coffee/8 text-coffee ml-1">
          override
        </span>
        <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleStartEdit}
            className="text-[11px] font-medium px-2 py-0.5 rounded-md border-none cursor-pointer bg-transparent text-text-secondary transition-colors hover:text-coffee"
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
    <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-white/30 transition-colors group">
      <span className="text-[11.5px] font-medium text-text-tertiary w-16 flex-shrink-0">
        {dayLabel.slice(0, 3)}
      </span>
      <span className="text-[12px] font-mono text-text-tertiary tabular-nums">
        {shiftDefault.startTime} &ndash; {shiftDefault.endTime}
      </span>
      <span className="text-[9.5px] text-text-tertiary ml-1">default</span>
      <button
        onClick={handleStartEdit}
        className="flex items-center gap-1 ml-auto text-[11px] font-medium px-2 py-0.5 rounded-md border-none cursor-pointer bg-transparent text-text-tertiary transition-colors hover:text-coffee opacity-0 group-hover:opacity-100"
      >
        <Plus size={10} />
        Override
      </button>
    </div>
  );
}
