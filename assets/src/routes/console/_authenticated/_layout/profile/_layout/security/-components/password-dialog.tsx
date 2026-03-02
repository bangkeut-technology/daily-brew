import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { TextField } from '@/components/field/text-field';
import { Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { changePassword } from '@/services/user';
import { ChangePassword } from '@/types/user';

const createChangePasswordSchema = (hasPassword: boolean) =>
    z
        .object({
            currentPassword: hasPassword ? z.string().min(1, 'Current password is required') : z.string().optional(),
            plainPassword: z.object({
                first: z.string().min(8, 'Password must be at least 8 characters'),
                second: z.string(),
            }),
        })
        .refine((data) => data.plainPassword.first === data.plainPassword.second, {
            path: ['plainPassword', 'second'],
            message: 'Passwords do not match',
        });

type PasswordDialogProps = { hasPassword: boolean };

export const PasswordDialog: React.FunctionComponent<PasswordDialogProps> = ({ hasPassword }) => {
    const schema = React.useMemo(() => createChangePasswordSchema(hasPassword), [hasPassword]);
    const form = useForm<ChangePassword>({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: {
            currentPassword: '',
            plainPassword: {
                first: '',
                second: '',
            },
        },
    });
    const { mutate, isPending } = useMutation({
        mutationFn: changePassword,
    });

    const onSubmit = React.useCallback(
        (values: ChangePassword) => {
            mutate(values);
        },
        [mutate],
    );

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={hasPassword ? 'outline' : 'default'} size="sm">
                    {hasPassword ? 'Change' : 'Set password'}
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{hasPassword ? 'Change password' : 'Set password'}</DialogTitle>
                    <DialogDescription>
                        {hasPassword ? 'Update your account password.' : 'Create a password to enable password login.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <div className="space-y-3">
                        {hasPassword && (
                            <TextField
                                control={form.control}
                                name="currentPassword"
                                label="Current password"
                                type="password"
                                autoComplete="current-password"
                                disabled={isPending}
                            />
                        )}

                        <TextField
                            control={form.control}
                            name="plainPassword.first"
                            label="New password"
                            type="password"
                            autoComplete="new-password"
                            disabled={isPending}
                        />

                        <TextField
                            control={form.control}
                            name="plainPassword.second"
                            label="Confirm password"
                            type="password"
                            autoComplete="new-password"
                            disabled={isPending}
                        />
                    </div>
                </Form>

                <DialogFooter>
                    <Button
                        type="submit"
                        disabled={!form.formState.isValid || isPending}
                        onClick={form.handleSubmit(onSubmit)}
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {hasPassword ? 'Update password' : 'Set password'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

PasswordDialog.displayName = 'PasswordDialog';
