import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { addMonths, endOfMonth, format, getDate, getDaysInMonth, isSameDay, startOfMonth } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Home,
    Plane,
    Pill,
    AlarmClockOff,
    Coffee,
    Clock3,
} from 'lucide-react';
import { Attendance, AttendanceStatus } from '@/types/attendance';
import { Employee } from '@/types/employee';
import { useQuery } from '@tanstack/react-query';
import { fetchEmployees } from '@/services/employee';

// —————————————————————————————————————————————————————————————
// Route
export const Route = createFileRoute('/console/_authenticated/_layout/attendances/')({
    component: AttendancesPage,
});

// —————————————————————————————————————————————————————————————
// Helpers
const STATUS_META: Record<AttendanceStatus, { label: string; className: string; icon: React.ReactNode }> = {
    present: { label: 'Present', className: 'bg-emerald-500 text-white', icon: <Home className="h-3.5 w-3.5" /> },
    absent: { label: 'Absent', className: 'bg-rose-500 text-white', icon: <AlarmClockOff className="h-3.5 w-3.5" /> },
    leave: { label: 'Leave', className: 'bg-amber-400 text-black', icon: <Plane className="h-3.5 w-3.5" /> },
    sick: { label: 'Sick', className: 'bg-sky-500 text-white', icon: <Pill className="h-3.5 w-3.5" /> },
    holiday: { label: 'Holiday', className: 'bg-indigo-500 text-white', icon: <Coffee className="h-3.5 w-3.5" /> },
    remote: { label: 'Remote', className: 'bg-violet-500 text-white', icon: <Home className="h-3.5 w-3.5" /> },
    late: { label: 'Late', className: 'bg-yellow-500 text-black', icon: <Clock3 className="h-3.5 w-3.5" /> },
    unknown: { label: 'Unknown', className: 'bg-gray-500 text-white', icon: <AlarmClockOff className="h-3.5 w-3.5" /> },
};

function dayCells(daysInMonth: number) {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
}

function keyByEmployeeDate(records: Attendance[]) {
    const map = new Map<string, Attendance>();
    for (const r of records) {
        map.set(`${r.employeeId}_${r.attendanceDate}`, r);
    }
    return map;
}

