// src/components/workspace-switcher.tsx
import React from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthenticationDispatch, useAuthenticationState } from '@/hooks/use-authentication';
import { toast } from 'sonner';
import { fetchWorkspaces, switchWorkspace } from '@/services/user';
import { CreateWorkspaceDialog } from '@/routes/console/_authenticated/-components/create-workspace-dialog';

export function WorkspaceSwitcher() {
    const { workspace } = useAuthenticationState();
    const dispatch = useAuthenticationDispatch();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [createOpen, setCreateOpen] = React.useState(false);

    const { data: workspaces = [], isPending } = useQuery({
        queryKey: ['me', 'workspaces'],
        queryFn: fetchWorkspaces,
        staleTime: 60_000,
    });

    const { mutate: doSwitch, isPending: isSwitching } = useMutation({
        mutationFn: switchWorkspace,
        onSuccess: async (data) => {
            // You need to implement this action in your auth reducer
            dispatch({ type: 'SET_WORKSPACE', workspace: data.workspace });

            queryClient.clear();

            await navigate({ to: '/console' });
            toast.success(data.message);
        },
        onError: () => {
            toast.error('Unable to switch workspace');
        },
    });

    const currentName = workspace?.name ?? '—';

    return (
        <React.Fragment>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-auto w-full justify-between px-2 py-2"
                        disabled={isPending || isSwitching}
                    >
                        <div className="flex flex-col items-start">
                            <span className="text-xs text-muted-foreground">Workspace</span>
                            <span className="text-sm font-medium leading-tight truncate max-w-45">{currentName}</span>
                        </div>
                        <ChevronsUpDown className="h-4 w-4 opacity-60" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="min-w-64">
                    <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {workspaces.map((w) => {
                        const active = w.publicId === workspace?.publicId;
                        return (
                            <DropdownMenuItem
                                key={w.publicId}
                                onClick={() => !active && doSwitch(w.publicId)}
                                className="gap-2"
                            >
                                <Check className={cn('h-4 w-4', active ? 'opacity-100' : 'opacity-0')} />
                                <span className="truncate">{w.name}</span>
                            </DropdownMenuItem>
                        );
                    })}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            setCreateOpen(true);
                        }}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        New workspace
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
        </React.Fragment>
    );
}
