import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addPayslipItem, deletePayslipItem, fetchPayrollRun, finalizePayrollRun, payPayslip } from '@/services/payroll';
import { useAuthenticationState } from '@/hooks/use-authentication';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { format } from 'date-fns';
import { BadgeCheck, Banknote, CalendarDays, DollarSign, Minus, Plus, Trash2, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    PartialPayslipItem,
    PayrollRun,
    PayrollRunStatusEnum,
    Payslip,
    PayslipItemTypeEnum,
    PayslipStatusEnum,
} from '@/types/payroll';
import { DISPLAY_DATE_FORMAT } from '@/constants/date';

export const Route = createFileRoute('/console/_authenticated/_layout/payroll/$publicId/')({
    component: PayrollRunDetailPage,
});

function PayrollRunStatusBadge({ status }: { status: PayrollRunStatusEnum }) {
    if (status === PayrollRunStatusEnum.FINALIZED) {
        return <Badge variant="default">{status}</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
}

function PayslipStatusBadge({ status }: { status: PayslipStatusEnum }) {
    if (status === PayslipStatusEnum.PAID) {
        return <Badge variant="default">{status}</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
}

function AddPayslipItemDialog({
    workspacePublicId,
    publicId,
    slip,
    onDone,
}: {
    workspacePublicId: string;
    publicId: string;
    slip: Payslip;
    onDone: () => void;
}) {
    const [open, setOpen] = React.useState(false);
    const [form, setForm] = React.useState<PartialPayslipItem>({
        type: PayslipItemTypeEnum.ALLOWANCE,
        label: '',
        amount: '',
    });
    const { t } = useTranslation();

    const { mutate, isPending } = useMutation({
        mutationFn: addPayslipItem,
        onSuccess: () => {
            toast.success(t('payslip.item_added', { ns: 'glossary', defaultValue: 'Item added.' }));
            setOpen(false);
            setForm({ type: PayslipItemTypeEnum.ALLOWANCE, label: '', amount: '' });
            onDone();
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data?.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutate({ workspacePublicId, publicId, slipPublicId: slip.publicId, data: form });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                    {t('payslip.add_item', { ns: 'glossary', defaultValue: 'Add Item' })}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>{t('payslip.add_item', { ns: 'glossary', defaultValue: 'Add Item' })}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <Label>{t('type', { defaultValue: 'Type' })}</Label>
                        <Select
                            value={form.type}
                            onValueChange={(v) => setForm((f) => ({ ...f, type: v as PayslipItemTypeEnum }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={PayslipItemTypeEnum.BONUS}>Bonus</SelectItem>
                                <SelectItem value={PayslipItemTypeEnum.ALLOWANCE}>Allowance</SelectItem>
                                <SelectItem value={PayslipItemTypeEnum.DEDUCTION}>Deduction</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label>{t('label', { defaultValue: 'Label' })}</Label>
                        <Input
                            value={form.label}
                            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>{t('amount', { defaultValue: 'Amount' })}</Label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.amount}
                            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                            required
                        />
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

function PayslipCard({
    slip,
    run,
    workspacePublicId,
    onRefresh,
}: {
    slip: Payslip;
    run: PayrollRun;
    workspacePublicId: string;
    onRefresh: () => void;
}) {
    const { t } = useTranslation();
    const isDraft = run.status === PayrollRunStatusEnum.DRAFT;
    const isPending = slip.status === PayslipStatusEnum.PENDING;

    const { mutate: pay, isPending: isPaying } = useMutation({
        mutationFn: payPayslip,
        onSuccess: () => {
            toast.success(t('payslip.paid', { ns: 'glossary', defaultValue: 'Marked as paid.' }));
            onRefresh();
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data?.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });

    const { mutate: removeItem } = useMutation({
        mutationFn: deletePayslipItem,
        onSuccess: () => {
            toast.success(t('payslip.item_removed', { ns: 'glossary', defaultValue: 'Item removed.' }));
            onRefresh();
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data?.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{slip.employee?.fullName ?? '-'}</span>
                        <PayslipStatusBadge status={slip.status} />
                    </div>
                    <div className="flex items-center gap-2">
                        {isDraft && (
                            <AddPayslipItemDialog
                                workspacePublicId={workspacePublicId}
                                publicId={run.publicId}
                                slip={slip}
                                onDone={onRefresh}
                            />
                        )}
                        {isPending && !isDraft && (
                            <Button
                                size="sm"
                                disabled={isPaying}
                                onClick={() =>
                                    pay({
                                        workspacePublicId,
                                        publicId: run.publicId,
                                        slipPublicId: slip.publicId,
                                    })
                                }
                            >
                                <Banknote className="h-4 w-4" />
                                {t('payslip.mark_paid', { ns: 'glossary', defaultValue: 'Mark Paid' })}
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Summary row */}
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4 text-sm">
                    <div className="rounded-md border p-2">
                        <p className="text-xs text-muted-foreground">Base Salary</p>
                        <p className="font-semibold">
                            {slip.currency} {Number(slip.baseSalary).toFixed(2)}
                        </p>
                    </div>
                    <div className="rounded-md border p-2">
                        <p className="text-xs text-muted-foreground">Allowances</p>
                        <p className="font-semibold text-green-600">
                            + {slip.currency} {Number(slip.totalAllowances).toFixed(2)}
                        </p>
                    </div>
                    <div className="rounded-md border p-2">
                        <p className="text-xs text-muted-foreground">Deductions</p>
                        <p className="font-semibold text-red-500">
                            - {slip.currency} {Number(slip.totalDeductions).toFixed(2)}
                        </p>
                    </div>
                    <div className="rounded-md border p-2 bg-muted/40">
                        <p className="text-xs text-muted-foreground">Net Pay</p>
                        <p className="font-bold">
                            {slip.currency} {Number(slip.netPay).toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Attendance days */}
                <div className="grid grid-cols-3 gap-2 md:grid-cols-6 text-xs text-center">
                    {[
                        { label: 'Working', value: slip.workingDays },
                        { label: 'Present', value: slip.presentDays },
                        { label: 'Absent', value: slip.absentDays },
                        { label: 'Late', value: slip.lateDays },
                        { label: 'Paid Leave', value: slip.paidLeaveDays },
                        { label: 'Unpaid Leave', value: slip.unpaidLeaveDays },
                    ].map(({ label, value }) => (
                        <div key={label} className="rounded-md border p-2">
                            <p className="text-muted-foreground">{label}</p>
                            <p className="font-semibold text-sm">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Items */}
                {slip.items && slip.items.length > 0 && (
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Items</p>
                        {slip.items.map((item) => (
                            <div
                                key={item.publicId}
                                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    {item.type === PayslipItemTypeEnum.DEDUCTION ? (
                                        <Minus className="h-3 w-3 text-red-500" />
                                    ) : (
                                        <Plus className="h-3 w-3 text-green-600" />
                                    )}
                                    <span className="capitalize text-xs text-muted-foreground">{item.type}</span>
                                    <span>{item.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={
                                            item.type === PayslipItemTypeEnum.DEDUCTION
                                                ? 'text-red-500'
                                                : 'text-green-600'
                                        }
                                    >
                                        {item.type === PayslipItemTypeEnum.DEDUCTION ? '-' : '+'}
                                        {slip.currency} {Number(item.amount).toFixed(2)}
                                    </span>
                                    {isDraft && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() =>
                                                removeItem({
                                                    workspacePublicId,
                                                    publicId: run.publicId,
                                                    slipPublicId: slip.publicId,
                                                    itemPublicId: item.publicId,
                                                })
                                            }
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {slip.notes && <p className="text-sm text-muted-foreground italic">{slip.notes}</p>}
            </CardContent>
        </Card>
    );
}

function PayrollRunDetailPage() {
    const { publicId } = Route.useParams();
    const { workspace } = useAuthenticationState();
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const queryKey = React.useMemo(
        () => ['payroll-run', workspace?.publicId, publicId],
        [workspace?.publicId, publicId],
    );

    const { data: run, isLoading } = useQuery({
        queryKey,
        queryFn: () =>
            fetchPayrollRun({
                workspacePublicId: workspace!.publicId,
                publicId,
            }),
        enabled: !!workspace,
    });

    const { mutate: finalize, isPending: isFinalizing } = useMutation({
        mutationFn: finalizePayrollRun,
        onSuccess: () => {
            toast.success(t('payroll.finalized', { ns: 'glossary', defaultValue: 'Payroll run finalized.' }));
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data?.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });

    const onRefresh = React.useCallback(() => {
        queryClient.invalidateQueries({ queryKey });
    }, [queryClient, queryKey]);

    if (isLoading || !run) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                {t('loading', { defaultValue: 'Loading…' })}
            </div>
        );
    }

    const isDraft = run.status === PayrollRunStatusEnum.DRAFT;

    return (
        <div className="w-full px-6 py-5 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <DollarSign className="h-4 w-4" />
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl md:text-3xl font-bold">
                                {format(new Date(run.period), 'MMMM yyyy')}
                            </h1>
                            <PayrollRunStatusBadge status={run.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {t('payroll.run_detail', {
                                ns: 'glossary',
                                defaultValue: 'Payroll run details and payslips',
                            })}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {isDraft && (
                        <Button
                            disabled={isFinalizing}
                            onClick={() =>
                                finalize({
                                    workspacePublicId: workspace!.publicId,
                                    publicId: run.publicId,
                                })
                            }
                        >
                            <BadgeCheck className="h-4 w-4" />
                            {t('payroll.finalize', { ns: 'glossary', defaultValue: 'Finalize' })}
                        </Button>
                    )}
                </div>
            </div>

            {/* Meta info */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t('summary')}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-md border p-3">
                        <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />
                            <span>{t('payroll.period', { ns: 'glossary', defaultValue: 'Period' })}</span>
                        </div>
                        <div className="font-medium">{format(new Date(run.period), 'MMMM yyyy')}</div>
                    </div>
                    <div className="rounded-md border p-3">
                        <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <BadgeCheck className="h-4 w-4" />
                            <span>{t('status')}</span>
                        </div>
                        <PayrollRunStatusBadge status={run.status} />
                    </div>
                    {run.processedAt && (
                        <div className="rounded-md border p-3">
                            <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                                <CalendarDays className="h-4 w-4" />
                                <span>
                                    {t('payroll.processed_at', {
                                        ns: 'glossary',
                                        defaultValue: 'Processed At',
                                    })}
                                </span>
                            </div>
                            <div className="font-medium">{format(new Date(run.processedAt), DISPLAY_DATE_FORMAT)}</div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Payslips */}
            <div className="space-y-2">
                <h2 className="text-lg font-semibold">
                    {t('payslips', { defaultValue: 'Payslips' })} ({run.payslips?.length ?? 0})
                </h2>
                {(!run.payslips || run.payslips.length === 0) && (
                    <p className="text-sm text-muted-foreground py-4">
                        {t('payroll.no_payslips', {
                            ns: 'glossary',
                            defaultValue: 'No payslips generated for this run.',
                        })}
                    </p>
                )}
                {run.payslips?.map((slip) => (
                    <PayslipCard
                        key={slip.publicId}
                        slip={slip}
                        run={run}
                        workspacePublicId={workspace?.publicId ?? ''}
                        onRefresh={onRefresh}
                    />
                ))}
            </div>
        </div>
    );
}
