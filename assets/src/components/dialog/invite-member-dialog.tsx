import React from 'react';
import { useTranslation } from 'react-i18next';
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
import { createInvite } from '@/services/workspace';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Form } from '@/components/ui/form';
import { Loader2Icon, Send } from 'lucide-react';
import { TextField } from '@/components/field/text-field';
import { SelectField } from '@/components/field/select-field';

const schema = yup.object({
    email: yup.string().email().required(),
    role: yup.string().oneOf(['ADMIN', 'MANAGER', 'EMPLOYEE']).required(),
});

type InviteFormValues = yup.InferType<typeof schema>;

interface InviteMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspacePublicId: string;
}

const ROLE_OPTIONS = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'EMPLOYEE', label: 'Employee' },
];

export const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({ open, onOpenChange, workspacePublicId }) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [token, setToken] = React.useState<string | null>(null);

    const form = useForm<InviteFormValues>({
        resolver: yupResolver(schema),
        defaultValues: { email: '', role: 'EMPLOYEE' },
    });

    const { mutate, isPending } = useMutation({
        mutationFn: (data: InviteFormValues) => createInvite(workspacePublicId, data),
        onSuccess: (data) => {
            setToken(data.token);
            queryClient.invalidateQueries({ queryKey: ['workspace', workspacePublicId, 'invites'] });
            toast.success('Invite created');
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });

    const handleClose = React.useCallback(
        (nextOpen: boolean) => {
            if (!nextOpen) {
                setToken(null);
                form.reset();
            }
            onOpenChange(nextOpen);
        },
        [form, onOpenChange],
    );

    const onSubmit = React.useCallback(
        (data: InviteFormValues) => {
            mutate(data);
        },
        [mutate],
    );

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-106.25">
                <DialogTitle>Invite member</DialogTitle>
                <DialogDescription>Send an invite link to a team member.</DialogDescription>
                {token ? (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">Share this invite token with your team member:</p>
                        <code className="block w-full break-all rounded-md bg-muted p-3 text-xs select-all">
                            {token}
                        </code>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                                navigator.clipboard.writeText(token);
                                toast.success('Copied to clipboard');
                            }}
                        >
                            Copy token
                        </Button>
                    </div>
                ) : (
                    <Form {...form}>
                        <div className="grid gap-4">
                            <TextField control={form.control} name="email" label="Email" type="email" />
                            <SelectField
                                control={form.control}
                                name="role"
                                label="Role"
                                options={ROLE_OPTIONS}
                                placeholder="Select a role"
                            />
                        </div>
                        <DialogFooter className="mt-4">
                            <DialogClose asChild>
                                <Button disabled={isPending} variant="outline">
                                    {t('cancel')}
                                </Button>
                            </DialogClose>
                            <Button disabled={isPending} type="button" onClick={form.handleSubmit(onSubmit)}>
                                {isPending ? (
                                    <React.Fragment>
                                        <Loader2Icon className="animate-spin" />
                                        Sending…
                                    </React.Fragment>
                                ) : (
                                    <React.Fragment>
                                        <Send />
                                        Send invite
                                    </React.Fragment>
                                )}
                            </Button>
                        </DialogFooter>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
};

InviteMemberDialog.displayName = 'InviteMemberDialog';
