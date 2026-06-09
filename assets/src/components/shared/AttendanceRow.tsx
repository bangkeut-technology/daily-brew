import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash2 } from 'lucide-react';
import { Avatar } from './Avatar';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import type { AttendanceStatus } from '@/types';

interface AttendanceRowProps {
  employee: string;
  /** When provided alongside canViewEmployee, the name links to /console/employees/{publicId}. */
  employeePublicId?: string;
  canViewEmployee?: boolean;
  shift: string | null;
  time: string | null;
  checkOut: string | null;
  isLate: boolean;
  leftEarly: boolean;
  index: number;
  status?: AttendanceStatus;
  date?: string;
  edited?: boolean;
  voided?: boolean;
  voidedByEmail?: string | null;
  voidReason?: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
  employeePhotoUrl?: string | null;
}

export function AttendanceRow({
  employee,
  employeePublicId,
  canViewEmployee,
  shift,
  time,
  checkOut,
  isLate,
  leftEarly,
  index,
  status: attendanceStatus,
  date,
  edited,
  voided,
  voidedByEmail,
  voidReason,
  onEdit,
  onDelete,
  employeePhotoUrl,
}: AttendanceRowProps) {
  const { t } = useTranslation();

  const getStatusBadge = () => {
    if (attendanceStatus === 'voided') {
      return { label: t('attendance.voided', 'Voided'), variant: 'gray' as const };
    }
    if (attendanceStatus === 'off') {
      return { label: t('attendance.off', 'Off'), variant: 'gray' as const };
    }
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
  // 'voided' is a tombstone — keep the original times visible (line-through)
  // so the audit is readable, but hide edit/delete actions. Placeholder rows
  // (absent / on_leave / off) have no real times to show, so we render a dash.
  const isVoided = voided || attendanceStatus === 'voided';
  const isPlaceholderRow = attendanceStatus === 'absent' || attendanceStatus === 'on_leave' || attendanceStatus === 'off';
  const showEdit = !!onEdit && !isPlaceholderRow && !isVoided;
  const showDelete = !!onDelete && !isPlaceholderRow && !isVoided;

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-5 py-2.5 transition-colors duration-[120ms] hover:bg-cream-3/35 cursor-default',
        voided && 'opacity-60',
      )}
    >
      <Avatar name={employee} imageUrl={employeePhotoUrl} index={index} size={32} />
      <div className="flex-1">
        <div className="text-[15.5px] font-medium text-text-primary font-sans flex items-center gap-2">
          {canViewEmployee && employeePublicId ? (
            <Link
              to="/console/employees/$publicId"
              params={{ publicId: employeePublicId }}
              className="no-underline text-text-primary hover:text-coffee transition-colors"
            >
              {employee}
            </Link>
          ) : (
            employee
          )}
          {edited && !voided && (
            <span
              title={t('attendance.editedTooltip', 'Edited by a manager')}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10.5px] font-medium uppercase tracking-wide bg-coffee/10 text-coffee"
            >
              {t('attendance.editedBadge', 'Edited')}
            </span>
          )}
        </div>
        <div className="text-[13px] text-text-tertiary font-sans">
          {voided && voidedByEmail
            ? `${t('attendance.voidedBy', 'Removed by')} ${voidedByEmail}${voidReason ? ` · ${voidReason}` : ''}`
            : (
              <>
                {shift || t('attendance.noShift', 'No shift')}
                {date ? ` · ${date}` : ''}
              </>
            )}
        </div>
      </div>
      <div
        className={cn(
          'text-[14.5px] text-text-secondary font-mono tabular-nums',
          isVoided && 'line-through',
        )}
      >
        {isPlaceholderRow
          ? '—'
          : (
            <>
              {time}
              {checkOut ? ` → ${checkOut}` : ''}
            </>
          )}
      </div>
      <StatusBadge label={badge.label} variant={badge.variant} />
      {showEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label={t('attendance.editAria', 'Edit attendance')}
          className="w-7 h-7 rounded-lg flex items-center justify-center bg-transparent border-none cursor-pointer transition-colors text-text-tertiary hover:text-coffee hover:bg-cream-3/40"
        >
          <Pencil size={13} />
        </button>
      )}
      {showDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={t('attendance.deleteAria', 'Remove attendance')}
          className="w-7 h-7 rounded-lg flex items-center justify-center bg-transparent border-none cursor-pointer transition-colors text-text-tertiary hover:text-red hover:bg-red/10"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}
