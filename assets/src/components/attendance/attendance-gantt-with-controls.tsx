// components/attendance/AttendanceGanttWithControls.tsx
import * as React from 'react';
import { format, startOfMonth } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar'; // shadcn calendar (single date)
import { AttendanceGanttGrid, AttendanceStatus, EmployeeLite } from './AttendanceGanttGrid';

type Props = {
    employees: EmployeeLite[];
    getStatus: (employeeId: string, dateISO: string) => AttendanceStatus;
    onCellClick?: (args: { employee: EmployeeLite; dateISO: string; status: AttendanceStatus | null }) => void;
    /** optional: initial month */
    initialMonth?: Date;
};

export function AttendanceGanttWithControls({
    employees,
    getStatus,
    onCellClick,
    initialMonth = startOfMonth(new Date()),
}: Props) {
    const [month, setMonth] = React.useState<Date>(startOfMonth(initialMonth));
    const prevMonth = React.useCallback(
        () => setMonth((d) => startOfMonth(new Date(d.getFullYear(), d.getMonth() - 1, 1))),
        [],
    );
    const nextMonth = React.useCallback(
        () => setMonth((d) => startOfMonth(new Date(d.getFullYear(), d.getMonth() + 1, 1))),
        [],
    );

    return (
        <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Previous month">
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="min-w-[200px] justify-between">
                            <span>{format(month, 'LLLL yyyy')}</span>
                            <CalendarIcon className="h-4 w-4 opacity-70" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="start">
                        {/* Use single-date selection; we’ll read only the month/year from the selected date */}
                        <Calendar
                            mode="single"
                            selected={month}
                            onSelect={(d) => d && setMonth(startOfMonth(d))}
                            // show outside days so users can click into next/prev months
                            showOutsideDays
                            initialFocus
                        />
                        <div className="mt-2 grid grid-cols-3 gap-2">
                            {/* Quick picks */}
                            <Button variant="secondary" onClick={() => setMonth(startOfMonth(new Date()))}>
                                This month
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    setMonth(
                                        startOfMonth(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)),
                                    )
                                }
                            >
                                Last month
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setMonth(startOfMonth(new Date(new Date().getFullYear(), 0, 1)))}
                            >
                                Jan {new Date().getFullYear()}
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>

                <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Next month">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Grid */}
            <AttendanceGanttGrid month={month} employees={employees} getStatus={getStatus} onCellClick={onCellClick} />
        </div>
    );
}
