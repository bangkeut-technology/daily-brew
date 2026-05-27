"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { CustomTimePicker } from "@/components/shared/CustomTimePicker";
import { CustomDatePicker } from "@/components/shared/CustomDatePicker";
import { Toggle } from "@/components/shared/Toggle";
import { useEmployees } from "@/hooks/useEmployees";
import { useCreateAttendance } from "@/hooks/useAttendance";
import type { AttendanceRecord } from "@/types/attendance";

const reasonClass =
  "w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[15px] text-text-primary outline-none transition-colors focus:border-coffee focus:ring-1 focus:ring-coffee/20";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  today: string;
  defaultDate: string;
  /** Called when the (employee, date) row already exists (409) — hand off to edit. */
  onCollision: (existing: AttendanceRecord) => void;
}

export function AttendanceCreateModal(props: Props) {
  const { open, onOpenChange } = props;
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-glass-border bg-glass-bg shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none backdrop-blur-xl">
          {open && <CreateForm {...props} />}
          <Dialog.Close className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-cream-3/40 hover:text-text-secondary">
            <X size={15} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CreateForm({ workspaceId, today, defaultDate, onOpenChange, onCollision }: Props) {
  const create = useCreateAttendance(workspaceId);
  const { data: employees } = useEmployees(workspaceId);

  const [employeePublicId, setEmployeePublicId] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [checkInAt, setCheckInAt] = useState("09:00");
  const [hasCheckout, setHasCheckout] = useState(false);
  const [checkOutAt, setCheckOutAt] = useState("17:00");
  const [reason, setReason] = useState("");

  const employeeOptions = (employees ?? [])
    .filter((e) => e.active)
    .map((e) => ({ value: e.publicId, label: e.name }));

  const canSave = employeePublicId && date && checkInAt && reason.trim().length > 0;

  const submit = () => {
    create.mutate(
      {
        employeePublicId,
        date,
        checkInAt,
        checkOutAt: hasCheckout ? checkOutAt : null,
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Attendance added");
          onOpenChange(false);
        },
        onError: (err) => {
          if (err instanceof AxiosError && err.response?.status === 409 && err.response.data) {
            // The row already exists — hand off to the edit modal on that record.
            onCollision(err.response.data as AttendanceRecord);
            onOpenChange(false);
            return;
          }
          toast.error(
            (err instanceof AxiosError && err.response?.data?.message) || "Could not add attendance",
          );
        },
      },
    );
  };

  return (
    <div className="p-6">
      <Dialog.Title className="font-serif text-[20px] font-semibold text-text-primary">
        Manual attendance
      </Dialog.Title>
      <Dialog.Description className="mt-1 text-sm text-text-secondary">
        Backfill a forgotten scan or broken-QR day.
      </Dialog.Description>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="emp" className="mb-1 block text-[13px] font-medium text-text-secondary">
            Employee
          </label>
          <CustomSelect
            id="emp"
            value={employeePublicId}
            onChange={setEmployeePublicId}
            options={employeeOptions}
            placeholder="Select employee"
          />
        </div>
        <div>
          <label htmlFor="date" className="mb-1 block text-[13px] font-medium text-text-secondary">
            Date
          </label>
          <CustomDatePicker
            id="date"
            value={date}
            onChange={setDate}
            todayOverride={today}
            isDateDisabled={(d) => d > today}
          />
        </div>
        <div>
          <label htmlFor="ci" className="mb-1 block text-[13px] font-medium text-text-secondary">
            Check-in
          </label>
          <CustomTimePicker id="ci" value={checkInAt} onChange={setCheckInAt} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-text-secondary">Add check-out</span>
          <Toggle checked={hasCheckout} onChange={setHasCheckout} />
        </div>
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
            placeholder="Forgot to scan"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
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
          Add
        </button>
      </div>
    </div>
  );
}
