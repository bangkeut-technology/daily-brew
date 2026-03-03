import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createShift, deleteShift, fetchShifts } from '@/services/shift';
import { useAuthenticationState } from '@/hooks/use-authentication';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { Clock, Plus, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shift } from '@/types/shift';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/console/_authenticated/_layout/shifts/')({
    component: ShiftListPage,
});

// ── Create dialog ─────────────────────────────────────────────────────────────

type CreateShiftForm = {
    name: string;
    graceLateMinutes: number;
    graceEarlyMinutes: number;
};

function CreateShiftDialog({ onCreated }: { onCreated: () => void }) {
    const [open, setOpen] = React.useState(false);
    const { workspace } = useAuthenticationState();
    const { t } = useTranslation();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateShiftForm>({
        defaultValues: { name: '', graceLateMinutes: 0, graceEarlyMinutes: 0 },
    });

    const { mutate, isPending } = useMutation({
        mutationFn: createShift,
        onSuccess: () => {
            toast.success(t('shifts.created', { ns: 'glossary', defaultValue: 'Shift created.' }));
            setOpen(false);
            reset();
            onCreated();
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data?.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });

    const onSubmit = (values: CreateShiftForm) => {
        if (!workspace) return;
        mutate({
            workspacePublicId: workspace.publicId,
            data: {
                name: values.name,
                graceLateMinutes: Number(values.graceLateMinutes),
                graceEarlyMinutes: Number(values.graceEarlyMinutes),
            },
        });
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
                <Button size="sm">
                    <Plus className="h-4 w-4" />
                    {t('shifts.new', { ns: 'glossary', defaultValue: 'New Shift' })}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>{t('shifts.new', { ns: 'glossary', defaultValue: 'New Shift' })}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="name">{t('name')}</Label>
                        <Input
                            id="name"
                            placeholder={t('shifts.name_placeholder', {
                                ns: 'glossary',
                                defaultValue: 'e.g. Morning, Fullday Service',
                            })}
                            {...register('name', { required: true })}
                        />
                        {errors.name && <p className="text-xs text-destructive">{t('required')}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="graceLate">
                                {t('shifts.grace_late', { ns: 'glossary', defaultValue: 'Late grace (min)' })}
                            </Label>
                            <Input id="graceLate" type="number" min={0} {...register('graceLateMinutes', { min: 0 })} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="graceEarly">
                                {t('shifts.grace_early', { ns: 'glossary', defaultValue: 'Early grace (min)' })}
                            </Label>
                            <Input
                                id="graceEarly"
                                type="number"
                                min={0}
                                {...register('graceEarlyMinutes', { min: 0 })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending} className="w-full">
                            {t('create')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Shift card ────────────────────────────────────────────────────────────────

function ShiftCard({ shift, workspacePublicId }: { shift: Shift; workspacePublicId: string }) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const { mutate: remove, isPending: isDeleting } = useMutation({
        mutationFn: deleteShift,
        onSuccess: () => {
            toast.success(t('shifts.deleted', { ns: 'glossary', defaultValue: 'Shift deleted.' }));
            queryClient.invalidateQueries({ queryKey: ['shifts', workspacePublicId] });
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data?.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });

    return (
        <div className="flex items-center justify-between rounded-md border p-3">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="font-medium">{shift.name}</span>
                    {shift.timeRules.length > 0 && (
                        <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {shift.timeRules.length}
                        </Badge>
                    )}
                    <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        {shift.employees.length}
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                    {t('shifts.grace_info', {
                        ns: 'glossary',
                        defaultValue: 'Late: {{late}}min · Early: {{early}}min',
                        late: shift.graceLateMinutes,
                        early: shift.graceEarlyMinutes,
                    })}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                    <Link to="/console/shifts/$shiftPublicId" params={{ shiftPublicId: shift.publicId }}>
                        {t('view')}
                    </Link>
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => remove({ workspacePublicId, publicId: shift.publicId })}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function ShiftListPage() {
    const { t } = useTranslation();
    const { workspace } = useAuthenticationState();
    const queryClient = useQueryClient();

    const { data: shifts = [], isLoading } = useQuery({
        queryKey: ['shifts', workspace?.publicId],
        queryFn: () => fetchShifts(workspace!.publicId),
        enabled: !!workspace,
    });

    const handleCreated = React.useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['shifts', workspace?.publicId] });
    }, [queryClient, workspace?.publicId]);

    return (
        <div className="w-full px-6 py-5 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Clock className="h-4 w-4" />
                    </span>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">{t('shifts')}</h1>
                        <p className="text-sm text-muted-foreground">
                            {t('shifts.description', {
                                ns: 'glossary',
                                defaultValue: 'Manage work shifts and employee assignments',
                            })}
                        </p>
                    </div>
                </div>
                <CreateShiftDialog onCreated={handleCreated} />
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                        {t('shifts.all', { ns: 'glossary', defaultValue: 'All Shifts' })}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {isLoading && <p className="text-sm text-muted-foreground py-4 text-center">{t('loading')}</p>}
                    {!isLoading && shifts.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                            {t('shifts.empty', { ns: 'glossary', defaultValue: 'No shifts configured yet.' })}
                        </p>
                    )}
                    {shifts.map((shift) => (
                        <ShiftCard key={shift.publicId} shift={shift} workspacePublicId={workspace?.publicId ?? ''} />
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
