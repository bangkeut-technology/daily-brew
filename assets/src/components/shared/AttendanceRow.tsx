import { useTranslation } from 'react-i18next';
import { Avatar } from './Avatar';
import { StatusBadge } from './StatusBadge';
import type { AttendanceStatus } from '@/types';

interface AttendanceRowProps {
  employee: string;
  shift: string | null;
  time: string | null;
  checkOut: string | null;
  isLate: boolean;
  leftEarly: boolean;
  index: number;
  status?: AttendanceStatus;
  date?: string;
}

export function AttendanceRow({
  employee,
  shift,
  time,
  checkOut,
  isLate,
  leftEarly,
  index,
  status: attendanceStatus,
  date,
}: AttendanceRowProps) {
  const { t } = useTranslation();

  const getStatusBadge = () => {
    if (attendanceStatus === 'absent') {
      return { label: t('attendance.absent', 'Absent'), variant: 'red' as const };
    }
    if (attendanceStatus === 'on_leave') {
      return { label: t('attendance.onLeave', 'On leave'), variant: 'blue' as const };
    }
    if (isLate) return { label: t('attendance.late', 'Late'), variant: 'amber' as const };
    if (leftEarly) return { label: t('attendance.leftEarly', 'Left early'), variant: 'amber' as const };
    return { label: t('attendance.onTime', 'On time'), variant: 'green' as const };
  };

  const badge = getStatusBadge();

  return (
    <div className="flex items-center gap-3 px-5 py-2.5 transition-colors duration-[120ms] hover:bg-cream-3/35 cursor-default">
      <Avatar name={employee} index={index} size={32} />
      <div className="flex-1">
        <div className="text-[15.5px] font-medium text-text-primary font-sans">{employee}</div>
        <div className="text-[13px] text-text-tertiary font-sans">
          {shift || t('attendance.noShift', 'No shift')}
          {date ? ` · ${date}` : ''}
        </div>
      </div>
      <div className="text-[14.5px] text-text-secondary font-mono tabular-nums">
        {attendanceStatus === 'absent' || attendanceStatus === 'on_leave'
          ? '\u2014'
          : (
            <>
              {time}
              {checkOut ? ` \u2192 ${checkOut}` : ''}
            </>
          )}
      </div>
      <StatusBadge label={badge.label} variant={badge.variant} />
    </div>
  );
}
