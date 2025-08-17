import * as React from 'react';
import { addDays, endOfMonth, format, isWeekend, startOfMonth } from 'date-fns';
import { Employee } from '@/types/employee';
import { cn } from '@/lib/utils';

export type ScoreValue = number | null; // e.g., 0..5 or null (no score yet)

export interface KpiGanttProps {
    /** Any date in the month to render */
    month: Date;

    /** Optional custom range */
    rangeStart?: Date;
    rangeEnd?: Date;

    /** Rows */
    employees: Employee[];

    /**
     * Provide a score per employee + date (0..5 or null).
     * You can read from a Map keyed by `${employeeId}_${yyyy-MM-dd}`.
     */
    getScore: (employeeId: string, dateISO: string) => ScoreValue;

    /**
     * Click handler to open evaluate/edit dialog.
     */
    onCellClick?: (args: {
        employee: Employee;
        dateISO: string; // yyyy-MM-dd
        score: ScoreValue; // current value
    }) => void;

    /**
     * Optional: show which KPI template you're visualizing.
     * If provided, it appears in the header subtitle.
     */
    templateName?: string;

    /** Optional custom day header render */
    renderDayHeaderCell?: (date: Date, idx: number) => React.ReactNode;

    /** Optional styling overrides */
    className?: string;
    leftColWidth?: number;

    /** Score min/max to colorize (defaults 0..5) */
    minScore?: number;
    maxScore?: number;
}

/** Map score 0..5 -> tailwind bg color bucket */
function colorForScore(score: number, min = 0, max = 5) {
    if (Number.isNaN(score)) return 'bg-background';
    const pct = (score - min) / Math.max(1, max - min);
    if (pct >= 0.9) return 'bg-green-600 text-white'; // 4.5..5
    if (pct >= 0.7) return 'bg-green-500 text-white'; // 3.5..4.4
    if (pct >= 0.5) return 'bg-yellow-400 text-black'; // 2.5..3.4
    if (pct >= 0.3) return 'bg-orange-400 text-white'; // 1.5..2.4
    if (pct > 0) return 'bg-red-500 text-white'; // 0.5..1.4
    return 'bg-muted text-muted-foreground'; // 0 or invalid
}

export const KpiGantt: React.FC<KpiGanttProps> = ({
    month,
    rangeStart,
    rangeEnd,
    employees,
    getScore,
    onCellClick,
    templateName,
    renderDayHeaderCell,
    className,
    leftColWidth = 160,
    minScore = 0,
    maxScore = 5,
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
        score: ScoreValue,
    ) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onCellClick?.({ employee, dateISO, score });
        }
    };

    return (
        <div className={cn('bg-muted/30 rounded-lg', className)}>
            <div className="p-4 text-xs text-muted-foreground flex items-center gap-2">
                <span>
                    KPI · {format(start, 'LLLL yyyy')}
                    {templateName ? ` · ${templateName}` : ''}
                </span>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[720px] divide-y">
                    {/* Header */}
                    <div
                        className="grid sticky top-0 z-10 bg-card"
                        style={{ gridTemplateColumns: `${leftColWidth}px repeat(${days.length}, minmax(28px, 1fr))` }}
                    >
                        <div className="px-3 py-2 border-r font-medium text-xs">Employee</div>
                        {days.map((d, idx) => {
                            const wknd = isWeekend(d);
                            return (
                                <div
                                    key={idx}
                                    className={cn(
                                        'h-8 border-r grid place-items-center text-[10px] font-medium',
                                        wknd ? 'bg-muted' : 'bg-card',
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
                                const score = getScore(emp.publicId, dateISO);

                                // Chip view (score or empty)
                                const chip = Number.isFinite(score as number) ? (
                                    <span
                                        className={cn(
                                            'px-1 rounded text-[10px] font-medium',
                                            colorForScore(Number(score), minScore, maxScore),
                                        )}
                                        title={`Score: ${score}`}
                                        aria-label={`Score ${score}`}
                                    >
                                        {Number(score).toFixed(1)}
                                    </span>
                                ) : null;

                                return (
                                    <div
                                        key={`${emp.id}_${i}`}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => onCellClick?.({ employee: emp, dateISO, score })}
                                        onKeyDown={(e) => handleKeyDown(e, emp, dateISO, score)}
                                        className={cn(
                                            'h-8 border-r grid place-items-center text-[10px] cursor-pointer transition-colors',
                                            'hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                            isWeekend(d) ? 'bg-muted/60' : 'bg-background',
                                        )}
                                        title={Number.isFinite(score as number) ? `Score: ${score}` : 'No score'}
                                        aria-label={`Cell ${emp.fullName} ${dateISO} ${Number.isFinite(score as number) ? `score ${score}` : 'empty'}`}
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
                <div className="flex flex-wrap items-center gap-3">
                    <span className="px-1 rounded bg-red-500 text-white">≤1.4</span>
                    <span>Low</span>
                    <span className="px-1 rounded bg-orange-400 text-white">1.5–2.4</span>
                    <span>Needs work</span>
                    <span className="px-1 rounded bg-yellow-400 text-black">2.5–3.4</span>
                    <span>OK</span>
                    <span className="px-1 rounded bg-green-500 text-white">3.5–4.4</span>
                    <span>Good</span>
                    <span className="px-1 rounded bg-green-600 text-white">≥4.5</span>
                    <span>Great</span>
                    <span className="ml-2">• Weekends shaded</span>
                </div>
            </div>
        </div>
    );
};
