import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, ClipboardList } from 'lucide-react';
import { useAttendance } from '@/hooks/queries/useAttendance';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { AttendanceRow } from '@/components/shared/AttendanceRow';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';

export const Route = createFileRoute('/console/attendance/')({
  component: AttendancePage,
});

function AttendancePage() {
  const { t } = useTranslation();
  const workspaceId = getWorkspacePublicId() || '';
  const today = new Date().toISOString().split('T')[0];
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const { data: attendance, isLoading } = useAttendance(workspaceId, from, to);

  return (
    <div className="page-enter">
      <PageHeader title={t('nav.attendance')} />

      <div className="flex items-end gap-3 mb-6">
        <div>
          <label className="block text-[11px] font-medium text-text-secondary mb-1">
            {t('attendance.from', 'From')}
          </label>
          <CustomDatePicker value={from} onChange={setFrom} />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-text-secondary mb-1">
            {t('attendance.to', 'To')}
          </label>
          <CustomDatePicker value={to} onChange={setTo} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-[13px] text-text-tertiary">{t('common.loading')}</p>
        </div>
      ) : attendance?.length === 0 ? (
        <div className="border-[1.5px] border-dashed border-cream-3 rounded-2xl bg-glass-bg backdrop-blur-md flex flex-col items-center justify-center min-h-[200px]">
          <ClipboardList size={28} className="text-text-tertiary mb-2" />
          <span className="text-[13px] text-text-tertiary">
            {t('attendance.noRecords', 'No attendance records for this period')}
          </span>
        </div>
      ) : (
        <GlassCard hover={false}>
          <GlassCardHeader
            title={t('attendance.log', 'Attendance log')}
            action={
              <span className="flex items-center gap-1.5 text-[12px] text-text-tertiary">
                <CalendarDays size={13} />
                {from === to ? from : `${from} - ${to}`}
              </span>
            }
          />
          <div>
            {attendance?.map((a, i) => (
              <AttendanceRow
                key={a.publicId}
                employee={a.employeeName || ''}
                shift={a.shiftName || null}
                time={a.checkInAt}
                checkOut={a.checkOutAt}
                isLate={a.isLate}
                leftEarly={a.leftEarly}
                index={i}
              />
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
