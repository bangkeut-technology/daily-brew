"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { CustomDatePicker } from "@/components/shared/CustomDatePicker";
import { CustomTimePicker } from "@/components/shared/CustomTimePicker";
import { Toggle } from "@/components/shared/Toggle";
import { useCreateLeaveRequest } from "@/hooks/useLeaveRequests";

const reasonClass =
  "w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[15px] text-text-primary outline-none transition-colors focus:border-coffee focus:ring-1 focus:ring-coffee/20";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  employeePublicId: string;
}

export function LeaveRequestModal(props: Props) {
  const { open, onOpenChange } = props;
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-glass-border bg-glass-bg shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none backdrop-blur-xl">
          {open && <RequestForm {...props} />}
          <Dialog.Close className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-cream-3/40 hover:text-text-secondary">
            <X size={15} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function RequestForm({ workspaceId, employeePublicId, onOpenChange }: Props) {
  const create = useCreateLeaveRequest(workspaceId);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [fullDay, setFullDay] = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [reason, setReason] = useState("");

  const canSave =
    startDate && endDate && startDate <= endDate && (fullDay || startTime <= endTime);

  const submit = () => {
    create.mutate(
      {
        employeePublicId,
        startDate,
        endDate,
        reason: reason.trim() || undefined,
        startTime: fullDay ? undefined : startTime,
        endTime: fullDay ? undefined : endTime,
      },
      {
        onSuccess: () => {
          toast.success("Leave request submitted");
          onOpenChange(false);
        },
        onError: (err) =>
          toast.error(
            (err instanceof AxiosError && err.response?.data?.message) ||
              "Could not submit leave request",
          ),
      },
    );
  };

  return (
    <div className="p-6">
      <Dialog.Title className="font-serif text-[20px] font-semibold text-text-primary">
        Request leave
      </Dialog.Title>
      <Dialog.Description className="mt-1 text-sm text-text-secondary">
        Submit time off for approval.
      </Dialog.Description>

      <div className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="from" className="mb-1 block text-[13px] font-medium text-text-secondary">
              From
            </label>
            <CustomDatePicker id="from" value={startDate} onChange={setStartDate} />
          </div>
          <div>
            <label htmlFor="to" className="mb-1 block text-[13px] font-medium text-text-secondary">
              To
            </label>
            <CustomDatePicker id="to" value={endDate} onChange={setEndDate} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-text-secondary">Full day</span>
          <Toggle checked={fullDay} onChange={setFullDay} />
        </div>
        {!fullDay && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="st" className="mb-1 block text-[13px] font-medium text-text-secondary">
                Start time
              </label>
              <CustomTimePicker id="st" value={startTime} onChange={setStartTime} />
            </div>
            <div>
              <label htmlFor="et" className="mb-1 block text-[13px] font-medium text-text-secondary">
                End time
              </label>
              <CustomTimePicker id="et" value={endTime} onChange={setEndTime} />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="reason" className="mb-1 block text-[13px] font-medium text-text-secondary">
            Reason (optional)
          </label>
          <input id="reason" className={reasonClass} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="cursor-pointer rounded-lg border border-cream-3 px-4 py-2 text-[15px] font-medium text-text-secondary transition-colors hover:bg-cream-3"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={!canSave || create.isPending}
          className="cursor-pointer rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
