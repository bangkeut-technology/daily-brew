"use client";

import { useState } from "react";
import { Pause, Pencil, Play, Plus, Trash2, Triangle } from "lucide-react";
import { toast } from "sonner";
import {
  useAdminCronSchedules,
  useDeleteAdminCronSchedule,
  useRunAdminCronSchedule,
  useUpdateAdminCronSchedule,
} from "@/hooks/useAdminCron";
import type { ScheduledCommand } from "@/types/admin-cron";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { CronScheduleModal } from "@/components/admin/CronScheduleModal";

const RUN_VARIANT = { success: "green", failed: "red", running: "amber" } as const;

export default function AdminCronPage() {
  const { data: schedules, isLoading } = useAdminCronSchedules();
  const runSchedule = useRunAdminCronSchedule();
  const updateSchedule = useUpdateAdminCronSchedule();
  const deleteSchedule = useDeleteAdminCronSchedule();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduledCommand | null>(null);
  const [target, setTarget] = useState<ScheduledCommand | null>(null);

  const run = (s: ScheduledCommand) =>
    runSchedule.mutate(s.id, {
      onSuccess: (r) => toast.success(`Ran ${s.name} (exit ${r.exitCode})`),
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
            onClick={() => { setEditing(null); setFormOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-coffee px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus size={16} />
            New schedule
          </button>
        }
      />

      {isLoading || !schedules ? (
        <p className="text-text-secondary">Loading…</p>
      ) : schedules.length === 0 ? (
        <GlassCard hover={false} className="p-8 text-center">
          <p className="text-text-secondary">No scheduled commands.</p>
        </GlassCard>
      ) : (
        <GlassCard hover={false} className="divide-y divide-cream-3/70">
          {schedules.map((s) => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-medium text-text-primary">
                  {s.name}
                  {s.disabled && <StatusBadge label="Disabled" variant="gray" />}
                  {s.lastRun && (
                    <StatusBadge label={s.lastRun.status} variant={RUN_VARIANT[s.lastRun.status]} />
                  )}
                </p>
                <p className="truncate text-sm text-text-tertiary">
                  <span className="font-mono">{s.cronExpression}</span> · {s.cronExpressionTranslated}
                </p>
                <p className="truncate font-mono text-xs text-text-tertiary">{s.command}{s.arguments ? ` ${s.arguments}` : ""}</p>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => run(s)} disabled={runSchedule.isPending} aria-label="Run now" className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-green/10 hover:text-green disabled:opacity-40">
                  <Play size={15} />
                </button>
                <button type="button" onClick={() => toggle(s)} aria-label={s.disabled ? "Enable" : "Disable"} className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-cream-3 hover:text-amber">
                  {s.disabled ? <Triangle size={15} /> : <Pause size={15} />}
                </button>
                <button type="button" onClick={() => { setEditing(s); setFormOpen(true); }} aria-label="Edit" className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-cream-3 hover:text-coffee">
                  <Pencil size={15} />
                </button>
                <button type="button" onClick={() => setTarget(s)} aria-label="Delete" className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-red/10 hover:text-red">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </GlassCard>
      )}

      <ConfirmModal
        open={target !== null}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Delete schedule"
        description={`Delete "${target?.name ?? "this schedule"}"? It will stop running.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteSchedule.isPending}
        onConfirm={() => {
          if (!target) return;
          deleteSchedule.mutate(target.id, {
            onSuccess: () => toast.success("Schedule deleted"),
            onError: () => toast.error("Could not delete schedule"),
          });
        }}
      />

      <CronScheduleModal open={formOpen} onOpenChange={setFormOpen} schedule={editing} />
    </div>
  );
}
