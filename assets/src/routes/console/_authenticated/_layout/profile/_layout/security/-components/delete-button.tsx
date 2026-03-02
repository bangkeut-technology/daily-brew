import React from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { TextField } from '@/components/field/text-field';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteUser } from '@/services/user';
import { errorHandler } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuthenticationDispatch } from '@/hooks/use-authentication';
import { useNavigate } from '@tanstack/react-router';

const deleteAccountSchema = z.object({
    confirmation: z
        .string()
        .trim()
        .refine((value) => value.toUpperCase() === 'DELETE', {
            message: 'You must type DELETE to confirm',
        }),
});

type DeleteAccountForm = z.infer<typeof deleteAccountSchema>;

export const DeleteButton = () => {
    const queryClient = useQueryClient();
    const dispatch = useAuthenticationDispatch();
    const navigate = useNavigate();
    const form = useForm<DeleteAccountForm>({
        resolver: zodResolver(deleteAccountSchema),
        mode: 'onChange', // ✅ REQUIRED
        reValidateMode: 'onChange',
        defaultValues: {
            confirmation: '',
        },
    });
    const { mutate, isPending } = useMutation({
        mutationFn: deleteUser,
        onSuccess: (data) => {
            // Keep behavior consistent: clear cache + auth state + redirect
            queryClient.clear();
            dispatch({ type: 'SIGN_OUT' });
            navigate({ to: '/sign-in' });
            toast.success(data.message);
        },
        onError: errorHandler,
    });

    const handleDeleteAccount = React.useCallback(
        (_values: DeleteAccountForm) => {
            mutate();
        },
        [mutate],
    );

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isPending}>
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-destructive">Delete account</DialogTitle>
                    <DialogDescription>
                        This action is irreversible. All your data will be permanently removed.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <p>
                        Type <span className="font-mono">DELETE</span> to confirm
                    </p>
                    <TextField
                        control={form.control}
                        name="confirmation"
                        label="Confirmation"
                        required
                        autoFocus
                        autoComplete="off"
                    />
                </Form>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button">Close</Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        disabled={isPending || !form.formState.isValid}
                        onClick={form.handleSubmit(handleDeleteAccount)}
                    >
                        {isPending ? (
                            <React.Fragment>
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                Deleting account...
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <Trash2 className="mr-1 h-3 w-3" />
                                Permanently delete account
                            </React.Fragment>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
