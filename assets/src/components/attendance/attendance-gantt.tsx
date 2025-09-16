import * as React from 'react';
import { addDays, endOfMonth, format, isWeekend, startOfMonth } from 'date-fns';
import { AttendanceType } from '@/types/attendance';
import { Employee } from '@/types/employee';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { fetchGanttAttendances } from '@/services/attendance';
import { DATE_FORMAT } from '@/constants/date';

export type CellClickFunc = (args: { employee: Employee; dateISO: string; type: AttendanceType | undefined }) => void;

type StatusColor = { bg: string; text: string; short: string; title: string };

const STATUS_UI: Record<Exclude<AttendanceType, null>, StatusColor> = {
    present: { bg: 'bg-green-500', text: 'text-white', short: 'P', title: 'Present' },
    absent: { bg: 'bg-red-500', text: 'text-white', short: 'A', title: 'Absent' },
    leave: { bg: 'bg-yellow-400', text: 'text-black', short: 'L', title: 'Leave' },
    late: { bg: 'bg-orange-500', text: 'text-white', short: 'T', title: 'Late' },
    sick: { bg: 'bg-sky-500', text: 'text-white', short: 'S', title: 'Sick' },
    holiday: { bg: 'bg-emerald-700', text: 'text-white', short: 'H', title: 'Holiday' },
    remote: { bg: 'bg-indigo-500', text: 'text-white', short: 'R', title: 'Remote' },
    closure: { bg: 'bg-purple-500', text: 'text-white', short: 'C', title: 'Closure' },
    unknown: { bg: 'bg-gray-500', text: 'text-white', short: 'U', title: 'Unknown' },
};

export interface AttendanceGanttProps {
    month: Date;
    rangeStart?: Date;
    rangeEnd?: Date;
    employees: Employee[];
    onCellClick?: CellClickFunc;
    renderDayHeaderCell?: (date: Date, idx: number) => React.ReactNode;
    className?: string;
    leftColWidth?: number;
}

export const AttendanceGantt: React.FunctionComponent<AttendanceGanttProps> = ({
    month,
    rangeStart,
    rangeEnd,
    employees,
    onCellClick,
    renderDayHeaderCell,
    className,
    leftColWidth = 160,
}) => {
    const { t } = useTranslation();
    const start = React.useMemo(() => rangeStart ?? startOfMonth(month), [rangeStart, month]);
    const end = React.useMemo(() => rangeEnd ?? endOfMonth(month), [rangeEnd, month]);
    const { data } = useQuery({
        queryKey: ['attendance-gantt', start, end, employees],
        queryFn: () =>
            fetchGanttAttendances({ from: format(start, DATE_FORMAT), to: format(end, DATE_FORMAT), employees }),
        enabled: !!employees.length,
    });

    const days = React.useMemo(() => {
        const arr: Date[] = [];
        for (let d = start; d <= end; d = addDays(d, 1)) arr.push(d);
        return arr;
    }, [start, end]);

    const handleKeyDown = React.useCallback(
        (
            e: React.KeyboardEvent<HTMLDivElement>,
            employee: Employee,
            dateISO: string,
            type: AttendanceType | undefined,
        ) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCellClick?.({ employee, dateISO, type });
            }
        },
        [onCellClick],
    );

    const getStatus = React.useCallback(
        (employeePublicId: string, date: string) => {
            if (!data && !Array.isArray(data)) return undefined;
            if (data[employeePublicId]) {
                const employee = data[employeePublicId];
                if (employee.attendances[date]) {
                    return employee.attendances[date].type;
                }
            }
            return undefined;
        },
        [data],
    );

    return (
        <div className={cn('bg-muted/30 rounded-lg', className)}>
            <div className="p-4 text-xs text-muted-foreground">
                {t('attendance')} · {format(start, 'LLLL yyyy')}
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[720px] divide-y">
                    {/* Header */}
                    <div
                        className="grid sticky top-0 z-10 bg-card"
                        style={{ gridTemplateColumns: `${leftColWidth}px repeat(${days.length}, minmax(28px, 1fr))` }}
                    >
                        <div className="px-3 py-2 border-r font-medium text-xs">{t('employee')}</div>
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
                    {employees.map((employee) => (
                        <div
                            key={employee.id}
                            className="grid"
                            style={{
                                gridTemplateColumns: `${leftColWidth}px repeat(${days.length}, minmax(28px, 1fr))`,
                            }}
                        >
                            <div className="px-3 py-2 border-r bg-card sticky left-0 z-10">{employee.fullName}</div>
                            {days.map((d, i) => {
                                const dateISO = format(d, 'yyyy-MM-dd');
                                const type = getStatus(employee.publicId, dateISO);
                                const isWknd = isWeekend(d);

                                const chip =
                                    type && STATUS_UI[type] ? (
                                        <span
                                            className={cn(
                                                'px-1 rounded text-[12px]',
                                                STATUS_UI[type].bg,
                                                STATUS_UI[type].text,
                                            )}
                                            title={STATUS_UI[type].title}
                                            aria-label={STATUS_UI[type].title}
                                        >
                                            {STATUS_UI[type].short}
                                        </span>
                                    ) : (
                                        '-'
                                    );

                                return (
                                    <div
                                        key={`${employee.id}_${i}`}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => onCellClick?.({ employee, dateISO, type })}
                                        onKeyDown={(e) => handleKeyDown(e, employee, dateISO, type)}
                                        className={cn(
                                            'h-10 border-r grid place-items-center text-[10px] cursor-pointer transition-colors',
                                            'hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                            isWknd ? 'bg-muted/60' : 'bg-background',
                                        )}
                                        title={type ? STATUS_UI[type].title : t('no_records')}
                                        aria-label={`Cell ${employee.fullName} ${dateISO} ${type ?? 'empty'}`}
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

AttendanceGantt.displayName = 'AttendanceGantt';
