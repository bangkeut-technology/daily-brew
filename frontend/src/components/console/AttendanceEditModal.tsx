"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { toast } from "sonner";
import { CustomTimePicker } from "@/components/shared/CustomTimePicker";
import { Toggle } from "@/components/shared/Toggle";
import { formatTimeInTz } from "@/lib/timezone";
import { useOverrideAttendance } from "@/hooks/useAttendance";
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

export function AttendanceEditModal({ open, onOpenChange, workspaceId, tz, record }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-glass-border bg-glass-bg shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none backdrop-blur-xl">
          {open && record && (
            <EditForm
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

function EditForm({
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
  const override = useOverrideAttendance(workspaceId);
  const hadCheckout = record.checkOutAt != null;

  const [checkInAt, setCheckInAt] = useState(
    record.checkInAt ? formatTimeInTz(record.checkInAt, tz) : "09:00",
  );
  const [hasCheckout, setHasCheckout] = useState(hadCheckout);
  const [checkOutAt, setCheckOutAt] = useState(
    record.checkOutAt ? formatTimeInTz(record.checkOutAt, tz) : "17:00",
  );
  const [reason, setReason] = useState("");

  // A wrong check-out is fixed by editing it, not by clearing it (CLAUDE.md UI guard).
  const clearingRealCheckout = hadCheckout && !hasCheckout;
  const canSave = reason.trim().length > 0 && !clearingRealCheckout;

  const submit = () => {
    override.mutate(
      {
        publicId: record.publicId,
        payload: {
          checkInAt,
          checkOutAt: hasCheckout ? checkOutAt : null,
          reason: reason.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Attendance updated");
          onDone();
        },
        onError: () => toast.error("Could not update attendance"),
      },
    );
  };

  return (
    <div className="p-6">
      <Dialog.Title className="font-serif text-[20px] font-semibold text-text-primary">
        Edit attendance
      </Dialog.Title>
      <Dialog.Description className="mt-1 text-sm text-text-secondary">
        {record.employeeName} · {record.date}
      </Dialog.Description>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="ci" className="mb-1 block text-[13px] font-medium text-text-secondary">
            Check-in
          </label>
          <CustomTimePicker id="ci" value={checkInAt} onChange={setCheckInAt} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-text-secondary">Has check-out</span>
          <Toggle checked={hasCheckout} onChange={setHasCheckout} />
        </div>
        {clearingRealCheckout && (
          <p className="text-[12.5px] text-red">
            To fix a wrong check-out, edit the time — don&apos;t clear it.
          </p>
        )}
        {hasCheckout && (
          <div>
            <label htmlFor="co" className="mb-1 block text-[13px] font-medium text-text-secondary">
              Check-out
            </label>
            <CustomTimePicker id="co" value={checkOutAt} onChange={setCheckOutAt} />
          </div>
        )}

        <div>
          <label htmlFor="reason" className="mb-1 block text-[13px] font-medium text-text-secondary">
            Reason
          </label>
          <input
            id="reason"
            className={reasonClass}
            placeholder="Forgot to check out"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
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
          disabled={!canSave || override.isPending}
          className="cursor-pointer rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
}
