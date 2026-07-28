"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  AlarmClock,
  History as HistoryIcon,
  Pause,
  Pencil,
  Play,
  Plus,
  Timer,
  Trash2,
  Triangle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/adminDate";
import {
  useAdminCronSchedules,
  useDeleteAdminCronSchedule,
  useRunAdminCronSchedule,
  useUpdateAdminCronSchedule,
} from "@/hooks/useAdminCron";
import type { CronLastRun, ScheduledCommand } from "@/types/admin-cron";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { CronScheduleModal } from "@/components/admin/CronScheduleModal";
import { CronHistorySheet, runAppearance } from "@/components/admin/CronHistorySheet";
import { Skeleton } from "@/components/admin/AdminDataStates";

const DAY_MS = 24 * 60 * 60 * 1000;

type Filter = "all" | "healthy" | "failed" | "disabled";

/** A schedule is exactly one of these — disabled wins over a stale failure. */
function classify(s: ScheduledCommand): Exclude<Filter, "all"> {
  if (s.disabled) return "disabled";
  if (s.lastRun?.status === "failed") return "failed";
  return "healthy";
}

/** Only recent failures are actionable; a job that failed last month and has since been paused isn't. */
function failedRecently(run: CronLastRun | null | undefined): boolean {
  if (!run || run.status !== "failed") return false;
  const started = new Date(run.startedAt).getTime();
  return !Number.isNaN(started) && Date.now() - started < DAY_MS;
}

