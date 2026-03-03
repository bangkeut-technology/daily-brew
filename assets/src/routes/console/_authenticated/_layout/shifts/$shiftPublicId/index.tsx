import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    addTimeRule,
    assignEmployee,
    fetchShift,
    removeTimeRule,
    unassignEmployee,
    updateShift,
} from '@/services/shift';
import { fetchAllEmployees } from '@/services/employee';
import { useAuthenticationState } from '@/hooks/use-authentication';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { ArrowLeft, Clock, Plus, Trash2, UserMinus, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DayOfWeekEnum, CreateTimeRulePayload, DAY_LABELS } from '@/types/shift';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { Employee } from '@/types/employee';

export const Route = createFileRoute('/console/_authenticated/_layout/shifts/$shiftPublicId/')({
    component: ShiftDetailPage,
});

// ── Time rule dialog ───────────────────────────────────────────────────────────

function AddTimeRuleDialog({ workspacePublicId, shiftPublicId }: { workspacePublicId: string; shiftPublicId: string }) {
    const [open, setOpen] = React.useState(false);
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<CreateTimeRulePayload>({
        defaultValues: { dayOfWeek: DayOfWeekEnum.MONDAY, startTime: '07:00', endTime: '19:00' },
    });

    const { mutate, isPending } = useMutation({
        mutationFn: addTimeRule,
        onSuccess: (data) => {
            toast.success(t('shifts.time_rule_added', { ns: 'glossary', defaultValue: 'Time rule added.' }));
            queryClient.setQueryData(['shift', workspacePublicId, shiftPublicId], data);
            setOpen(false);
            reset();
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data?.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });

    const onSubmit = (values: CreateTimeRulePayload) => {
        mutate({ workspacePublicId, publicId: shiftPublicId, data: values });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                setOpen(v);
                if (!v) reset();
            }}
        >
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                    {t('shifts.add_rule', { ns: 'glossary', defaultValue: 'Add Rule' })}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>
                        {t('shifts.add_time_rule', { ns: 'glossary', defaultValue: 'Add Time Rule' })}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1">
                        <Label>{t('shifts.day', { ns: 'glossary', defaultValue: 'Day of Week' })}</Label>
                        <Controller
                            control={control}
                            name="dayOfWeek"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Select
                                    value={String(field.value)}
                                    onValueChange={(v) => field.onChange(Number(v) as DayOfWeekEnum)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(DAY_LABELS).map(([val, label]) => (
                                            <SelectItem key={val} value={val}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.dayOfWeek && <p className="text-xs text-destructive">{t('required')}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="startTime">
                                {t('shifts.start_time', { ns: 'glossary', defaultValue: 'Start' })}
                            </Label>
                            <Input
                                id="startTime"
                                type="time"
                                {...register('startTime', { required: true, pattern: /^\d{2}:\d{2}$/ })}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="endTime">
                                {t('shifts.end_time', { ns: 'glossary', defaultValue: 'End' })}
                            </Label>
                            <Input
                                id="endTime"
                                type="time"
                                {...register('endTime', { required: true, pattern: /^\d{2}:\d{2}$/ })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending} className="w-full">
                            {t('add')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Assign employee dialog ─────────────────────────────────────────────────────

function AssignEmployeeDialog({
    workspacePublicId,
    shiftPublicId,
    assignedEmployeeIds,
}: {
    workspacePublicId: string;
    shiftPublicId: string;
    assignedEmployeeIds: number[];
}) {
    const [open, setOpen] = React.useState(false);
    const [comboOpen, setComboOpen] = React.useState(false);
    const [selected, setSelected] = React.useState<Employee | null>(null);
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const { data: employees = [] } = useQuery({
        queryKey: ['all-employees'],
        queryFn: fetchAllEmployees,
        enabled: open,
    });

    const available = employees.filter((e) => !assignedEmployeeIds.includes(e.id));

    const { mutate, isPending } = useMutation({
        mutationFn: assignEmployee,
        onSuccess: (data) => {
            toast.success(t('shifts.employee_assigned', { ns: 'glossary', defaultValue: 'Employee assigned.' }));
            queryClient.setQueryData(['shift', workspacePublicId, shiftPublicId], data);
            setOpen(false);
            setSelected(null);
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data?.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                setOpen(v);
                if (!v) setSelected(null);
            }}
        >
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <UserPlus className="h-4 w-4" />
                    {t('shifts.assign_employee', { ns: 'glossary', defaultValue: 'Assign Employee' })}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>
                        {t('shifts.assign_employee', { ns: 'glossary', defaultValue: 'Assign Employee' })}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Popover open={comboOpen} onOpenChange={setComboOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start font-normal">
                                {selected
                                    ? selected.fullName
                                    : t('shifts.select_employee', { ns: 'glossary', defaultValue: 'Select employee…' })}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-0">
                            <Command>
                                <CommandInput placeholder={t('search')} />
                                <CommandList>
                                    <CommandEmpty>
                                        {t('no_results', { defaultValue: 'No employees found.' })}
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {available.map((emp) => (
                                            <CommandItem
                                                key={emp.publicId}
                                                value={emp.fullName}
                                                onSelect={() => {
                                                    setSelected(emp);
                                                    setComboOpen(false);
                                                }}
                                            >
                                                {emp.fullName}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    {selected && (
                        <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                            <span className="flex-1">{selected.fullName}</span>
                            <button type="button" onClick={() => setSelected(null)}>
                                <X className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            disabled={!selected || isPending}
                            className="w-full"
                            onClick={() => {
                                if (!selected) return;
                                mutate({
                                    workspacePublicId,
                                    publicId: shiftPublicId,
                                    employeePublicId: selected.publicId,
                                });
                            }}
                        >
                            {t('shifts.assign', { ns: 'glossary', defaultValue: 'Assign' })}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ── Edit grace dialog ──────────────────────────────────────────────────────────

function EditShiftDialog({
    workspacePublicId,
    shiftPublicId,
    currentName,
    currentGraceLate,
    currentGraceEarly,
}: {
    workspacePublicId: string;
    shiftPublicId: string;
    currentName: string;
    currentGraceLate: number;
    currentGraceEarly: number;
}) {
    const [open, setOpen] = React.useState(false);
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const { register, handleSubmit, reset } = useForm({
        defaultValues: { name: currentName, graceLateMinutes: currentGraceLate, graceEarlyMinutes: currentGraceEarly },
    });

    const { mutate, isPending } = useMutation({
        mutationFn: updateShift,
        onSuccess: (data) => {
            toast.success(t('shifts.updated', { ns: 'glossary', defaultValue: 'Shift updated.' }));
            queryClient.setQueryData(['shift', workspacePublicId, shiftPublicId], data);
            setOpen(false);
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data?.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                setOpen(v);
                if (!v) reset();
            }}
        >
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    {t('edit')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>{t('shifts.edit', { ns: 'glossary', defaultValue: 'Edit Shift' })}</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={handleSubmit((v) =>
                        mutate({
                            workspacePublicId,
                            publicId: shiftPublicId,
                            data: {
                                name: v.name,
                                graceLateMinutes: Number(v.graceLateMinutes),
                                graceEarlyMinutes: Number(v.graceEarlyMinutes),
                            },
                        }),
                    )}
                    className="space-y-4"
                >
                    <div className="space-y-1">
                        <Label htmlFor="editName">{t('name')}</Label>
                        <Input id="editName" {...register('name', { required: true })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>
                                {t('shifts.grace_late', { ns: 'glossary', defaultValue: 'Late grace (min)' })}
                            </Label>
                            <Input type="number" min={0} {...register('graceLateMinutes', { min: 0 })} />
                        </div>
                        <div className="space-y-1">
                            <Label>
                                {t('shifts.grace_early', { ns: 'glossary', defaultValue: 'Early grace (min)' })}
                            </Label>
                            <Input type="number" min={0} {...register('graceEarlyMinutes', { min: 0 })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending} className="w-full">
                            {t('save')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function ShiftDetailPage() {
    const { shiftPublicId } = Route.useParams();
    const { t } = useTranslation();
    const { workspace } = useAuthenticationState();
    const queryClient = useQueryClient();

    const { data: shift, isLoading } = useQuery({
        queryKey: ['shift', workspace?.publicId, shiftPublicId],
        queryFn: () => fetchShift({ workspacePublicId: workspace!.publicId, publicId: shiftPublicId }),
        enabled: !!workspace,
    });

    const { mutate: removeRule } = useMutation({
        mutationFn: removeTimeRule,
        onSuccess: (data) => {
            queryClient.setQueryData(['shift', workspace?.publicId, shiftPublicId], data);
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data?.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });

    const { mutate: unassign } = useMutation({
        mutationFn: unassignEmployee,
        onSuccess: (data) => {
            queryClient.setQueryData(['shift', workspace?.publicId, shiftPublicId], data);
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data?.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });

    if (isLoading) {
        return <div className="px-6 py-5 text-sm text-muted-foreground">{t('loading')}</div>;
    }

    if (!shift) {
        return (
            <div className="px-6 py-5 text-sm text-muted-foreground">
                {t('not_found', { defaultValue: 'Shift not found.' })}
            </div>
        );
    }

    const workspacePublicId = workspace?.publicId ?? '';
    const sortedRules = [...shift.timeRules].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    return (
        <div className="w-full px-6 py-5 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" size="icon">
                        <Link to="/console/shifts">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">{shift.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {t('shifts.grace_info', {
                                ns: 'glossary',
                                defaultValue: 'Late: {{late}}min · Early: {{early}}min',
                                late: shift.graceLateMinutes,
                                early: shift.graceEarlyMinutes,
                            })}
                        </p>
                    </div>
                </div>
                <EditShiftDialog
                    workspacePublicId={workspacePublicId}
                    shiftPublicId={shiftPublicId}
                    currentName={shift.name}
                    currentGraceLate={shift.graceLateMinutes}
                    currentGraceEarly={shift.graceEarlyMinutes}
                />
            </div>

            {/* Time rules */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {t('shifts.time_rules', { ns: 'glossary', defaultValue: 'Schedule' })}
                            </CardTitle>
                            <CardDescription>
                                {t('shifts.time_rules_hint', {
                                    ns: 'glossary',
                                    defaultValue: 'Define which days and hours this shift operates.',
                                })}
                            </CardDescription>
                        </div>
                        <AddTimeRuleDialog workspacePublicId={workspacePublicId} shiftPublicId={shiftPublicId} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    {sortedRules.length === 0 && (
                        <p className="text-sm text-muted-foreground py-2 text-center">
                            {t('shifts.no_rules', { ns: 'glossary', defaultValue: 'No schedule rules yet.' })}
                        </p>
                    )}
                    {sortedRules.map((rule) => (
                        <div
                            key={rule.publicId}
                            className="flex items-center justify-between rounded-md border px-3 py-2"
                        >
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="w-24 justify-center">
                                    {rule.dayLabel}
                                </Badge>
                                <span className="text-sm tabular-nums">
                                    {rule.startTime} – {rule.endTime}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn('h-7 w-7 text-muted-foreground hover:text-destructive')}
                                onClick={() =>
                                    removeRule({
                                        workspacePublicId,
                                        publicId: shiftPublicId,
                                        rulePublicId: rule.publicId,
                                    })
                                }
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Employees */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base">
                                {t('shifts.employees', { ns: 'glossary', defaultValue: 'Assigned Employees' })}
                            </CardTitle>
                            <CardDescription>
                                {t('shifts.employees_hint', {
                                    ns: 'glossary',
                                    defaultValue: 'Employees working this shift.',
                                })}
                            </CardDescription>
                        </div>
                        <AssignEmployeeDialog
                            workspacePublicId={workspacePublicId}
                            shiftPublicId={shiftPublicId}
                            assignedEmployeeIds={shift.employees.map((e) => e.id)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    {shift.employees.length === 0 && (
                        <p className="text-sm text-muted-foreground py-2 text-center">
                            {t('shifts.no_employees', { ns: 'glossary', defaultValue: 'No employees assigned yet.' })}
                        </p>
                    )}
                    {shift.employees.map((emp) => (
                        <div
                            key={emp.publicId}
                            className="flex items-center justify-between rounded-md border px-3 py-2"
                        >
                            <span className="text-sm">{emp.fullName}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() =>
                                    unassign({
                                        workspacePublicId,
                                        publicId: shiftPublicId,
                                        employeePublicId: emp.publicId,
                                    })
                                }
                            >
                                <UserMinus className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
