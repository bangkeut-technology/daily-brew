"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { CustomDatePicker } from "@/components/shared/CustomDatePicker";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { CustomTimePicker } from "@/components/shared/CustomTimePicker";
import { Toggle } from "@/components/shared/Toggle";
import { formatDateUTC, parseDateAsUTC } from "@/lib/timezone";
import { useCreateLeaveRequest, useEditLeaveRequest } from "@/hooks/useLeaveRequests";
import type { ClosurePeriod } from "@/types/closure";
import type { LeaveRequest } from "@/types/leave";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  /** Pre-selected employee — the submitter themself, or the row being filed for. */
  employeePublicId?: string;
  /** When present, an owner/manager can file on someone else's behalf. */
  employees?: { publicId: string; name: string }[];
  /** Closure days are blocked in the pickers — the API rejects them anyway. */
  closures?: ClosurePeriod[];
  /** When provided the modal edits this request instead of creating one. */
  leaveRequest?: LeaveRequest | null;
}

/** Expands closure ranges into the individual dates the picker must block. */
function buildClosureDateSet(closures: ClosurePeriod[]): Set<string> {
  const set = new Set<string>();
  for (const c of closures) {
    const end = parseDateAsUTC(c.endDate);
    for (const d = parseDateAsUTC(c.startDate); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      set.add(formatDateUTC(d));
    }
  }
  return set;
}

