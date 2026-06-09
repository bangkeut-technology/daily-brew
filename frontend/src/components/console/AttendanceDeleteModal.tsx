"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { formatTimeInTz } from "@/lib/timezone";
import { useDeleteAttendance } from "@/hooks/useAttendance";
import type { AttendanceRecord } from "@/types/attendance";

const reasonClass =
  "w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[15px] text-text-primary outline-none transition-colors focus:border-coffee focus:ring-1 focus:ring-coffee/20";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  tz: string;
  record: AttendanceRecord | null;
}

export function AttendanceDeleteModal({ open, onOpenChange, workspaceId, tz, record }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-glass-border bg-glass-bg shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none backdrop-blur-xl">
          {open && record && (
            <DeleteForm
              key={record.publicId}
              record={record}
              workspaceId={workspaceId}
              tz={tz}
              onDone={() => onOpenChange(false)}
            />
          )}
          <Dialog.Close className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-cream-3/40 hover:text-text-secondary">
            <X size={15} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DeleteForm({
  record,
  workspaceId,
  tz,
  onDone,
}: {
  record: AttendanceRecord;
  workspaceId: string;
  tz: string;
  onDone: () => void;
}) {
  const del = useDeleteAttendance(workspaceId);
  const [reason, setReason] = useState("");
  const canSubmit = reason.trim().length > 0;

  const submit = () => {
    del.mutate(
      { publicId: record.publicId, reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success("Attendance removed");
          onDone();
        },
        onError: () => toast.error("Could not remove attendance"),
      },
    );
  };

  const scanLine =
    record.checkInAt || record.checkOutAt
      ? `${record.checkInAt ? formatTimeInTz(record.checkInAt, tz) : "—"}${
          record.checkOutAt ? ` → ${formatTimeInTz(record.checkOutAt, tz)}` : ""
        }`
      : null;

  return (
    <div className="p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red/10">
          <AlertTriangle size={18} className="text-red" />
        </div>
        <div className="flex-1">
          <Dialog.Title className="font-serif text-[18px] font-semibold text-text-primary">
            Remove attendance?
          </Dialog.Title>
          <Dialog.Description className="mt-0.5 text-sm text-text-secondary">
            {record.employeeName} · {record.date}
          </Dialog.Description>
        </div>
      </div>

      {scanLine && (
        <div className="mt-4 rounded-lg bg-cream-3/30 px-3 py-2 font-mono text-[13px] tabular-nums text-text-tertiary">
          {scanLine}
        </div>
      )}

      <p className="mt-4 text-[13.5px] leading-relaxed text-text-secondary">
        The record stays in the log as a tombstone for audit. It drops out of stats and exports. A new
        scan or manual entry on the same day will replace it.
      </p>

      <div className="mt-4">
        <label htmlFor="void-reason" className="mb-1 block text-[13px] font-medium text-text-secondary">
          Reason
        </label>
        <input
          id="void-reason"
          className={reasonClass}
          placeholder="Wrong day — employee didn't work this shift"
          value={reason}
          maxLength={255}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onDone}
          className="cursor-pointer rounded-lg border border-cream-3 px-4 py-2 text-[15px] font-medium text-text-secondary transition-colors hover:bg-cream-3"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit || del.isPending}
          className="cursor-pointer rounded-lg border-none bg-red px-4 py-2 text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {del.isPending ? "Removing…" : "Remove"}
        </button>
      </div>
    </div>
  );
}
