import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { CustomTimePicker } from './CustomTimePicker';
import { Toggle } from './Toggle';
import { useOverrideAttendance } from '@/hooks/queries/useAttendance';

interface AttendanceEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspacePublicId: string;
  attendance: {
    publicId: string;
    employeeName?: string | null;
    date: string;
    checkInAt: string | null;
    checkOutAt: string | null;
    originalCheckInAt?: string | null;
    originalCheckOutAt?: string | null;
  } | null;
}

export function AttendanceEditModal({
  open,
  onOpenChange,
  workspacePublicId,
  attendance,
}: AttendanceEditModalProps) {
  const { t } = useTranslation();
  const override = useOverrideAttendance(workspacePublicId);

  const [checkInAt, setCheckInAt] = useState('09:00');
  const [checkOutAt, setCheckOutAt] = useState('17:00');
  const [hasCheckOut, setHasCheckOut] = useState(true);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open || !attendance) return;
    setCheckInAt(attendance.checkInAt ?? '09:00');
    setCheckOutAt(attendance.checkOutAt ?? '17:00');
    setHasCheckOut(attendance.checkOutAt !== null);
    setReason('');
  }, [open, attendance]);

  if (!attendance) return null;

  // Block wiping a real check-out: if the record already had one, the toggle
  // can't be used to clear it (a typo is fixed by editing the time, not removing it).
  const clearingExistingCheckOut = attendance.checkOutAt !== null && !hasCheckOut;

  const handleSubmit = async () => {
    const trimmed = reason.trim();
    if (!trimmed || clearingExistingCheckOut) return;
    try {
      await override.mutateAsync({
        publicId: attendance.publicId,
        payload: {
          checkInAt,
          checkOutAt: hasCheckOut ? checkOutAt : null,
          reason: trimmed,
        },
      });
      toast.success(t('attendance.editSuccess', 'Attendance updated'));
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : t('attendance.editError', 'Failed to update attendance');
      toast.error(message);
    }
  };

  const originalText =
    attendance.originalCheckInAt || attendance.originalCheckOutAt
      ? `${attendance.originalCheckInAt ?? '—'}${attendance.originalCheckOutAt ? ` → ${attendance.originalCheckOutAt}` : ' → —'}`
      : null;

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
              {t('attendance.editTitle', 'Edit attendance')}
            </Dialog.Title>
            <Dialog.Description className="text-[14.5px] text-text-secondary leading-relaxed -mt-2">
              {attendance.employeeName ? `${attendance.employeeName} · ${attendance.date}` : attendance.date}
            </Dialog.Description>

            {originalText && (
              <div className="text-[13px] text-text-tertiary font-mono tabular-nums bg-cream-3/30 rounded-lg px-3 py-2">
                {t('attendance.originalScan', 'Originally')}: {originalText}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="att-edit-in" className="block text-[13px] font-medium text-text-secondary mb-1">
                  {t('attendance.checkInTime', 'Check-in')}
                </label>
                <CustomTimePicker value={checkInAt} onChange={setCheckInAt} />
              </div>
              <div>
                <label htmlFor="att-edit-out" className="block text-[13px] font-medium text-text-secondary mb-1">
                  {t('attendance.checkOutTime', 'Check-out')}
                </label>
                <CustomTimePicker value={checkOutAt} onChange={setCheckOutAt} className={hasCheckOut ? '' : 'opacity-50 pointer-events-none'} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Toggle id="att-has-checkout" checked={hasCheckOut} onChange={setHasCheckOut} />
              <label htmlFor="att-has-checkout" className="text-[14.5px] text-text-primary cursor-pointer">
                {t('attendance.hasCheckOut', 'Has check-out')}
              </label>
            </div>

            {clearingExistingCheckOut && (
              <p className="text-[13px] text-red leading-relaxed -mt-1">
                {t(
                  'attendance.cannotClearCheckOut',
                  "This record has a check-out — turn the toggle back on. To fix a wrong time, edit it rather than removing it.",
                )}
              </p>
            )}

            <div>
              <label htmlFor="att-edit-reason" className="block text-[13px] font-medium text-text-secondary mb-1">
                {t('attendance.editReason', 'Reason')} <span className="text-red">*</span>
              </label>
              <textarea
                id="att-edit-reason"
                name="attendanceEditReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={255}
                placeholder={t('attendance.editReasonPlaceholder', 'e.g. Forgot to scan out — confirmed with manager')}
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
                disabled={!reason.trim() || clearingExistingCheckOut || override.isPending}
                className="px-4 py-2 rounded-lg text-[15px] font-medium text-white bg-coffee border-none cursor-pointer hover:bg-coffee-light transition-colors disabled:opacity-50"
              >
                {override.isPending ? t('common.loading', 'Loading...') : t('common.save', 'Save')}
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
