import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { AlertTriangle, X } from 'lucide-react';
import { useDeleteAttendance } from '@/hooks/queries/useAttendance';

interface AttendanceDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspacePublicId: string;
  attendance: {
    publicId: string;
    employeeName?: string | null;
    date: string;
    checkInAt: string | null;
    checkOutAt: string | null;
  } | null;
}

export function AttendanceDeleteModal({
  open,
  onOpenChange,
  workspacePublicId,
  attendance,
}: AttendanceDeleteModalProps) {
  const { t } = useTranslation();
  const del = useDeleteAttendance(workspacePublicId);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  if (!attendance) return null;

  const handleSubmit = async () => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    try {
      await del.mutateAsync({ publicId: attendance.publicId, reason: trimmed });
      toast.success(t('attendance.deleteSuccess', 'Attendance removed'));
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : t('attendance.deleteError', 'Failed to remove attendance');
      toast.error(message);
    }
  };

  const scanLine =
    attendance.checkInAt || attendance.checkOutAt
      ? `${attendance.checkInAt ?? '—'}${attendance.checkOutAt ? ` → ${attendance.checkOutAt}` : ''}`
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
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-red/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red" />
              </div>
              <div className="flex-1">
                <Dialog.Title className="text-[18px] font-semibold text-text-primary font-serif">
                  {t('attendance.deleteTitle', 'Remove attendance?')}
                </Dialog.Title>
                <Dialog.Description className="text-[14.5px] text-text-secondary leading-relaxed mt-0.5">
                  {attendance.employeeName ? `${attendance.employeeName} · ${attendance.date}` : attendance.date}
                </Dialog.Description>
              </div>
            </div>

            {scanLine && (
              <div className="text-[13px] text-text-tertiary font-mono tabular-nums bg-cream-3/30 rounded-lg px-3 py-2">
                {scanLine}
              </div>
            )}

            <p className="text-[13.5px] text-text-secondary leading-relaxed">
              {t(
                'attendance.deleteHint',
                'The record stays in the log as a tombstone for audit. It drops out of stats and exports. A new scan or manual entry on the same day will replace it.',
              )}
            </p>

            <div>
              <label htmlFor="att-del-reason" className="block text-[13px] font-medium text-text-secondary mb-1">
                {t('attendance.deleteReason', 'Reason')} <span className="text-red">*</span>
              </label>
              <textarea
                id="att-del-reason"
                name="attendanceDeleteReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={255}
                placeholder={t('attendance.deleteReasonPlaceholder', 'e.g. Wrong day — employee did not work this shift')}
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
                disabled={!reason.trim() || del.isPending}
                className="px-4 py-2 rounded-lg text-[15px] font-medium text-white bg-red border-none cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {del.isPending ? t('common.loading', 'Loading...') : t('attendance.deleteConfirm', 'Remove')}
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
