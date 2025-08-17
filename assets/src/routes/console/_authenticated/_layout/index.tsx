import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import {
    Coffee,
    Users,
    CalendarDays,
    TrendingUp,
    Plus,
    ClipboardList,
    Crown,
    Store,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { AttendanceGanttWithControls } from '@/components/attendance/AttendanceGanttWithControls';
import { KpiGanttWithControls } from '@/components/kpi/KpiGanttWithControls';

export const Route = createFileRoute('/console/_authenticated/_layout/')({
    component: Dashboard,
});

// Temporary lightweight stubs (delete when wiring real ones)
function Stub({ title }: { title: string }) {
    return (
        <div className="h-[340px] rounded-lg border bg-card grid place-items-center text-muted-foreground">
            <div className="text-sm">{title} • connect component</div>
        </div>
    );
}

function Dashboard() {
    const [month, setMonth] = React.useState<Date>(startOfMonth(new Date()));
    const [from, setFrom] = React.useState<Date>(startOfMonth(new Date()));
    const [to, setTo] = React.useState<Date>(endOfMonth(new Date()));
    const [storeId, setStoreId] = React.useState<string | null>(null);

    const prevMonth = () => setMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    const nextMonth = () => setMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

    // demo metrics (replace with API)
    const metrics = {
        avgKpi: 3.8,
        attendanceRate: 92,
        employees: 8,
        leavesToday: 1,
    };

    return (
        <div className="w-full px-6 py-5 space-y-6">
            {/* Page header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 grid place-items-center rounded-xl bg-primary/10 text-primary">
                        <Coffee className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="bg-gradient-to-r from-primary font-bold leading-tight to-primary/60 bg-clip-text text-transparent text-2xl md:text-3xl">
                            Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground">Overview for {format(month, 'LLLL yyyy')}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Store switcher (replace with real select/combobox) */}
                    <Button
                        variant="secondary"
                        className="gap-2"
                        onClick={() => setStoreId((s) => (s ? null : 'store-1'))}
                    >
                        <Store className="h-4 w-4" />
                        {storeId ? 'Store A' : 'All stores'}
                    </Button>

                    {/* Month picker */}
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Prev month">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="min-w-[200px] justify-between">
                                    <span>{format(month, 'LLLL yyyy')}</span>
                                    <CalendarIcon className="h-4 w-4 opacity-70" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2" align="end">
                                <Calendar
                                    mode="single"
                                    selected={month}
                                    onSelect={(d) => d && setMonth(startOfMonth(d))}
                                    showOutsideDays
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Next month">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <MetricCard
                    icon={<TrendingUp className="h-4 w-4" />}
                    label="Avg KPI"
                    value={metrics.avgKpi.toFixed(2)}
                    suffix="/ 5"
                />
                <MetricCard
                    icon={<CalendarDays className="h-4 w-4" />}
                    label="Attendance"
                    value={`${metrics.attendanceRate}%`}
                />
                <MetricCard icon={<Users className="h-4 w-4" />} label="Employees" value={String(metrics.employees)} />
                <MetricCard
                    icon={<ClipboardList className="h-4 w-4" />}
                    label="On leave today"
                    value={String(metrics.leavesToday)}
                />
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap items-center gap-2">
                <Button asChild className="gap-2">
                    <Link to="/console/employees/new">
                        <Plus className="h-4 w-4" />
                        Add employee
                    </Link>
                </Button>
                <Button variant="outline" asChild className="gap-2">
                    <Link to="/console/evaluations/templates/new">
                        <ClipboardList className="h-4 w-4" />
                        New evaluation
                    </Link>
                </Button>
                <Button variant="outline" asChild className="gap-2">
                    <Link to="/console/attendances">
                        <CalendarDays className="h-4 w-4" />
                        Open attendance
                    </Link>
                </Button>
                <Badge className="ml-auto" variant="outline">
                    <Crown className="h-3 w-3 mr-1" />
                    Pro • Coming soon
                </Badge>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <SectionHeader
                        title="KPI"
                        action={
                            <Link className="text-sm text-primary hover:underline" to="/console/kpi">
                                View all
                            </Link>
                        }
                    />
                    <KpiGanttWithControls title="KPI Gantt" />

                    <SectionHeader
                        title="Attendance"
                        action={
                            <Link className="text-sm text-primary hover:underline" to="/console/attendance">
                                View all
                            </Link>
                        }
                    />
                    <AttendanceGanttWithControls title="Attendance Gantt" />
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent evaluations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {[
                                { name: 'Sovan', score: 4.3, date: new Date() },
                                { name: 'Chanthy', score: 3.9, date: new Date() },
                                { name: 'Mey', score: 4.8, date: new Date() },
                            ].map((row, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="truncate max-w-[55%]">{row.name}</div>
                                    <div className="text-muted-foreground">{format(row.date, 'MMM d')}</div>
                                    <div className="font-medium">{row.score.toFixed(1)}</div>
                                </div>
                            ))}
                            <Separator />
                            <Button variant="ghost" asChild className="w-full">
                                <Link to="/console/evaluations">See all evaluations</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming leave</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {[
                                { name: 'Mey', from: new Date(), to: new Date() },
                                { name: 'Boran', from: new Date(), to: new Date() },
                            ].map((row, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="truncate max-w-[55%]">{row.name}</div>
                                    <div className="text-muted-foreground">
                                        {format(row.from, 'MMM d')} – {format(row.to, 'MMM d')}
                                    </div>
                                    <Badge variant="secondary">Approved</Badge>
                                </div>
                            ))}
                            <Separator />
                            <Button variant="ghost" asChild className="w-full">
                                <Link to="/console/leaves">Open leave board</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function MetricCard({
    icon,
    label,
    value,
    suffix,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    suffix?: string;
}) {
    return (
        <Card>
            <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 grid place-items-center rounded-lg bg-primary/10 text-primary">{icon}</div>
                <div className="flex-1">
                    <div className="text-sm text-muted-foreground">{label}</div>
                    <div className="text-2xl font-bold tracking-tight">
                        {value}
                        {suffix ? <span className="text-base font-medium text-muted-foreground"> {suffix}</span> : null}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {action}
        </div>
    );
}
