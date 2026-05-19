import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { formatDistanceToNow, formatDistanceToNowStrict } from 'date-fns';
import {
  AlarmClock,
  CheckCircle2,
  History as HistoryIcon,
  Pause,
  Pencil,
  Play,
  Plus,
  Timer,
  Trash2,
  Triangle,
  XCircle,
  X,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  useAdminCronJobs,
  useAdminCronRuns,
  useAdminCronSchedules,
  useCreateAdminCronSchedule,
  useDeleteAdminCronSchedule,
  useRunAdminCronSchedule,
  useUpdateAdminCronSchedule,
} from '@/hooks/queries/useAdminCron';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { CustomSelect } from '@/components/shared/CustomSelect';
import { Toggle } from '@/components/shared/Toggle';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { cn } from '@/lib/utils';
import type {
  CronJobOption,
  CronLastRun,
  CronScheduleInput,
  ScheduledCommand,
} from '@/types/admin-cron';

export const Route = createFileRoute('/admin/cron/')({
  component: AdminCronPage,
});

interface ScheduleFormState {
  id: number | null;
  name: string;
  command: string;
  cronExpression: string;
  arguments: string;
  priority: number;
  disabled: boolean;
}

const EMPTY_FORM: ScheduleFormState = {
  id: null,
  name: '',
  command: '',
  cronExpression: '',
  arguments: '',
  priority: 0,
  disabled: false,
};

type Filter = 'all' | 'healthy' | 'failed' | 'disabled';

function classifySchedule(s: ScheduledCommand): Exclude<Filter, 'all'> {
  if (s.disabled) return 'disabled';
  if (s.lastRun?.status === 'failed') return 'failed';
  return 'healthy';
}

function isFailedWithin24h(run: CronLastRun | null): boolean {
  if (run === null || run.status !== 'failed') return false;
  const started = new Date(run.startedAt).getTime();
  return Date.now() - started < 24 * 60 * 60 * 1000;
}

function relative(value: string | null | undefined, future: boolean): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return future ? `in ${formatDistanceToNowStrict(d)}` : `${formatDistanceToNow(d)} ago`;
}

