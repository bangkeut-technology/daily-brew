import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticationState } from '@/hooks/use-authentication';
import { fetchMembers, fetchInvites, revokeInvite } from '@/services/workspace';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { InviteMemberDialog } from '@/components/dialog/invite-member-dialog';
import { DataTable } from '@/components/data-table';
import { createColumnHelper } from '@tanstack/table-core';
import { RowSelectionState } from '@tanstack/react-table';
import { WorkspaceUser, WorkspaceInvite } from '@/types/workspace';

export const Route = createFileRoute('/console/_authenticated/_layout/manage/members/')({
    component: MembersPage,
});

const memberColumnHelper = createColumnHelper<WorkspaceUser>();
const inviteColumnHelper = createColumnHelper<WorkspaceInvite>();

function MembersPage() {
    const { workspace } = useAuthenticationState();
    const queryClient = useQueryClient();
    const [inviteOpen, setInviteOpen] = React.useState(false);
    const [memberSelection, setMemberSelection] = React.useState<RowSelectionState>({});
    const [inviteSelection, setInviteSelection] = React.useState<RowSelectionState>({});

    const workspacePublicId = workspace?.publicId ?? '';

    const { data: members = [], isPending: membersPending } = useQuery({
        queryKey: ['workspace', workspacePublicId, 'members'],
        queryFn: () => fetchMembers(workspacePublicId),
        enabled: !!workspacePublicId,
    });

    const { data: invites = [], isPending: invitesPending } = useQuery({
        queryKey: ['workspace', workspacePublicId, 'invites'],
        queryFn: () => fetchInvites(workspacePublicId),
        enabled: !!workspacePublicId,
    });

    const { mutate: doRevoke } = useMutation({
        mutationFn: revokeInvite,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspace', workspacePublicId, 'invites'] });
            toast.success('Invite revoked');
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data.message : 'Failed to revoke invite';
            toast.error(message);
        },
    });

    const memberColumns = React.useMemo(
        () => [
            memberColumnHelper.accessor('fullName', {
                header: 'Full Name',
                cell: (info) => info.getValue() || '—',
            }),
            memberColumnHelper.accessor('email', {
                header: 'Email',
                cell: (info) => info.getValue(),
            }),
            memberColumnHelper.accessor('role', {
                header: 'Role',
                cell: (info) => info.getValue(),
            }),
        ],
        [],
    );

    const inviteColumns = React.useMemo(
        () => [
            inviteColumnHelper.accessor('email', {
                header: 'Email',
                cell: (info) => info.getValue() || '—',
            }),
            inviteColumnHelper.accessor('role', {
                header: 'Role',
                cell: (info) => info.getValue(),
            }),
            inviteColumnHelper.accessor('expiresAt', {
                header: 'Expires',
                cell: (info) => {
                    const v = info.getValue();
                    return v ? new Date(v).toLocaleDateString() : '—';
                },
            }),
            inviteColumnHelper.accessor('status', {
                header: 'Status',
                cell: (info) => info.getValue(),
            }),
            inviteColumnHelper.display({
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => doRevoke({ workspacePublicId, invitePublicId: row.original.publicId })}
                    >
                        <Trash2 className="h-4 w-4" />
                        Revoke
                    </Button>
                ),
            }),
        ],
        [doRevoke, workspacePublicId],
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Members</h1>
                <Button onClick={() => setInviteOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite member
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={members}
                        columns={memberColumns}
                        loading={membersPending}
                        rowSelection={memberSelection}
                        onRowSelectionChange={setMemberSelection}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Invites</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={invites}
                        columns={inviteColumns}
                        loading={invitesPending}
                        rowSelection={inviteSelection}
                        onRowSelectionChange={setInviteSelection}
                    />
                </CardContent>
            </Card>

            <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} workspacePublicId={workspacePublicId} />
        </div>
    );
}
