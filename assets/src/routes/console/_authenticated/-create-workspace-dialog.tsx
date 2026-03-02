import React from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWorkspace } from '@/services/workspace';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Form } from '@/components/ui/form';
import { Loader2Icon, Plus } from 'lucide-react';
import { TextField } from '@/components/field/text-field';
import { useAuthenticationDispatch } from '@/hooks/use-authentication';
import { useNavigate } from '@tanstack/react-router';

const schema = yup.object({
    name: yup.string().min(2).required(),
});

type CreateWorkspaceFormValues = yup.InferType<typeof schema>;

interface CreateWorkspaceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const CreateWorkspaceDialog: React.FC<CreateWorkspaceDialogProps> = ({ open, onOpenChange }) => {
    const dispatch = useAuthenticationDispatch();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const form = useForm<CreateWorkspaceFormValues>({
        resolver: yupResolver(schema),
        defaultValues: { name: '' },
    });

    const { mutate, isPending } = useMutation({
        mutationFn: createWorkspace,
        onSuccess: (data) => {
            dispatch({ type: 'SET_WORKSPACE', workspace: data });
            queryClient.invalidateQueries({ queryKey: ['me', 'workspaces'] });
            toast.success('Workspace created');
            onOpenChange(false);
            form.reset();
            navigate({ to: '/console' });
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data.message : 'Failed to create workspace';
            toast.error(message);
        },
    });

    const onSubmit = React.useCallback(
        (data: CreateWorkspaceFormValues) => {
            mutate(data);
        },
        [mutate],
    );

    const handleClose = React.useCallback(
        (nextOpen: boolean) => {
            if (!nextOpen) form.reset();
            onOpenChange(nextOpen);
        },
        [form, onOpenChange],
    );

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogTitle>New workspace</DialogTitle>
                <DialogDescription>Create a new workspace for your team.</DialogDescription>
                <Form {...form}>
                    <div className="grid gap-4">
                        <TextField control={form.control} name="name" label="Workspace name" placeholder="Acme Corp" />
                    </div>
                    <DialogFooter className="mt-4">
                        <DialogClose asChild>
                            <Button disabled={isPending} variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button disabled={isPending} type="button" onClick={form.handleSubmit(onSubmit)}>
                            {isPending ? (
                                <React.Fragment>
                                    <Loader2Icon className="animate-spin" />
                                    Creating…
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                    <Plus />
                                    Create
                                </React.Fragment>
                            )}
                        </Button>
                    </DialogFooter>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

CreateWorkspaceDialog.displayName = 'CreateWorkspaceDialog';
