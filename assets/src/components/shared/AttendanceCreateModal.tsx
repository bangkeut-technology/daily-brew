import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { CustomTimePicker } from './CustomTimePicker';
import { CustomSelect } from './CustomSelect';
import { CustomDatePicker } from './CustomDatePicker';
import { Toggle } from './Toggle';
import { Avatar } from './Avatar';
import { useCreateAttendance } from '@/hooks/queries/useAttendance';
import type { AttendanceRecord } from '@/types';

interface AttendanceCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspacePublicId: string;
  employees: { publicId: string; name: string }[];
  /** Workspace-TZ today (YYYY-MM-DD) — caps the date picker and defaults the date. */
  todayStr: string;
  /** Called with the existing record when the chosen day already has attendance. */
  onConflict: (existing: AttendanceRecord) => void;
}

export function AttendanceCreateModal({
  open,
  onOpenChange,
  workspacePublicId,
  employees,
  todayStr,
  onConflict,
}: AttendanceCreateModalProps) {
  const { t } = useTranslation();
  const create = useCreateAttendance(workspacePublicId);

  const [employeePublicId, setEmployeePublicId] = useState('');
  const [date, setDate] = useState(todayStr);
  const [checkInAt, setCheckInAt] = useState('09:00');
  const [checkOutAt, setCheckOutAt] = useState('17:00');
  const [hasCheckOut, setHasCheckOut] = useState(true);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) return;
    setEmployeePublicId('');
    setDate(todayStr);
    setCheckInAt('09:00');
    setCheckOutAt('17:00');
    setHasCheckOut(true);
    setReason('');
  }, [open, todayStr]);

  const employeeOptions = employees.map((e) => ({ value: e.publicId, label: e.name }));

  const canSubmit = !!employeePublicId && !!reason.trim() && !create.isPending;

  const handleSubmit = async () => {
    if (!employeePublicId || !reason.trim()) return;
    try {
      await create.mutateAsync({
        employeePublicId,
        date,
        checkInAt,
        checkOutAt: hasCheckOut ? checkOutAt : null,
        reason: reason.trim(),
      });
      toast.success(t('attendance.createSuccess', 'Attendance added'));
      onOpenChange(false);
    } catch (err: unknown) {
      const resp =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { status?: number; data?: { message?: string; existing?: AttendanceRecord } } }).response
          : undefined;
      // A record already exists for this day — hand off to the edit flow.
      if (resp?.status === 409 && resp.data?.existing) {
        toast(t('attendance.alreadyExistsSwitchToEdit', 'A record already exists for that day — opening it to edit.'));
        onConflict(resp.data.existing);
        return;
      }
      toast.error(resp?.data?.message ?? t('attendance.createError', 'Failed to add attendance'));
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
              {t('attendance.createTitle', 'Add attendance')}
            </Dialog.Title>
            <Dialog.Description className="text-[14.5px] text-text-secondary leading-relaxed -mt-2">
              {t('attendance.createDescription', 'Record a check-in for a day the employee missed scanning.')}
            </Dialog.Description>

            <div>
              <label htmlFor="att-create-emp" className="block text-[13px] font-medium text-text-secondary mb-1">
                {t('attendance.employee', 'Employee')} <span className="text-red">*</span>
              </label>
              <CustomSelect
                value={employeePublicId}
                onChange={setEmployeePublicId}
                options={employeeOptions}
                placeholder={t('attendance.selectEmployee', 'Select employee')}
                renderOption={(opt, idx) => (
                  <>
                    <Avatar name={opt.label} index={idx} size={22} />
                    <span className="truncate">{opt.label}</span>
                  </>
                )}
                renderSelected={(opt) => (
                  <>
                    <Avatar name={opt.label} index={employees.findIndex((e) => e.publicId === opt.value)} size={20} />
                    <span className="truncate">{opt.label}</span>
                  </>
                )}
              />
            </div>

            <div>
              <label htmlFor="att-create-date" className="block text-[13px] font-medium text-text-secondary mb-1">
                {t('attendance.date', 'Date')} <span className="text-red">*</span>
              </label>
              <CustomDatePicker
                value={date}
                onChange={setDate}
                todayOverride={todayStr}
                isDateDisabled={(d) => d > todayStr}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="att-create-in" className="block text-[13px] font-medium text-text-secondary mb-1">
                  {t('attendance.checkInTime', 'Check-in')}
                </label>
                <CustomTimePicker value={checkInAt} onChange={setCheckInAt} />
              </div>
              <div>
                <label htmlFor="att-create-out" className="block text-[13px] font-medium text-text-secondary mb-1">
                  {t('attendance.checkOutTime', 'Check-out')}
                </label>
                <CustomTimePicker value={checkOutAt} onChange={setCheckOutAt} className={hasCheckOut ? '' : 'opacity-50 pointer-events-none'} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Toggle id="att-create-has-checkout" checked={hasCheckOut} onChange={setHasCheckOut} />
              <label htmlFor="att-create-has-checkout" className="text-[14.5px] text-text-primary cursor-pointer">
                {t('attendance.hasCheckOut', 'Has check-out')}
              </label>
            </div>

            <div>
              <label htmlFor="att-create-reason" className="block text-[13px] font-medium text-text-secondary mb-1">
                {t('attendance.editReason', 'Reason')} <span className="text-red">*</span>
              </label>
              <textarea
                id="att-create-reason"
                name="attendanceCreateReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={255}
                placeholder={t('attendance.createReasonPlaceholder', 'e.g. QR scanner was offline — confirmed shift with employee')}
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
                disabled={!canSubmit}
                className="px-4 py-2 rounded-lg text-[15px] font-medium text-white bg-coffee border-none cursor-pointer hover:bg-coffee-light transition-colors disabled:opacity-50"
              >
                {create.isPending ? t('common.loading', 'Loading...') : t('common.add', 'Add')}
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