export function LeaveRequestModal(props: Props) {
  const { open, onOpenChange } = props;
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-2xl border border-glass-border bg-glass-bg shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none backdrop-blur-xl"
        >
          {/* Remounts per request so the edit prefill runs on a clean form. */}
          {open && <RequestForm key={props.leaveRequest?.publicId ?? "new"} {...props} />}
          <Dialog.Close className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-cream-3/40 hover:text-text-secondary">
            <X size={15} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function RequestForm({
  onOpenChange,
  workspaceId,
  employeePublicId,
  employees,
  closures = [],
  leaveRequest = null,
}: Props) {
  const { t } = useTranslation();
  const createLeave = useCreateLeaveRequest(workspaceId);
  const editLeave = useEditLeaveRequest(workspaceId);
  const isEdit = !!leaveRequest;

  // The parent keys this form per request, so it always mounts fresh — the
  // edit prefill belongs in the initial state rather than a sync effect.
  const [selectedEmployee, setSelectedEmployee] = useState(employeePublicId ?? "");
  const [startDate, setStartDate] = useState(leaveRequest?.startDate ?? "");
  const [endDate, setEndDate] = useState(leaveRequest?.endDate ?? "");
  const [reason, setReason] = useState(leaveRequest?.reason ?? "");
  const [isMultiDay, setIsMultiDay] = useState(
    !!leaveRequest && leaveRequest.startDate !== leaveRequest.endDate,
  );
  const [isPartial, setIsPartial] = useState(!!leaveRequest && !leaveRequest.isFullDay);
  const [startTime, setStartTime] = useState(leaveRequest?.startTime ?? "09:00");
  const [endTime, setEndTime] = useState(leaveRequest?.endTime ?? "17:00");

  const resolvedEmployeeId = isEdit
    ? leaveRequest.employeePublicId
    : employees
      ? selectedEmployee
      : (employeePublicId ?? "");

  const closureDates = buildClosureDateSet(closures);
  const isDateDisabled = (dateStr: string) => closureDates.has(dateStr);

  // A single-day request collapses the range onto the chosen date.
  const effectiveEndDate = isMultiDay ? endDate : startDate;
  const isPending = isEdit ? editLeave.isPending : createLeave.isPending;
  const canSubmit = !!resolvedEmployeeId && !!startDate && !!effectiveEndDate && !!reason.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const times = isPartial ? { startTime, endTime } : {};
    try {
      if (isEdit && leaveRequest) {
        await editLeave.mutateAsync({
          publicId: leaveRequest.publicId,
          startDate,
          endDate: effectiveEndDate,
          reason: reason.trim(),
          ...times,
        });
        toast.success(t("leave.editSuccess", "Leave request updated"));
      } else {
        await createLeave.mutateAsync({
          employeePublicId: resolvedEmployeeId,
          startDate,
          endDate: effectiveEndDate,
          reason: reason.trim(),
          ...times,
        });
        toast.success(t("leave.submitSuccess", "Leave request submitted"));
      }
      onOpenChange(false);
    } catch (err) {
      // The API explains overlaps and closure clashes far better than a
      // generic message would, so surface its text when there is one.
      const message = err instanceof AxiosError ? err.response?.data?.message : undefined;
      toast.error(message ?? t("leave.submitError", "Failed to submit leave request"));
    }
  };

  return (
    <div className="space-y-4 p-6">
      <Dialog.Title className="font-serif text-[18px] font-semibold text-text-primary">
        {isEdit
          ? t("leave.editRequest", "Edit leave request")
          : t("leave.submitRequest", "Submit leave request")}
      </Dialog.Title>
      <Dialog.Description className="-mt-2 text-[14.5px] leading-relaxed text-text-secondary">
        {isEdit
          ? t("leave.editDescription", "Adjust the dates or reason for {{name}}.", {
              name: leaveRequest?.employeeName,
            })
          : t("leave.submitDescription", "Select the dates you need off and provide a reason.")}
      </Dialog.Description>

      {!isEdit && employees && employees.length > 0 && (
        <div>
          <label
            htmlFor="leave-employee"
            className="mb-1 block text-[13px] font-medium text-text-secondary"
          >
            {t("leave.employee", "Employee")}
          </label>
          <CustomSelect
            id="leave-employee"
            value={selectedEmployee}
            onChange={setSelectedEmployee}
            options={employees.map((e) => ({ value: e.publicId, label: e.name }))}
            placeholder={t("leave.selectEmployee", "Select an employee")}
          />
        </div>
      )}

      <div>
        <label
          htmlFor="leave-start"
          className="mb-1 block text-[13px] font-medium text-text-secondary"
        >
          {isMultiDay ? t("leave.startDate", "Start date") : t("leave.date", "Date")}
        </label>
        <CustomDatePicker
          id="leave-start"
          value={startDate}
          onChange={(v) => {
            setStartDate(v);
            if (!endDate || v > endDate) setEndDate(v);
          }}
          isDateDisabled={isDateDisabled}
        />
      </div>

      <div className="flex items-center gap-2">
        <Toggle
          id="multi-day"
          checked={isMultiDay}
          onChange={(checked) => {
            setIsMultiDay(checked);
            if (!checked) setEndDate(startDate);
          }}
        />
        <label htmlFor="multi-day" className="cursor-pointer text-[15px] text-text-primary">
          {t("leave.multipleDays", "Multiple days")}
        </label>
      </div>

      {isMultiDay && (
        <div>
          <label
            htmlFor="leave-end"
            className="mb-1 block text-[13px] font-medium text-text-secondary"
          >
            {t("leave.endDate", "End date")}
          </label>
          <CustomDatePicker
            id="leave-end"
            value={endDate}
            onChange={setEndDate}
            isDateDisabled={isDateDisabled}
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <Toggle id="partial-day" checked={isPartial} onChange={setIsPartial} />
        <label htmlFor="partial-day" className="cursor-pointer text-[15px] text-text-primary">
          {t("leave.partialDay", "Partial day")}
        </label>
      </div>

      {isPartial && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="leave-start-time"
              className="mb-1 block text-[13px] font-medium text-text-secondary"
            >
              {t("leave.fromTime", "From")}
            </label>
            <CustomTimePicker id="leave-start-time" value={startTime} onChange={setStartTime} />
          </div>
          <div>
            <label
              htmlFor="leave-end-time"
              className="mb-1 block text-[13px] font-medium text-text-secondary"
            >
              {t("leave.toTime", "To")}
            </label>
            <CustomTimePicker id="leave-end-time" value={endTime} onChange={setEndTime} />
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="leave-reason"
          className="mb-1 block text-[13px] font-medium text-text-secondary"
        >
          {t("leave.reason", "Reason")}
        </label>
        <textarea
          id="leave-reason"
          name="leaveReason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder={t("leave.reasonPlaceholder", "e.g. Family event, medical appointment...")}
          className="w-full resize-none rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[15px] text-text-primary outline-none focus:border-coffee"
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="cursor-pointer rounded-lg border border-cream-3 bg-transparent px-4 py-2 text-[15px] font-medium text-text-secondary transition-colors hover:bg-cream-3"
        >
          {t("common.cancel", "Cancel")}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isPending}
          className="cursor-pointer rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50"
        >
          {isPending
            ? t("common.loading", "Loading...")
            : isEdit
              ? t("common.save", "Save")
              : t("common.submit", "Submit")}
        </button>
      </div>
    </div>
  );
}
