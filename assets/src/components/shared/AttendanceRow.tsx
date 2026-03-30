import { Avatar } from './Avatar';
import { StatusBadge } from './StatusBadge';

interface AttendanceRowProps {
  employee: string;
  shift: string | null;
  time: string | null;
  checkOut: string | null;
  isLate: boolean;
  leftEarly: boolean;
  index: number;
}

export function AttendanceRow({
  employee,
  shift,
  time,
  checkOut,
  isLate,
  leftEarly,
  index,
}: AttendanceRowProps) {
  const getStatus = () => {
    if (isLate) return { label: 'Late', variant: 'amber' as const };
    if (leftEarly) return { label: 'Left early', variant: 'amber' as const };
    return { label: 'On time', variant: 'green' as const };
  };

  const status = getStatus();

  return (
    <div className="flex items-center gap-3 px-5 py-2.5 transition-colors duration-[120ms] hover:bg-cream-3/35 cursor-default">
      <Avatar name={employee} index={index} size={32} />
      <div className="flex-1">
        <div className="text-[15.5px] font-medium text-text-primary font-sans">{employee}</div>
        <div className="text-[13px] text-text-tertiary font-sans">{shift || 'No shift'}</div>
      </div>
      <div className="text-[14.5px] text-text-secondary font-mono tabular-nums">
        {time}
        {checkOut ? ` \u2192 ${checkOut}` : ''}
      </div>
      <StatusBadge label={status.label} variant={status.variant} />
    </div>
  );
}
