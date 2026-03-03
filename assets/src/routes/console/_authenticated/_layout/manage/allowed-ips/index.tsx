import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { createColumnHelper } from '@tanstack/table-core';
import { Pencil, PlusCircle, Shield, Trash2 } from 'lucide-react';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { useAuthenticationState } from '@/hooks/use-authentication';
import { createAllowedIp, deleteAllowedIp, fetchAllowedIps, updateAllowedIp } from '@/services/allowed-ip';
import { AllowedIp, CreateAllowedIpPayload, UpdateAllowedIpPayload } from '@/types/allowed-ip';
import { DataTable } from '@/components/data-table';
import { RowSelectionState } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export const Route = createFileRoute('/console/_authenticated/_layout/manage/allowed-ips/')({
    component: AllowedIpsPage,
});

const columnHelper = createColumnHelper<AllowedIp>();

/* ------------------------------------------------------------------ */
/* IP form                                                              */
/* ------------------------------------------------------------------ */

type IpFormValues = { ip: string; label: string; isActive: boolean };

function IpForm({
    defaultValues,
    onSubmit,
    isPending,
    onCancel,
}: {
    defaultValues?: Partial<IpFormValues>;
    onSubmit: (values: IpFormValues) => void;
    isPending: boolean;
    onCancel: () => void;
}) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<IpFormValues>({
        defaultValues: { ip: '', label: '', isActive: true, ...defaultValues },
    });

    const isActive = watch('isActive');

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="ip">IP Address</Label>
                <Input id="ip" placeholder="192.168.1.0" {...register('ip', { required: 'IP address is required' })} />
                {errors.ip && <p className="text-xs text-destructive">{errors.ip.message}</p>}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="label">Label (optional)</Label>
                <Input id="label" placeholder="Office network" {...register('label')} />
            </div>

            <div className="flex items-center gap-3">
                <Switch id="isActive" checked={isActive} onCheckedChange={(v) => setValue('isActive', v)} />
                <Label htmlFor="isActive">Active</Label>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving…' : 'Save'}
                </Button>
            </DialogFooter>
        </form>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

function AllowedIpsPage() {
    const { workspace } = useAuthenticationState();
    const queryClient = useQueryClient();
    const workspacePublicId = workspace?.publicId ?? '';

    const [addOpen, setAddOpen] = React.useState(false);
    const [editTarget, setEditTarget] = React.useState<AllowedIp | null>(null);
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

    /* ---- queries ---- */
    const { data: ips = [], isPending } = useQuery({
        queryKey: ['workspace', workspacePublicId, 'allowed-ips'],
        queryFn: () => fetchAllowedIps(workspacePublicId),
        enabled: !!workspacePublicId,
    });

    /* ---- mutations ---- */
    const { mutate: doCreate, isPending: creating } = useMutation({
        mutationFn: createAllowedIp,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspace', workspacePublicId, 'allowed-ips'] });
            toast.success('IP restriction added');
            setAddOpen(false);
        },
        onError: (err) => {
            toast.error(isAxiosError(err) ? err.response?.data?.message : 'Failed to add IP');
        },
    });

    const { mutate: doUpdate, isPending: updating } = useMutation({
        mutationFn: updateAllowedIp,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspace', workspacePublicId, 'allowed-ips'] });
            toast.success('IP restriction updated');
            setEditTarget(null);
        },
        onError: (err) => {
            toast.error(isAxiosError(err) ? err.response?.data?.message : 'Failed to update IP');
        },
    });

    const { mutate: doDelete } = useMutation({
        mutationFn: deleteAllowedIp,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspace', workspacePublicId, 'allowed-ips'] });
            toast.success('IP restriction removed');
        },
        onError: (err) => {
            toast.error(isAxiosError(err) ? err.response?.data?.message : 'Failed to remove IP');
        },
    });

    /* ---- columns ---- */
    const columns = React.useMemo(
        () => [
            columnHelper.accessor('ip', {
                header: 'IP Address',
                cell: (info) => <code className="font-mono text-sm">{info.getValue()}</code>,
            }),
            columnHelper.accessor('label', {
                header: 'Label',
                cell: (info) => info.getValue() || <span className="text-muted-foreground">—</span>,
            }),
            columnHelper.accessor('isActive', {
                header: 'Status',
                cell: (info) =>
                    info.getValue() ? (
                        <Badge className="bg-green-500 text-white">Active</Badge>
                    ) : (
                        <Badge variant="secondary">Inactive</Badge>
                    ),
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditTarget(row.original)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                                doDelete({
                                    workspacePublicId,
                                    ipPublicId: row.original.publicId,
                                })
                            }
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ),
            }),
        ],
        [doDelete, workspacePublicId],
    );

    /* ---- handlers ---- */
    const handleCreate = React.useCallback(
        (values: IpFormValues) => {
            const payload: CreateAllowedIpPayload = {
                ip: values.ip,
                label: values.label || null,
                isActive: values.isActive,
            };
            doCreate({ workspacePublicId, data: payload });
        },
        [doCreate, workspacePublicId],
    );

    const handleUpdate = React.useCallback(
        (values: IpFormValues) => {
            if (!editTarget) return;
            const payload: UpdateAllowedIpPayload = {
                ip: values.ip,
                label: values.label || null,
                isActive: values.isActive,
            };
            doUpdate({ workspacePublicId, ipPublicId: editTarget.publicId, data: payload });
        },
        [doUpdate, editTarget, workspacePublicId],
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <h1 className="text-2xl font-semibold">Allowed IPs</h1>
                </div>
                <Button onClick={() => setAddOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add IP
                </Button>
            </div>

            <p className="text-sm text-muted-foreground">
                Restrict attendance check-in to these IP addresses. When no IPs are configured, check-in is allowed from
                any network.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>IP Restrictions</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={ips}
                        columns={columns}
                        loading={isPending}
                        rowSelection={rowSelection}
                        onRowSelectionChange={setRowSelection}
                    />
                </CardContent>
            </Card>

            {/* Add dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add IP Restriction</DialogTitle>
                    </DialogHeader>
                    <IpForm onSubmit={handleCreate} isPending={creating} onCancel={() => setAddOpen(false)} />
                </DialogContent>
            </Dialog>

            {/* Edit dialog */}
            <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit IP Restriction</DialogTitle>
                    </DialogHeader>
                    {editTarget && (
                        <IpForm
                            defaultValues={{
                                ip: editTarget.ip,
                                label: editTarget.label ?? '',
                                isActive: editTarget.isActive,
                            }}
                            onSubmit={handleUpdate}
                            isPending={updating}
                            onCancel={() => setEditTarget(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
