"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CheckCircle2, Timer, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/adminDate";
import { useAdminCronRuns } from "@/hooks/useAdminCron";
import type { CronLastRun, ScheduledCommand } from "@/types/admin-cron";
import { GlassCard, GlassCardHeader } from "@/components/shared/GlassCard";
import { Skeleton } from "@/components/admin/AdminDataStates";

/** Side sheet listing recent runs of one command, with captured output. */
export function CronHistorySheet({
  schedule,
  onClose,
}: {
  schedule: ScheduledCommand;
  onClose: () => void;
}) {
  const { data: runs = [], isLoading } = useAdminCronRuns(schedule.command);

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed bottom-0 right-0 top-0 z-50 w-[calc(100%-2rem)] overflow-y-auto border-l border-cream-3 bg-cream outline-none sm:w-[560px]">
          <GlassCardHeader
            title={`History — ${schedule.name}`}
            action={
              <Dialog.Close
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-cream-3/40 hover:text-coffee"
              >
                <X size={15} />
              </Dialog.Close>
            }
          />
          <div className="-mt-1 mb-3 px-5">
            <code className="font-mono text-[12px] text-text-tertiary">{schedule.command}</code>
          </div>
          <div className="space-y-3 px-5 pb-6">
            {isLoading ? (
              <div className="space-y-3" aria-busy="true">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-2xl" />
                ))}
              </div>
            ) : runs.length === 0 ? (
              <p className="text-[13.5px] text-text-tertiary">No runs recorded yet.</p>
            ) : (
              runs.map((run) => <RunCard key={run.publicId} run={run} />)
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function RunCard({ run }: { run: CronLastRun }) {
  const { Icon, color } = runAppearance(run.status);
  return (
    <GlassCard hover={false}>
      <div className="space-y-2 p-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className={cn("inline-flex items-center gap-1.5 text-[13.5px] font-medium", color)}>
            <Icon size={14} />
            <span className="capitalize">{run.status}</span>
          </span>
          <span className="text-[12px] text-text-tertiary">
            {formatRelativeTime(run.startedAt)}
          </span>
        </div>
        <div className="text-[12px] text-text-tertiary">
          Exit code: <span className="font-mono">{run.exitCode ?? "—"}</span>
          {run.triggeredByEmail && (
            <>
              {" · triggered by "}
              <span className="font-mono">{run.triggeredByEmail}</span>
            </>
          )}
        </div>
        {run.outputTail && (
          <pre className="max-h-64 overflow-x-auto whitespace-pre-wrap rounded bg-cream-3/40 p-3 font-mono text-[11.5px]">
            {run.outputTail}
          </pre>
        )}
      </div>
    </GlassCard>
  );
}

export function runAppearance(status: CronLastRun["status"]) {
  if (status === "success") return { Icon: CheckCircle2, color: "text-green" };
  if (status === "failed") return { Icon: XCircle, color: "text-red" };
  return { Icon: Timer, color: "text-amber" };
}