function AdminCronPage() {
  const [form, setForm] = useState<ScheduleFormState | null>(null);
  const [historyFor, setHistoryFor] = useState<ScheduledCommand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScheduledCommand | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const { data: jobs = [] } = useAdminCronJobs();
  const { data: schedules = [], isLoading } = useAdminCronSchedules();
  const createMutation = useCreateAdminCronSchedule();
  const updateMutation = useUpdateAdminCronSchedule();
  const deleteMutation = useDeleteAdminCronSchedule();
  const runMutation = useRunAdminCronSchedule();

  const counts = useMemo(() => {
    const out: Record<Filter, number> = { all: schedules.length, healthy: 0, failed: 0, disabled: 0 };
    for (const s of schedules) out[classifySchedule(s)]++;
    return out;
  }, [schedules]);

  const failed24 = useMemo(() => schedules.filter((s) => isFailedWithin24h(s.lastRun)).length, [schedules]);
  const enabledCount = schedules.filter((s) => !s.disabled).length;
  const nextUp = useMemo(() => {
    const candidates = schedules
      .filter((s) => !s.disabled && s.nextRunDate)
      .map((s) => ({ schedule: s, when: new Date(s.nextRunDate as string) }))
      .filter(({ when }) => !Number.isNaN(when.getTime()))
      .sort((a, b) => a.when.getTime() - b.when.getTime());
    return candidates[0] ?? null;
  }, [schedules]);

  const visible = useMemo(() => {
    if (filter === 'all') return schedules;
    return schedules.filter((s) => classifySchedule(s) === filter);
  }, [schedules, filter]);

  const submitForm = async () => {
    if (form === null) return;
    const data: CronScheduleInput = {
      command: form.command,
      name: form.name,
      cronExpression: form.cronExpression,
      arguments: form.arguments,
      priority: form.priority,
      disabled: form.disabled,
    };
    try {
      if (form.id !== null) {
        await updateMutation.mutateAsync({ id: form.id, data });
        toast.success('Schedule updated');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Schedule created');
      }
      setForm(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to save schedule');
    }
  };

  return (
    <div>
      <PageHeader
        title="Cron"
        action={
          <button
            onClick={() => setForm(EMPTY_FORM)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[14px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light"
          >
            <Plus size={14} />
            New schedule
          </button>
        }
      />
      <p className="text-[13.5px] text-text-secondary mb-5 -mt-2 leading-relaxed">
        Schedule and observe admin console commands. One master cron (<code className="font-mono text-[12px] bg-cream-3/60 px-1 py-0.5 rounded">scheduler:execute</code>) fires every minute and dispatches every entry below. The command picker is limited to the safe-to-schedule allowlist in <code className="font-mono text-[12px] bg-cream-3/60 px-1 py-0.5 rounded">CronJobRegistry::JOBS</code>.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KpiCard label="Total schedules" value={schedules.length} icon={<AlarmClock size={16} />} />
        <KpiCard label="Enabled" value={enabledCount} icon={<Play size={16} />} hint={enabledCount === schedules.length ? 'all running' : `${schedules.length - enabledCount} paused`} />
        <KpiCard label="Failed (24h)" value={failed24} icon={<Triangle size={16} className={failed24 > 0 ? 'text-red' : ''} />} hint={failed24 === 0 ? 'all clear' : 'needs attention'} tone={failed24 > 0 ? 'danger' : 'default'} />
        <KpiCard label="Next run" value={nextUp ? relative(nextUp.when.toISOString(), true) : '—'} icon={<Timer size={16} />} hint={nextUp?.schedule.name ?? 'no upcoming runs'} />
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <div className="flex items-center gap-1 p-1 bg-glass-bg border border-glass-border rounded-xl">
          {(['all', 'healthy', 'failed', 'disabled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1 rounded-lg text-[13px] font-medium border-none cursor-pointer transition-colors',
                filter === f ? 'bg-coffee text-white' : 'bg-transparent text-text-secondary hover:text-text-primary',
              )}
            >
              <span className="capitalize">{f}</span>
              <span className="ml-1.5 opacity-70 tabular-nums">{counts[f]}</span>
            </button>
          ))}
        </div>
        <p className="text-[12px] text-text-tertiary">
          Polls every 15s · click <span className="font-medium">Run now</span> to fire in-process
        </p>
      </div>

      {isLoading ? (
        <GlassCard hover={false}><div className="p-8 text-center text-[14px] text-text-tertiary">Loading…</div></GlassCard>
      ) : visible.length === 0 ? (
        <GlassCard hover={false}>
          <div className="p-8 text-center text-[14px] text-text-tertiary space-y-3">
            <p>{filter === 'all' ? 'No schedules yet.' : `No ${filter} schedules.`}</p>
            {filter === 'all' && (
              <button
                onClick={() => setForm(EMPTY_FORM)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13.5px] font-medium bg-glass-bg border border-cream-3 text-text-primary cursor-pointer hover:bg-cream-3/40"
              >
                <Plus size={13} />
                Add the first schedule
              </button>
            )}
          </div>
        </GlassCard>
      ) : (
        <GlassCard hover={false}>
          <div className="divide-y divide-cream-3/60">
            {visible.map((s) => (
              <ScheduleRow
                key={s.id}
                schedule={s}
                running={runMutation.isPending && runMutation.variables === s.id}
                onRun={async () => {
                  try {
                    const result = await runMutation.mutateAsync(s.id);
                    toast[result.exitCode === 0 ? 'success' : 'error'](
                      result.exitCode === 0 ? 'Command finished successfully' : `Command exited with code ${result.exitCode}`,
                    );
                  } catch (e: any) {
                    toast.error(e?.response?.data?.message ?? 'Failed to run command');
                  }
                }}
                onEdit={() =>
                  setForm({
                    id: s.id,
                    name: s.name,
                    command: s.command,
                    cronExpression: s.cronExpression,
                    arguments: s.arguments ?? '',
                    priority: s.priority,
                    disabled: s.disabled,
                  })
                }
                onToggleDisabled={async () => {
                  try {
                    await updateMutation.mutateAsync({ id: s.id, data: { disabled: !s.disabled } });
                    toast.success(s.disabled ? 'Schedule resumed' : 'Schedule paused');
                  } catch {
                    toast.error('Failed to toggle schedule');
                  }
                }}
                onHistory={() => setHistoryFor(s)}
                onDelete={() => setDeleteTarget(s)}
              />
            ))}
          </div>
        </GlassCard>
      )}

      {form !== null && (
        <ScheduleFormDialog
          form={form}
          jobs={jobs}
          pending={createMutation.isPending || updateMutation.isPending}
          onChange={setForm}
          onClose={() => setForm(null)}
          onSubmit={submitForm}
        />
      )}

      {historyFor !== null && (
        <HistorySheet schedule={historyFor} onClose={() => setHistoryFor(null)} />
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete schedule?"
        description={`Removes "${deleteTarget?.name ?? ''}" from the scheduler. Past audit runs in daily_brew_admin_cron_runs are kept.`}
        confirmLabel="Delete"
        cancelLabel="Keep"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await deleteMutation.mutateAsync(deleteTarget.id);
            toast.success('Schedule deleted');
            setDeleteTarget(null);
          } catch {
            toast.error('Failed to delete schedule');
          }
        }}
      />
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  hint,
  tone = 'default',
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  hint?: string;
  tone?: 'default' | 'danger';
}) {
  return (
    <GlassCard hover={false}>
      <div className="p-4">
        <div className="flex items-center gap-2 text-[12px] uppercase tracking-wide text-text-tertiary font-medium mb-1">
          <span className={cn('text-text-tertiary', tone === 'danger' && 'text-red')}>{icon}</span>
          {label}
        </div>
        <p className={cn('text-[22px] font-semibold tabular-nums', tone === 'danger' ? 'text-red' : 'text-text-primary')}>{value}</p>
        {hint && <p className="text-[12px] text-text-tertiary mt-1">{hint}</p>}
      </div>
    </GlassCard>
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
    ? 'bg-text-tertiary/40'
    : status === 'failed'
      ? 'bg-red'
      : status === 'success'
        ? 'bg-green'
        : status === 'running'
          ? 'bg-amber animate-pulse'
          : 'bg-text-tertiary/40';

  return (
    <div className={cn('flex items-center gap-4 p-4', schedule.disabled && 'opacity-60')}>
      <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', dotClass)} aria-hidden="true" />

      <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1">
        <div className="min-w-0">
          <div className="text-[14px] font-medium text-text-primary truncate">{schedule.name}</div>
          <div className="font-mono text-[11.5px] text-text-tertiary truncate">{schedule.command}</div>
        </div>
        <div className="min-w-0">
          <div className="font-mono text-[12px] text-text-secondary">{schedule.cronExpression}</div>
          <div className="text-[11.5px] text-text-tertiary capitalize truncate">{schedule.cronExpressionTranslated}</div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
          <LastRunChip run={schedule.lastRun ?? null} />
          <NextRunChip nextRunDate={schedule.nextRunDate} disabled={schedule.disabled} />
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onRun}
          disabled={running || schedule.disabled}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play size={12} />
          {running ? 'Running…' : 'Run now'}
        </button>
        <button
          onClick={onHistory}
          aria-label="History"
          title="History"
          className="p-1.5 rounded-lg text-text-tertiary bg-transparent border-none cursor-pointer hover:text-coffee hover:bg-cream-3/40"
        >
          <HistoryIcon size={14} />
        </button>
        <button
          onClick={onEdit}
          aria-label="Edit"
          title="Edit"
          className="p-1.5 rounded-lg text-text-tertiary bg-transparent border-none cursor-pointer hover:text-coffee hover:bg-cream-3/40"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onToggleDisabled}
          aria-label={schedule.disabled ? 'Enable' : 'Pause'}
          title={schedule.disabled ? 'Enable' : 'Pause'}
          className="p-1.5 rounded-lg text-text-tertiary bg-transparent border-none cursor-pointer hover:text-coffee hover:bg-cream-3/40"
        >
          {schedule.disabled ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <button
          onClick={onDelete}
          aria-label="Delete"
          title="Delete"
          className="p-1.5 rounded-lg text-text-tertiary bg-transparent border-none cursor-pointer hover:text-red hover:bg-red/8"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function LastRunChip({ run }: { run: CronLastRun | null }) {
  if (run === null) return <span className="text-text-tertiary">never run</span>;
  const Icon = run.status === 'success' ? CheckCircle2 : run.status === 'failed' ? XCircle : Timer;
  const color = run.status === 'success' ? 'text-green' : run.status === 'failed' ? 'text-red' : 'text-amber';
  return (
    <span className={cn('inline-flex items-center gap-1', color)}>
      <Icon size={13} />
      <span className="capitalize">{run.status}</span>
      <span className="text-text-tertiary">· {relative(run.startedAt, false)}</span>
    </span>
  );
}

function NextRunChip({ nextRunDate, disabled }: { nextRunDate: string | null; disabled: boolean }) {
  if (disabled) return <span className="text-text-tertiary">paused</span>;
  if (!nextRunDate) return <span className="text-text-tertiary">—</span>;
  return (
    <span className="inline-flex items-center gap-1 text-text-tertiary">
      <Timer size={13} />
      next {relative(nextRunDate, true)}
    </span>
  );
}

function ScheduleFormDialog({
  form,
  jobs,
  pending,
  onChange,
  onClose,
  onSubmit,
}: {
  form: ScheduleFormState;
  jobs: CronJobOption[];
  pending: boolean;
  onChange: (next: ScheduleFormState) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const isEdit = form.id !== null;
  const selectedJob = jobs.find((j) => j.command === form.command);

  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-[460px] bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="p-5 border-b border-cream-3/60 flex items-center justify-between">
            <div>
              <Dialog.Title className="text-[17px] font-semibold text-text-primary font-serif">
                {isEdit ? 'Edit schedule' : 'New schedule'}
              </Dialog.Title>
              <Dialog.Description className="text-[13px] text-text-tertiary mt-0.5">
                Commands are restricted to the admin allowlist.
              </Dialog.Description>
            </div>
            <Dialog.Close className="w-7 h-7 rounded-lg flex items-center justify-center bg-transparent border-none text-text-tertiary hover:text-coffee hover:bg-cream-3/40 cursor-pointer">
              <X size={14} />
            </Dialog.Close>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label htmlFor="cron-command" className="block text-[13px] font-medium text-text-secondary mb-1">Command</label>
              {isEdit ? (
                <div className="w-full px-3 py-2 rounded-lg text-[14px] bg-cream-3/40 border border-cream-3 text-text-secondary font-mono cursor-not-allowed">
                  {form.command}
                </div>
              ) : (
                <CustomSelect
                  value={form.command}
                  onChange={(value) => {
                    const job = jobs.find((j) => j.command === value);
                    onChange({
                      ...form,
                      command: value,
                      cronExpression: form.cronExpression === '' && job ? job.suggestedCron : form.cronExpression,
                      name: form.name === '' && job ? job.label : form.name,
                    });
                  }}
                  options={jobs.map((j) => ({ value: j.command, label: j.label }))}
                  placeholder="Pick a command"
                />
              )}
              {selectedJob && <p className="text-[12px] text-text-tertiary mt-1 leading-relaxed">{selectedJob.description}</p>}
            </div>

            <div>
              <label htmlFor="cron-name" className="block text-[13px] font-medium text-text-secondary mb-1">Name</label>
              <input
                id="cron-name"
                name="name"
                type="text"
                value={form.name}
                onChange={(e) => onChange({ ...form, name: e.target.value })}
                placeholder="A descriptive label"
                className="w-full px-3 py-2 rounded-lg text-[14px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee"
              />
            </div>

            <div>
              <label htmlFor="cron-expr" className="block text-[13px] font-medium text-text-secondary mb-1">Cron expression</label>
              <input
                id="cron-expr"
                name="cronExpression"
                type="text"
                value={form.cronExpression}
                onChange={(e) => onChange({ ...form, cronExpression: e.target.value })}
                placeholder="0 2 * * *"
                className="w-full px-3 py-2 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee font-mono"
              />
            </div>

            <div>
              <label htmlFor="cron-args" className="block text-[13px] font-medium text-text-secondary mb-1">Arguments (optional)</label>
              <textarea
                id="cron-args"
                name="arguments"
                value={form.arguments}
                onChange={(e) => onChange({ ...form, arguments: e.target.value })}
                placeholder="--option=value"
                rows={2}
                className="w-full px-3 py-2 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee font-mono"
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="cron-disabled" className="text-[13.5px] text-text-primary cursor-pointer">Disabled</label>
              <Toggle id="cron-disabled" checked={form.disabled} onChange={(v) => onChange({ ...form, disabled: v })} />
            </div>
          </div>

          <div className="p-5 border-t border-cream-3/60 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              disabled={pending}
              className="px-3 py-1.5 rounded-lg text-[13.5px] font-medium bg-glass-bg border border-cream-3 text-text-primary cursor-pointer hover:bg-cream-3/40 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={pending}
              className="px-3 py-1.5 rounded-lg text-[13.5px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50"
            >
              {pending ? 'Saving…' : isEdit ? 'Save' : 'Create'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function HistorySheet({ schedule, onClose }: { schedule: ScheduledCommand; onClose: () => void }) {
  const { data: runs = [], isLoading } = useAdminCronRuns(schedule.command);

  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50" />
        <Dialog.Content className="fixed right-0 top-0 bottom-0 z-50 w-[calc(100%-2rem)] sm:w-[560px] bg-cream-1 border-l border-cream-3 overflow-y-auto outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-right">
          <GlassCardHeader
            title={`History — ${schedule.name}`}
            action={
              <Dialog.Close className="w-7 h-7 rounded-lg flex items-center justify-center bg-transparent border-none text-text-tertiary hover:text-coffee hover:bg-cream-3/40 cursor-pointer">
                <X size={15} />
              </Dialog.Close>
            }
          />
          <div className="px-5 -mt-1 mb-3">
            <code className="font-mono text-[12px] text-text-tertiary">{schedule.command}</code>
          </div>
          <div className="px-5 pb-6 space-y-3">
            {isLoading ? (
              <p className="text-[13.5px] text-text-tertiary">Loading…</p>
            ) : runs.length === 0 ? (
              <p className="text-[13.5px] text-text-tertiary">No runs recorded yet.</p>
            ) : (
              runs.map((r) => <RunCard key={r.publicId} run={r} />)
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function RunCard({ run }: { run: CronLastRun }) {
  const Icon = run.status === 'success' ? CheckCircle2 : run.status === 'failed' ? XCircle : Timer;
  const color = run.status === 'success' ? 'text-green' : run.status === 'failed' ? 'text-red' : 'text-amber';
  return (
    <GlassCard hover={false}>
      <div className="p-3.5 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className={cn('inline-flex items-center gap-1.5 text-[13.5px] font-medium', color)}>
            <Icon size={14} />
            <span className="capitalize">{run.status}</span>
          </span>
          <span className="text-[12px] text-text-tertiary">{relative(run.startedAt, false)}</span>
        </div>
        <div className="text-[12px] text-text-tertiary">
          Exit code: <span className="font-mono">{run.exitCode ?? '—'}</span>
          {run.triggeredByEmail && (
            <>{' · triggered by '}<span className="font-mono">{run.triggeredByEmail}</span></>
          )}
        </div>
        {run.outputTail && (
          <pre className="bg-cream-3/40 rounded p-3 text-[11.5px] font-mono whitespace-pre-wrap overflow-x-auto max-h-64">
            {run.outputTail}
          </pre>
        )}
      </div>
    </GlassCard>
  );
}