export default function AdminCronPage() {
  const { data: schedules = [], isLoading } = useAdminCronSchedules();
  const runSchedule = useRunAdminCronSchedule();
  const updateSchedule = useUpdateAdminCronSchedule();
  const deleteSchedule = useDeleteAdminCronSchedule();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduledCommand | null>(null);
  const [historyFor, setHistoryFor] = useState<ScheduledCommand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScheduledCommand | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const out: Record<Filter, number> = {
      all: schedules.length,
      healthy: 0,
      failed: 0,
      disabled: 0,
    };
    for (const s of schedules) out[classify(s)]++;
    return out;
  }, [schedules]);

  const failed24 = useMemo(
    () => schedules.filter((s) => failedRecently(s.lastRun)).length,
    [schedules],
  );
  const enabledCount = schedules.filter((s) => !s.disabled).length;

  const nextUp = useMemo(() => {
    return schedules
      .filter((s) => !s.disabled && s.nextRunDate)
      .map((s) => ({ schedule: s, when: new Date(s.nextRunDate as string) }))
      .filter(({ when }) => !Number.isNaN(when.getTime()))
      .sort((a, b) => a.when.getTime() - b.when.getTime())[0];
  }, [schedules]);

  const visible = useMemo(
    () => (filter === "all" ? schedules : schedules.filter((s) => classify(s) === filter)),
    [schedules, filter],
  );

  const run = (s: ScheduledCommand) =>
    runSchedule.mutate(s.id, {
      onSuccess: (result) => toast.success(`Ran ${s.name} (exit ${result.exitCode})`),
      onError: () => toast.error("Run failed"),
    });

  const toggle = (s: ScheduledCommand) =>
    updateSchedule.mutate(
      { id: s.id, disabled: !s.disabled },
      { onError: () => toast.error("Could not update schedule") },
    );

  return (
    <div className="page-enter">
      <PageHeader
        title="Cron"
        action={
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-coffee px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-coffee-light"
          >
            <Plus size={14} />
            New schedule
          </button>
        }
      />

      <p className="-mt-2 mb-5 text-[13.5px] leading-relaxed text-text-secondary">
        Schedule and observe admin console commands. One master cron (
        <Code>scheduler:execute</Code>) fires every minute and dispatches every entry below. The
        command picker is limited to the safe-to-schedule allowlist in{" "}
        <Code>CronJobRegistry::JOBS</Code>.
      </p>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total schedules" value={schedules.length} icon={<AlarmClock size={16} />} />
        <KpiCard
          label="Enabled"
          value={enabledCount}
          icon={<Play size={16} />}
          hint={
            enabledCount === schedules.length
              ? "all running"
              : `${schedules.length - enabledCount} paused`
          }
        />
        <KpiCard
          label="Failed (24h)"
          value={failed24}
          icon={<Triangle size={16} className={failed24 > 0 ? "text-red" : undefined} />}
          hint={failed24 === 0 ? "all clear" : "needs attention"}
          tone={failed24 > 0 ? "danger" : "default"}
        />
        <KpiCard
          label="Next run"
          value={nextUp ? formatRelativeTime(nextUp.when.toISOString()) : "—"}
          icon={<Timer size={16} />}
          hint={nextUp?.schedule.name ?? "no upcoming runs"}
        />
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-xl border border-glass-border bg-glass-bg p-1">
          {(["all", "healthy", "failed", "disabled"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-3 py-1 text-[13px] font-medium transition-colors",
                filter === f
                  ? "bg-coffee text-white"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              <span className="capitalize">{f}</span>
              <span className="ml-1.5 tabular-nums opacity-70">{counts[f]}</span>
            </button>
          ))}
        </div>
        <p className="text-[12px] text-text-tertiary">
          Polls every 15s · click <span className="font-medium">Run now</span> to fire in-process
        </p>
      </div>

      {isLoading ? (
        <GlassCard hover={false}>
          <div className="divide-y divide-cream-3/60" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2 p-4">
                <Skeleton className="h-3.5 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        </GlassCard>
      ) : visible.length === 0 ? (
        <GlassCard hover={false} className="p-8 text-center">
          <p className="text-text-secondary">
            {schedules.length === 0
              ? "No scheduled commands."
              : `No ${filter} schedules right now.`}
          </p>
        </GlassCard>
      ) : (
        <GlassCard hover={false}>
          <div className="divide-y divide-cream-3/60">
            {visible.map((s) => (
              <ScheduleRow
                key={s.id}
                schedule={s}
                running={runSchedule.isPending}
                onRun={() => run(s)}
                onEdit={() => {
                  setEditing(s);
                  setFormOpen(true);
                }}
                onToggleDisabled={() => toggle(s)}
                onHistory={() => setHistoryFor(s)}
                onDelete={() => setDeleteTarget(s)}
              />
            ))}
          </div>
        </GlassCard>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete schedule?"
        description={`Delete "${deleteTarget?.name ?? "this schedule"}"? It will stop running.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleteSchedule.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteSchedule.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Schedule deleted");
              setDeleteTarget(null);
            },
            onError: () => toast.error("Could not delete schedule"),
          });
        }}
      />

      <CronScheduleModal open={formOpen} onOpenChange={setFormOpen} schedule={editing} />

      {historyFor && (
        <CronHistorySheet schedule={historyFor} onClose={() => setHistoryFor(null)} />
      )}
    </div>
  );
}

function ScheduleRow({
  schedule,
  running,
  onRun,
  onEdit,
  onToggleDisabled,
  onHistory,
  onDelete,
}: {
  schedule: ScheduledCommand;
  running: boolean;
  onRun: () => void;
  onEdit: () => void;
  onToggleDisabled: () => void;
  onHistory: () => void;
  onDelete: () => void;
}) {
  const status = schedule.lastRun?.status ?? null;
  const dotClass = schedule.disabled
    ? "bg-text-tertiary/40"
    : status === "failed"
      ? "bg-red"
      : status === "success"
        ? "bg-green"
        : status === "running"
          ? "animate-pulse bg-amber"
          : "bg-text-tertiary/40";

  return (
    <div className={cn("flex items-center gap-4 p-4", schedule.disabled && "opacity-60")}>
      <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", dotClass)} aria-hidden />

      <div className="grid min-w-0 flex-1 grid-cols-1 gap-x-6 gap-y-1 md:grid-cols-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-text-primary">{schedule.name}</div>
          <div className="truncate font-mono text-[11.5px] text-text-tertiary">
            {schedule.command}
          </div>
        </div>
        <div className="min-w-0">
          <div className="font-mono text-[12px] text-text-secondary">{schedule.cronExpression}</div>
          <div className="truncate text-[11.5px] capitalize text-text-tertiary">
            {schedule.cronExpressionTranslated}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
          <LastRunChip run={schedule.lastRun ?? null} />
          <NextRunChip nextRunDate={schedule.nextRunDate} disabled={schedule.disabled} />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={onRun}
          disabled={running || schedule.disabled}
          className="inline-flex items-center gap-1 rounded-lg bg-coffee px-2.5 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-coffee-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play size={12} />
          {running ? "Running…" : "Run now"}
        </button>
        <IconButton label="History" onClick={onHistory}>
          <HistoryIcon size={14} />
        </IconButton>
        <IconButton label="Edit" onClick={onEdit}>
          <Pencil size={14} />
        </IconButton>
        <IconButton label={schedule.disabled ? "Enable" : "Pause"} onClick={onToggleDisabled}>
          {schedule.disabled ? <Play size={14} /> : <Pause size={14} />}
        </IconButton>
        <IconButton label="Delete" onClick={onDelete} danger>
          <Trash2 size={14} />
        </IconButton>
      </div>
    </div>
  );
}

function LastRunChip({ run }: { run: CronLastRun | null }) {
  if (!run) return <span className="text-text-tertiary">never run</span>;
  const { Icon, color } = runAppearance(run.status);
  return (
    <span className={cn("inline-flex items-center gap-1", color)}>
      <Icon size={13} />
      <span className="capitalize">{run.status}</span>
      <span className="text-text-tertiary">· {formatRelativeTime(run.startedAt)}</span>
    </span>
  );
}

function NextRunChip({
  nextRunDate,
  disabled,
}: {
  nextRunDate: string | null;
  disabled: boolean;
}) {
  if (disabled) return <span className="text-text-tertiary">paused</span>;
  if (!nextRunDate) return <span className="text-text-tertiary">—</span>;
  return (
    <span className="inline-flex items-center gap-1 text-text-tertiary">
      <Timer size={13} />
      next {formatRelativeTime(nextRunDate)}
    </span>
  );
}

function KpiCard({
  label,
  value,
  icon,
  hint,
  tone = "default",
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  hint?: string;
  tone?: "default" | "danger";
}) {
  return (
    <GlassCard hover={false}>
      <div className="p-4">
        <div className="mb-1 flex items-center gap-2 text-[12px] font-medium uppercase tracking-wide text-text-tertiary">
          <span className={cn("text-text-tertiary", tone === "danger" && "text-red")}>{icon}</span>
          {label}
        </div>
        <p
          className={cn(
            "text-[22px] font-semibold tabular-nums",
            tone === "danger" ? "text-red" : "text-text-primary",
          )}
        >
          {value}
        </p>
        {hint && <p className="mt-1 text-[12px] text-text-tertiary">{hint}</p>}
      </div>
    </GlassCard>
  );
}

function IconButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "rounded-lg p-1.5 text-text-tertiary transition-colors",
        danger ? "hover:bg-red/8 hover:text-red" : "hover:bg-cream-3/40 hover:text-coffee",
      )}
    >
      {children}
    </button>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-cream-3/60 px-1 py-0.5 font-mono text-[12px]">{children}</code>
  );
}
