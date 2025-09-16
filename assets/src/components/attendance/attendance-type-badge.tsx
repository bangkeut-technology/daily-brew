import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Sun, Clock, HeartPulse, Home, Calendar, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AttendanceType } from '@/types/attendance';

const STATUS_META: Record<
    AttendanceType,
    {
        label: string;
        icon: React.FC<any>;
        className: string;
    }
> = {
    present: {
        label: 'Present',
        icon: CheckCircle,
        className: 'bg-emerald-500 text-white',
    },
    absent: {
        label: 'Absent',
        icon: XCircle,
        className: 'bg-rose-500 text-white',
    },
    leave: {
        label: 'Leave',
        icon: Sun,
        className: 'bg-amber-400 text-black',
    },
    late: {
        label: 'Late',
        icon: Clock,
        className: 'bg-yellow-600 text-white',
    },
    sick: {
        label: 'Sick',
        icon: HeartPulse,
        className: 'bg-sky-500 text-white',
    },
    holiday: {
        label: 'Holiday',
        icon: Calendar,
        className: 'bg-indigo-500 text-white',
    },
    remote: {
        label: 'Remote',
        icon: Home,
        className: 'bg-violet-500 text-white',
    },
    closure: {
        label: 'Closure',
        icon: Home,
        className: 'bg-violet-500 text-white',
    },
    unknown: {
        label: 'Unknown',
        icon: HelpCircle,
        className: 'bg-gray-400 text-white',
    },
};

interface AttendanceTypeBadgeProps {
    type: AttendanceType;
    className?: string;
}

export const AttendanceTypeBadge: React.FC<AttendanceTypeBadgeProps> = ({ type, className }) => {
    const meta = STATUS_META[type];
    const Icon = meta.icon;

    return (
        <Badge className={cn('px-2 py-1 text-sm', meta.className, className)}>
            <Icon className="h-3 w-3 mr-1 inline" />
            {meta.label}
        </Badge>
    );
};

AttendanceTypeBadge.displayName = 'AttendanceTypeBadge';
