"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { CustomTimePicker } from "@/components/shared/CustomTimePicker";
import { NextDayBadge } from "@/components/shared/NextDayBadge";
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
  const { t } = useTranslation();
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

  // A check-out earlier than the check-in means the shift ran past midnight —
  // the backend rolls it onto date + 1 (AttendanceService::parseCheckOut), but
  // only when the employee's shift for that date is actually overnight. Say so
  // here so "02:00" doesn't look like it will land eight hours before the start.
  const checkOutIsNextDay = hasCheckout && checkOutAt < checkInAt;

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
          toast.success(t("attendance.createSuccess", "Attendance added"));
          onOpenChange(false);
        },
        onError: (err) => {
          // The 409 body is `{ error, message, code, existing }` — the record
          // is under `existing`, not the body itself. Handing over the wrapper
          // opens the edit modal on an object with no publicId or date.
          const existing =
            err instanceof AxiosError && err.response?.status === 409
              ? (err.response.data?.existing as AttendanceRecord | undefined)
              : undefined;
          if (existing) {
            toast(
              t(
                "attendance.alreadyExistsSwitchToEdit",
                "A record already exists for that day — opening it to edit.",
              ),
            );
            onCollision(existing);
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
        {t("attendance.createTitle", "Add attendance")}
      </Dialog.Title>
      <Dialog.Description className="mt-1 text-sm text-text-secondary">
        {t("attendance.createDescription", "Record a check-in for a day the employee missed scanning.")}
      </Dialog.Description>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="emp" className="mb-1 block text-[13px] font-medium text-text-secondary">
            {t("attendance.employee", "Employee")}
          </label>
          <CustomSelect
            id="emp"
            value={employeePublicId}
            onChange={setEmployeePublicId}
            options={employeeOptions}
            placeholder={t("attendance.selectEmployee", "Select employee")}
          />
        </div>
        <div>
          <label htmlFor="date" className="mb-1 block text-[13px] font-medium text-text-secondary">
            {t("attendance.date", "Date")}
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
            {t("attendance.checkInTime", "Check-in")}
          </label>
          <CustomTimePicker id="ci" value={checkInAt} onChange={setCheckInAt} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-text-secondary">{t("attendance.hasCheckOut", "Has check-out")}</span>
          <Toggle checked={hasCheckout} onChange={setHasCheckout} />
        </div>
        {hasCheckout && (
          <div>
            <label htmlFor="co" className="mb-1 block text-[13px] font-medium text-text-secondary">
              {t("attendance.checkOutTime", "Check-out")}
              {checkOutIsNextDay && <NextDayBadge />}
            </label>
            <CustomTimePicker id="co" value={checkOutAt} onChange={setCheckOutAt} />
          </div>
        )}
        {checkOutIsNextDay && (
          <p className="-mt-1 text-[12.5px] leading-relaxed text-text-tertiary">
            {t(
              "attendance.nextDayHint",
              "Check-out lands on the next day. Only accepted when the employee's shift that day runs past midnight.",
            )}
          </p>
        )}
        <div>
          <label htmlFor="reason" className="mb-1 block text-[13px] font-medium text-text-secondary">
            {t("attendance.editReason", "Reason")}
          </label>
          <input
            id="reason"
            className={reasonClass}
            placeholder={t("attendance.createReasonPlaceholder", "e.g. QR scanner was offline — confirmed shift with employee")}
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
          {t("common.cancel", "Cancel")}
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={!canSave || create.isPending}
          className="cursor-pointer rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50"
        >
          {t("common.add", "Add")}
        </button>
      </div>
    </div>
  );
}
