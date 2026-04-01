import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useCreateLeaveRequest } from '@/hooks/queries/useLeaveRequests';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import { CustomTimePicker } from '@/components/shared/CustomTimePicker';
import { Toggle } from '@/components/shared/Toggle';
import { CustomSelect } from '@/components/shared/CustomSelect';
import type { ClosurePeriod } from '@/types';

interface LeaveRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspacePublicId: string;
  employeePublicId?: string;
  employees?: { publicId: string; name: string }[];
  closures?: ClosurePeriod[];
}

function buildClosureDateSet(closures: ClosurePeriod[]): Set<string> {
  const set = new Set<string>();
  for (const c of closures) {
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    const d = new Date(start);
    while (d <= end) {
      set.add(d.toISOString().split('T')[0]);
      d.setDate(d.getDate() + 1);
    }
  }
  return set;
}

export function LeaveRequestModal({
  open,
  onOpenChange,
  workspacePublicId,
  employeePublicId,
  employees,
  closures = [],
}: LeaveRequestModalProps) {
  const { t } = useTranslation();
  const createLeave = useCreateLeaveRequest(workspacePublicId);
  const [selectedEmployee, setSelectedEmployee] = useState(employeePublicId ?? '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isPartial, setIsPartial] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const resolvedEmployeeId = employees ? selectedEmployee : (employeePublicId ?? '');

  // Pre-select the employee when modal opens
  useEffect(() => {
    if (open && employeePublicId) {
      setSelectedEmployee(employeePublicId);
    }
  }, [open, employeePublicId]);

  const closureDates = buildClosureDateSet(closures);
  const isDateDisabled = (dateStr: string) => closureDates.has(dateStr);

  const reset = () => {
    setSelectedEmployee(employeePublicId ?? '');
    setStartDate('');
    setEndDate('');
    setReason('');
    setIsPartial(false);
    setStartTime('09:00');
    setEndTime('17:00');
  };

  const handleSubmit = async () => {
    if (!resolvedEmployeeId || !startDate || !endDate || !reason.trim()) return;
    try {
      await createLeave.mutateAsync({
        employeePublicId: resolvedEmployeeId,
        startDate,
        endDate,
        reason: reason.trim(),
        startTime: isPartial ? startTime : undefined,
        endTime: isPartial ? endTime : undefined,
      });
      toast.success(t('leave.submitSuccess', 'Leave request submitted'));
      onOpenChange(false);
      reset();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : t('leave.submitError', 'Failed to submit leave request');
      toast.error(message);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-[420px] overflow-visible bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
          <div className="p-6 space-y-4">
            <Dialog.Title className="text-[18px] font-semibold text-text-primary font-serif">
              {t('leave.submitRequest', 'Submit leave request')}
            </Dialog.Title>
            <Dialog.Description className="text-[14.5px] text-text-secondary leading-relaxed -mt-2">
              {t('leave.submitDescription', 'Select the dates you need off and provide a reason.')}
            </Dialog.Description>

            {employees && employees.length > 0 && (
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1">
                  {t('leave.employee', 'Employee')}
                </label>
                <CustomSelect
                  value={selectedEmployee}
                  onChange={setSelectedEmployee}
                  options={employees.map((e) => ({ value: e.publicId, label: e.name }))}
                  placeholder={t('leave.selectEmployee', 'Select an employee')}
                />
              </div>
            )}

            <div>
              <label htmlFor="leave-start" className="block text-[13px] font-medium text-text-secondary mb-1">
                {t('leave.startDate', 'Start date')}
              </label>
              <CustomDatePicker
                value={startDate}
                onChange={(v) => {
                  setStartDate(v);
                  if (!endDate || v > endDate) setEndDate(v);
                }}
                isDateDisabled={isDateDisabled}
              />
            </div>
            <div>
              <label htmlFor="leave-end" className="block text-[13px] font-medium text-text-secondary mb-1">
                {t('leave.endDate', 'End date')}
              </label>
              <CustomDatePicker
                value={endDate}
                onChange={setEndDate}
                isDateDisabled={isDateDisabled}
              />
            </div>

            {/* Partial day toggle */}
            <div className="flex items-center gap-2">
              <Toggle
                id="partial-day"
                checked={isPartial}
                onChange={setIsPartial}
              />
              <label htmlFor="partial-day" className="text-[15px] text-text-primary cursor-pointer">
                {t('leave.partialDay', 'Partial day')}
              </label>
            </div>

            {isPartial && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="leave-start-time" className="block text-[13px] font-medium text-text-secondary mb-1">
                    {t('leave.fromTime', 'From')}
                  </label>
                  <CustomTimePicker value={startTime} onChange={setStartTime} />
                </div>
                <div>
                  <label htmlFor="leave-end-time" className="block text-[13px] font-medium text-text-secondary mb-1">
                    {t('leave.toTime', 'To')}
                  </label>
                  <CustomTimePicker value={endTime} onChange={setEndTime} />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="leave-reason" className="block text-[13px] font-medium text-text-secondary mb-1">
                {t('leave.reason', 'Reason')}
              </label>
              <textarea
                id="leave-reason"
                name="leaveReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder={t('leave.reasonPlaceholder', 'e.g. Family event, medical appointment...')}
                className="w-full px-3 py-2 rounded-lg text-[15px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee font-sans resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 rounded-lg text-[15px] font-medium bg-transparent text-text-secondary border border-cream-3 cursor-pointer hover:bg-cream-3 transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!resolvedEmployeeId || !startDate || !endDate || !reason.trim() || createLeave.isPending}
                className="px-4 py-2 rounded-lg text-[15px] font-medium text-white bg-coffee border-none cursor-pointer hover:bg-coffee-light transition-colors disabled:opacity-50"
              >
                {createLeave.isPending ? t('common.loading', 'Loading...') : t('common.submit', 'Submit')}
              </button>
            </div>
          </div>
          <Dialog.Close className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center bg-transparent border-none text-text-tertiary hover:text-text-secondary hover:bg-cream-3/40 cursor-pointer transition-all">
            <X size={15} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
