// components/kpi/KpiGanttWithControls.tsx
import * as React from 'react';
import { format, startOfMonth } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { KpiGantt, ScoreValue } from './kpi-gantt';
import { Employee } from '@/types/employee';

type KpiGanttWithControlsProps = {
    employees: Employee[];
    getScore: (employeeId: string, dateISO: string) => ScoreValue;
    onCellClick?: (args: { employee: Employee; dateISO: string; score: ScoreValue }) => void;
    templateName?: string;
    initialMonth?: Date;
};

export const KpiGanttWithControls: React.FC<KpiGanttWithControlsProps> = ({
    employees,
    getScore,
    onCellClick,
    templateName,
    initialMonth = startOfMonth(new Date()),
}) => {
    const [month, setMonth] = React.useState<Date>(startOfMonth(initialMonth));
    const prevMonth = () => setMonth((d) => startOfMonth(new Date(d.getFullYear(), d.getMonth() - 1, 1)));
    const nextMonth = () => setMonth((d) => startOfMonth(new Date(d.getFullYear(), d.getMonth() + 1, 1)));

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Previous month">
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="min-w-[220px] justify-between">
                            <span>{format(month, 'LLLL yyyy')}</span>
                            <CalendarIcon className="h-4 w-4 opacity-70" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="start">
                        <Calendar
                            mode="single"
                            captionLayout="dropdown"
                            selected={month}
                            onSelect={(d) => d && setMonth(startOfMonth(d))}
                            showOutsideDays
                        />
                    </PopoverContent>
                </Popover>

                <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Next month">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <KpiGantt
                month={month}
                employees={employees}
                getScore={getScore}
                onCellClick={onCellClick}
                templateName={templateName}
            />
        </div>
    );
};

KpiGanttWithControls.displayName = 'KpiGanttWithControls';