// —————————————————————————————————————————————————————————————
// Dialog form for create/edit
function AttendanceDialog({
    open,
    onOpenChange,
    initial,
    dateISO,
    employee,
    onSave,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initial?: Attendance;
    dateISO: string;
    employee: Employee;
    onSave: (a: Attendance) => void;
}) {
    const [status, setStatus] = React.useState<AttendanceStatus>(initial?.status ?? 'present');
    const [clockIn, setClockIn] = React.useState<string>(initial?.clockIn ?? '');
    const [clockOut, setClockOut] = React.useState<string>(initial?.clockOut ?? '');
    const [note, setNote] = React.useState<string>(initial?.note ?? '');

    const save = () => {
        onSave({
            employeeId: employee.id,
            attendanceDate: dateISO,
            status,
            clockIn: clockIn || undefined,
            clockOut: clockOut || undefined,
            note: note || undefined,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {employee.firstName} {employee.lastName} — {format(new Date(dateISO), 'PPP')}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Status */}
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <div className="flex flex-wrap gap-2">
                            {(Object.keys(STATUS_META) as AttendanceStatus[]).map((s) => {
                                const meta = STATUS_META[s];
                                const active = status === s;
                                return (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setStatus(s)}
                                        className={cn(
                                            'px-2.5 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1 border',
                                            active ? meta.className : 'bg-muted hover:bg-muted/70',
                                        )}
                                    >
                                        {meta.icon}
                                        {meta.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Times (optional) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="clockIn">Clock in (optional)</Label>
                            <Input
                                id="clockIn"
                                type="time"
                                value={clockIn}
                                onChange={(e) => setClockIn(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="clockOut">Clock out (optional)</Label>
                            <Input
                                id="clockOut"
                                type="time"
                                value={clockOut}
                                onChange={(e) => setClockOut(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Note */}
                    <div className="space-y-1.5">
                        <Label htmlFor="note">Note (optional)</Label>
                        <Input
                            id="note"
                            placeholder="Reason or extra info…"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button onClick={save}>Save</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// —————————————————————————————————————————————————————————————
// Main Page
function AttendancesPage() {
    // Month controls
    const [month, setMonth] = React.useState<Date>(startOfMonth(new Date()));
    const startISO = format(startOfMonth(month), 'yyyy-MM-dd');
    const endISO = format(endOfMonth(month), 'yyyy-MM-dd');
    const { data: employees = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => fetchEmployees({ from: startOfMonth(month), to: endOfMonth(month) }),
    });

    const byKey = React.useMemo(() => keyByEmployeeDate(attendance), [attendance]);

    const daysInMonth = getDaysInMonth(month);
    const days = dayCells(daysInMonth);

    // Dialog state
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selected, setSelected] = React.useState<{
        employee: Employee | null;
        dateISO: string | null;
    }>({ employee: null, dateISO: null });

    const handleCellClick = (employee: Employee, dateISO: string) => {
        setSelected({ employee, dateISO });
        setDialogOpen(true);
    };

    const handleSave = (a: Attendance) => {
        // TODO: call your API to upsert attendance
        // await upsertAttendance(a)
        // and then refetch with react-query
        console.log('save attendance', a);
    };

    // Header actions
    const prevMonth = () => setMonth((d) => startOfMonth(addMonths(d, -1)));
    const nextMonth = () => setMonth((d) => startOfMonth(addMonths(d, +1)));
    const today = () => setMonth(startOfMonth(new Date()));

    return (
        <div className="w-full px-6 py-5 space-y-6">
            {/* Page header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <CalendarDays className="h-4 w-4" />
                    </span>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Attendance</h1>
                        <p className="text-sm text-muted-foreground">Monthly view · {format(month, 'MMMM yyyy')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={today}>
                        Today
                    </Button>
                    <Button variant="outline" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Legend */}
            <Card>
                <CardContent className="py-3">
                    <div className="flex flex-wrap gap-2 text-xs">
                        {(Object.keys(STATUS_META) as AttendanceStatus[]).map((s) => {
                            const m = STATUS_META[s];
                            return (
                                <span
                                    key={s}
                                    className={cn('inline-flex items-center gap-1 rounded px-2 py-1', m.className)}
                                >
                                    {m.icon}
                                    {m.label}
                                </span>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Gantt grid */}
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Month overview</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Day header row */}
                    <div className="bg-muted/40 sticky top-0 z-10 overflow-x-auto">
                        <div
                            className="grid min-w-[720px] grid-cols-[180px_repeat(var(--days),minmax(28px,1fr))] border-b"
                            style={{ ['--days' as any]: daysInMonth } as React.CSSProperties}
                        >
                            <div className="px-3 py-2 text-xs font-medium sticky left-0 bg-muted/40 border-r">
                                Employee
                            </div>
                            {days.map((d) => (
                                <div key={d} className="px-1 py-2 text-[10px] text-center border-r">
                                    {d}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rows */}
                    <div className="overflow-x-auto">
                        <div className="divide-y">
                            {employees.map((emp) => (
                                <div
                                    key={emp.id}
                                    className="grid min-w-[720px] grid-cols-[180px_repeat(var(--days),minmax(28px,1fr))]"
                                    style={{ ['--days' as any]: daysInMonth } as React.CSSProperties}
                                >
                                    {/* Sticky name */}
                                    <div className="px-3 py-2 border-r bg-card sticky left-0 z-10">
                                        <div className="text-sm font-medium">
                                            {emp.firstName} {emp.lastName}
                                        </div>
                                    </div>

                                    {/* Day cells */}
                                    {days.map((d) => {
                                        const dateObj = new Date(month.getFullYear(), month.getMonth(), d);
                                        const dateISO = format(dateObj, 'yyyy-MM-dd');
                                        const rec = byKey.get(`${emp.id}_${dateISO}`);

                                        // Pick badge/meta
                                        let badge: React.ReactNode = null;
                                        if (rec) {
                                            const meta = STATUS_META[rec.status];
                                            badge = (
                                                <Badge
                                                    className={cn(
                                                        'px-1.5 py-0.5 text-[10px] font-medium',
                                                        meta.className,
                                                    )}
                                                >
                                                    {meta.label === 'Present' && rec.clockIn
                                                        ? rec.clockIn
                                                        : meta.label.charAt(0).toUpperCase()}
                                                </Badge>
                                            );
                                        }

                                        const isToday = isSameDay(dateObj, new Date());

                                        return (
                                            <button
                                                key={d}
                                                onClick={() => handleCellClick(emp, dateISO)}
                                                className={cn(
                                                    'h-9 border-r grid place-items-center text-[10px] hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                                                    isToday && 'bg-primary/5',
                                                )}
                                                title={rec?.note || undefined}
                                            >
                                                {badge}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog */}
            {selected.employee && selected.dateISO && (
                <AttendanceDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    initial={byKey.get(`${selected.employee.id}_${selected.dateISO}`) || undefined}
                    dateISO={selected.dateISO}
                    employee={selected.employee}
                    onSave={handleSave}
                />
            )}

            {/* Footer helper */}
            <div className="text-xs text-muted-foreground">
                Tip: Click any empty day to add attendance, or a filled one to edit.
            </div>
        </div>
    );
}
