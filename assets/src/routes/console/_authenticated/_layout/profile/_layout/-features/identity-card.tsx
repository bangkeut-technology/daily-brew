import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UpdateUser, User } from '@/types/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { updateUser } from '@/services/user';
import { userSchema } from '@/schema/user-schema';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { TextField } from '@/components/text-field';
import { useTranslation } from 'react-i18next';
import { Pencil, User2 } from 'lucide-react';
import { toast } from 'sonner';
import { errorHandler } from '@/lib/utils';
import { useAuthenticationDispatch } from '@/hooks/use-authentication';

type IdentityCardProps = {
    user: User;
};

export const IdentityCard: React.FunctionComponent<IdentityCardProps> = ({ user }) => {
    const { t } = useTranslation();
    const dispatch = useAuthenticationDispatch();
    const [open, setOpen] = React.useState(false);
    const form = useForm<UpdateUser>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            firstName: user.firstName,
            lastName: user.lastName,
        },
    });
    const { mutate, isPending } = useMutation({
        mutationFn: updateUser,
        onSuccess: (data) => {
            toast.success(data.message);
            setOpen(false);
            dispatch({ type: 'UPDATE_USER', user: data.user });
        },
        onError: errorHandler,
    });

    const onSubmit = React.useCallback(
        (data: UpdateUser) => {
            mutate({ data });
        },
        [mutate],
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Identity</CardTitle>
                <CardDescription>Your account identity and access level</CardDescription>
            </CardHeader>

            <CardContent className="flex items-center gap-6">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>
                        {user.firstName[0]}
                        {user.lastName[0]}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                    <div className="font-medium">
                        {user.firstName} {user.lastName}
                    </div>

                    <div className="text-sm text-muted-foreground">{user.email}</div>

                    <div className="flex gap-2 pt-2">
                        {user.roles.map((role) => (
                            <Badge key={role} variant="secondary">
                                {role.replace('ROLE_', '')}
                            </Badge>
                        ))}

                        {!user.enabled && <Badge variant="destructive">Disabled</Badge>}
                    </div>
                </div>

                <Dialog
                    open={open}
                    onOpenChange={(open) => {
                        if (open) {
                            form.reset({ firstName: user.firstName, lastName: user.lastName });
                        }
                        setOpen(open);
                    }}
                >
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <Pencil />
                            Edit
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Identity</DialogTitle>
                            <DialogDescription>Update how your name appears across Adora.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            <Form {...form}>
                                <form className="flex flex-col gap-4">
                                    <TextField
                                        control={form.control}
                                        name="firstName"
                                        label={t('first_name')}
                                        placeholder="John"
                                        autoComplete="given-name"
                                        className="w-full"
                                        startIcon={
                                            <User2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        }
                                        disabled={isPending}
                                    />
                                    <TextField
                                        control={form.control}
                                        name="lastName"
                                        label={t('last_name')}
                                        placeholder="Doe"
                                        autoComplete="family-name"
                                        className="w-full"
                                        startIcon={
                                            <User2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        }
                                        disabled={isPending}
                                    />
                                </form>
                            </Form>
                        </div>

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
                                Cancel
                            </Button>

                            <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
                                {isPending ? 'Saving…' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
};

IdentityCard.displayName = 'IdentityCard';
