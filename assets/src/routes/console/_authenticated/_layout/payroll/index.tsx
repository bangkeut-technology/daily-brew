import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPayrollRun, deletePayrollRun, fetchPayrollRuns, finalizePayrollRun } from '@/services/payroll';
import { useAuthenticationState } from '@/hooks/use-authentication';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { format } from 'date-fns';
import { BadgeCheck, ChevronLeft, ChevronRight, DollarSign, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PayrollRun, PayrollRunStatusEnum } from '@/types/payroll';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { MONTHS } from '@/constants/date';

export const Route = createFileRoute('/console/_authenticated/_layout/payroll/')({
    component: PayrollListPage,
});

// ── Month Picker ──────────────────────────────────────────────────────────────

interface MonthPickerProps {
    value: Date | null;
    onChange: (date: Date) => void;
}

function MonthPicker({ value, onChange }: MonthPickerProps) {
    const [open, setOpen] = React.useState(false);
    const [viewYear, setViewYear] = React.useState(() => value?.getFullYear() ?? new Date().getFullYear());

    const handleSelect = (monthIndex: number) => {
        onChange(new Date(viewYear, monthIndex, 1));
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn('w-full justify-start font-normal', !value && 'text-muted-foreground')}
                >
                    {value ? format(value, 'MMMM yyyy') : 'Select a month'}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
                {/* Year navigation */}
                <div className="flex items-center justify-between mb-3">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewYear((y) => y - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">{viewYear}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewYear((y) => y + 1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                {/* Month grid */}
                <div className="grid grid-cols-3 gap-1">
                    {MONTHS.map((name, index) => {
                        const isSelected =
                            value !== null && value.getFullYear() === viewYear && value.getMonth() === index;
                        return (
                            <button
                                key={name}
                                type="button"
                                onClick={() => handleSelect(index)}
                                className={cn(
                                    'rounded-md px-2 py-1.5 text-sm text-center transition-colors hover:bg-accent hover:text-accent-foreground',
                                    isSelected &&
                                        'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                                )}
                            >
                                {name.slice(0, 3)}
                            </button>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}

// ── Create dialog ─────────────────────────────────────────────────────────────

function CreatePayrollRunDialog({ onCreated }: { onCreated: () => void }) {
    const [open, setOpen] = React.useState(false);
    const [selectedMonth, setSelectedMonth] = React.useState<Date | null>(null);
    const { workspace } = useAuthenticationState();
    const { t } = useTranslation();

    const { mutate, isPending } = useMutation({
        mutationFn: createPayrollRun,
        onSuccess: () => {
            toast.success(t('payroll.created', { ns: 'glossary', defaultValue: 'Payroll run created.' }));
            setOpen(false);
            setSelectedMonth(null);
            onCreated();
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data?.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });

    const handleSubmit = React.useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (!workspace || !selectedMonth) return;
            mutate({
                workspacePublicId: workspace.publicId,
                period: format(selectedMonth, 'yyyy-MM'),
            });
        },
        [mutate, selectedMonth, workspace],
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="h-4 w-4" />
                    {t('payroll.new_run', { ns: 'glossary', defaultValue: 'New Payroll Run' })}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>
                        {t('payroll.new_run', { ns: 'glossary', defaultValue: 'New Payroll Run' })}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium">
                            {t('payroll.period', { ns: 'glossary', defaultValue: 'Period' })}
                        </p>
                        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending || !selectedMonth} className="w-full">
                            {t('create')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Status badge ──────────────────────────────────────────────────────────────

function PayrollRunStatusBadge({ status }: { status: PayrollRunStatusEnum }) {
    if (status === PayrollRunStatusEnum.FINALIZED) {
        return <Badge variant="default">{status}</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
}

// ── Run row ───────────────────────────────────────────────────────────────────

function PayrollRunRow({ run, workspacePublicId }: { run: PayrollRun; workspacePublicId: string }) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const { mutate: finalize, isPending: isFinalizing } = useMutation({
        mutationFn: finalizePayrollRun,
        onSuccess: () => {
            toast.success(t('payroll.finalized', { ns: 'glossary', defaultValue: 'Payroll run finalized.' }));
            queryClient.invalidateQueries({ queryKey: ['payroll-runs', workspacePublicId] });
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data?.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });

    const { mutate: remove, isPending: isDeleting } = useMutation({
        mutationFn: deletePayrollRun,
        onSuccess: () => {
            toast.success(t('payroll.deleted', { ns: 'glossary', defaultValue: 'Payroll run deleted.' }));
            queryClient.invalidateQueries({ queryKey: ['payroll-runs', workspacePublicId] });
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data?.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });

    const isDraft = run.status === PayrollRunStatusEnum.DRAFT;

    return (
        <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-4">
                <span className="font-medium">{format(new Date(run.period), 'MMMM yyyy')}</span>
                <PayrollRunStatusBadge status={run.status} />
            </div>
            <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                    <Link to="/console/payroll/$runPublicId" params={{ runPublicId: run.publicId }}>
                        {t('view')}
                    </Link>
                </Button>
                {isDraft && (
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={isFinalizing}
                        onClick={() => finalize({ workspacePublicId, runPublicId: run.publicId })}
                    >
                        <BadgeCheck className="h-4 w-4" />
                        {t('payroll.finalize', { ns: 'glossary', defaultValue: 'Finalize' })}
                    </Button>
                )}
                {isDraft && (
                    <Button
                        variant="destructive"
                        size="sm"
                        disabled={isDeleting}
                        onClick={() => remove({ workspacePublicId, runPublicId: run.publicId })}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function PayrollListPage() {
    const { t } = useTranslation();
    const { workspace } = useAuthenticationState();
    const queryClient = useQueryClient();

    const { data: runs = [], isLoading } = useQuery({
        queryKey: ['payroll-runs', workspace?.publicId],
        queryFn: () => fetchPayrollRuns(workspace!.publicId),
        enabled: !!workspace,
    });

    const handleCreated = React.useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['payroll-runs', workspace?.publicId] });
    }, [queryClient, workspace?.publicId]);

    return (
        <div className="w-full px-6 py-5 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <DollarSign className="h-4 w-4" />
                    </span>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">{t('payroll')}</h1>
                        <p className="text-sm text-muted-foreground">
                            {t('payroll.description', {
                                ns: 'glossary',
                                defaultValue: 'Manage payroll runs and payslips',
                            })}
                        </p>
                    </div>
                </div>
                <CreatePayrollRunDialog onCreated={handleCreated} />
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                        {t('payroll.runs', { ns: 'glossary', defaultValue: 'Payroll Runs' })}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {isLoading && <p className="text-sm text-muted-foreground py-4 text-center">{t('loading')}</p>}
                    {!isLoading && runs.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                            {t('payroll.no_runs', { ns: 'glossary', defaultValue: 'No payroll runs yet.' })}
                        </p>
                    )}
                    {runs.map((run) => (
                        <PayrollRunRow key={run.publicId} run={run} workspacePublicId={workspace?.publicId ?? ''} />
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
