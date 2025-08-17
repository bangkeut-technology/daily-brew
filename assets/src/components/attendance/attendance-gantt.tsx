import * as React from 'react';
import { addDays, endOfMonth, format, isWeekend, startOfMonth } from 'date-fns';
import { AttendanceStatus } from '@/types/attendance';
import { Employee } from '@/types/employee';
import { cn } from '@/lib/utils';

type StatusColor = { bg: string; text: string; short: string; title: string };

const STATUS_UI: Record<Exclude<AttendanceStatus, null>, StatusColor> = {
    present: { bg: 'bg-green-500', text: 'text-white', short: 'P', title: 'Present' },
    absent: { bg: 'bg-red-500', text: 'text-white', short: 'A', title: 'Absent' },
    leave: { bg: 'bg-yellow-400', text: 'text-black', short: 'L', title: 'Leave' },
    late: { bg: 'bg-orange-500', text: 'text-white', short: 'T', title: 'Late' },
    sick: { bg: 'bg-sky-500', text: 'text-white', short: 'S', title: 'Sick' },
    holiday: { bg: 'bg-emerald-700', text: 'text-white', short: 'H', title: 'Holiday' },
    remote: { bg: 'bg-indigo-500', text: 'text-white', short: 'R', title: 'Remote' },
    unknown: { bg: 'bg-gray-500', text: 'text-white', short: 'U', title: 'Unknown' },
};

export interface AttendanceGanttProps {
    month: Date;
    rangeStart?: Date;
    rangeEnd?: Date;
    employees: Employee[];
    getStatus: (employeeId: string, dateISO: string) => AttendanceStatus;
    onCellClick?: (args: { employee: Employee; dateISO: string; status: AttendanceStatus }) => void;
    renderDayHeaderCell?: (date: Date, idx: number) => React.ReactNode;
    className?: string;
    leftColWidth?: number;
}

export const AttendanceGantt: React.FC<AttendanceGanttProps> = ({
    month,
    rangeStart,
    rangeEnd,
    employees,
    getStatus,
    onCellClick,
    renderDayHeaderCell,
    className,
    leftColWidth = 160,
}) => {
    const start = React.useMemo(() => rangeStart ?? startOfMonth(month), [rangeStart, month]);
    const end = React.useMemo(() => rangeEnd ?? endOfMonth(month), [rangeEnd, month]);

    const days = React.useMemo(() => {
        const arr: Date[] = [];
        for (let d = start; d <= end; d = addDays(d, 1)) arr.push(d);
        return arr;
    }, [start, end]);

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLDivElement>,
        employee: Employee,
        dateISO: string,
        status: AttendanceStatus,
    ) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onCellClick?.({ employee, dateISO, status });
        }
    };

    return (
        <div className={cn('bg-muted/30 rounded-lg', className)}>
            <div className="p-4 text-xs text-muted-foreground">Attendance · {format(start, 'LLLL yyyy')}</div>

            <div className="overflow-x-auto">
                <div className="min-w-[720px] divide-y">
                    {/* Header */}
                    <div
                        className="grid sticky top-0 z-10 bg-card"
                        style={{ gridTemplateColumns: `${leftColWidth}px repeat(${days.length}, minmax(28px, 1fr))` }}
                    >
                        <div className="px-3 py-2 border-r font-medium text-xs">Employee</div>
                        {days.map((d, idx) => {
                            const isWknd = isWeekend(d);
                            return (
                                <div
                                    key={idx}
                                    className={cn(
                                        'h-8 border-r grid place-items-center text-[10px] font-medium',
                                        isWknd ? 'bg-muted' : 'bg-card',
                                    )}
                                    title={format(d, 'EEE, MMM d')}
                                >
                                    {renderDayHeaderCell ? (
                                        renderDayHeaderCell(d, idx)
                                    ) : (
                                        <div className="flex flex-col items-center leading-none">
                                            <span>{format(d, 'd')}</span>
                                            <span className="text-[9px] text-muted-foreground">
                                                {format(d, 'EEEEE')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Rows */}
                    {employees.map((emp) => (
                        <div
                            key={emp.id}
                            className="grid"
                            style={{
                                gridTemplateColumns: `${leftColWidth}px repeat(${days.length}, minmax(28px, 1fr))`,
                            }}
                        >
                            <div className="px-3 py-2 border-r bg-card sticky left-0 z-10">{emp.fullName}</div>
                            {days.map((d, i) => {
                                const dateISO = format(d, 'yyyy-MM-dd');
                                const status = getStatus(emp.publicId, dateISO);
                                const isWknd = isWeekend(d);

                                const chip =
                                    status && STATUS_UI[status] ? (
                                        <span
                                            className={cn(
                                                'px-1 rounded text-[10px]',
                                                STATUS_UI[status].bg,
                                                STATUS_UI[status].text,
                                            )}
                                            title={STATUS_UI[status].title}
                                            aria-label={STATUS_UI[status].title}
                                        >
                                            {STATUS_UI[status].short}
                                        </span>
                                    ) : null;

                                return (
                                    <div
                                        key={`${emp.id}_${i}`}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => onCellClick?.({ employee: emp, dateISO, status })}
                                        onKeyDown={(e) => handleKeyDown(e, emp, dateISO, status)}
                                        className={cn(
                                            'h-8 border-r grid place-items-center text-[10px] cursor-pointer transition-colors',
                                            'hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                            isWknd ? 'bg-muted/60' : 'bg-background',
                                        )}
                                        title={status ? STATUS_UI[status].title : 'No record'}
                                        aria-label={`Cell ${emp.fullName} ${dateISO} ${status ?? 'empty'}`}
                                    >
                                        {chip}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="px-4 py-3 text-xs text-muted-foreground">
                <div className="flex flex-wrap gap-3">
                    {Object.entries(STATUS_UI).map(([key, ui]) => (
                        <div key={key} className="flex items-center gap-1">
                            <span className={cn('px-1 rounded', ui.bg, ui.text)}>{ui.short}</span>
                            <span>{ui.title}</span>
                        </div>
                    ))}
                    <span className="ml-2">• Weekends shaded</span>
                </div>
            </div>
        </div>
    );
};
