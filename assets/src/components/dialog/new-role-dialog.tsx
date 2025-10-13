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
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { roleSchema } from '@/schema/role-schema';
import { Form } from '@/components/ui/form';
import { PartialRole, Role } from '@/types/role';
import { TextField } from '@/components/field/text-field';
import { TextAreaField } from '@/components/field/textarea-field';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postRole } from '@/services/role';
import { useBoolean } from 'react-use';
import { Loader2Icon, Save } from 'lucide-react';

interface NewRoleDialogProps {
    buttonText?: string;
    title?: string;
    description?: string;
    role?: Role;
    queryKey?: string[];
}

export const NewRoleDialog: React.FunctionComponent<NewRoleDialogProps> = ({
    role,
    description,
    title,
    buttonText,
    queryKey,
}) => {
    const { t } = useTranslation();
    const [open, setOpen] = useBoolean(false);
    const queryClient = useQueryClient();
    const form = useForm<PartialRole>({
        resolver: yupResolver(roleSchema),
        defaultValues: {
            name: role?.name || '',
            description: role?.description || '',
        },
    });
    const { mutate, isPending } = useMutation({
        mutationFn: postRole,
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey }).then(() => {
                setOpen(false);
                form.reset({
                    name: '',
                    description: '',
                });
            });
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });

    const onSubmit = React.useCallback(
        (data: PartialRole) => {
            mutate(data);
        },
        [mutate],
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Form {...form}>
                <DialogTrigger asChild>
                    <Button variant="outline">{buttonText || t('new_role')}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{title || t('roles.new.title', { ns: 'glossary' })}</DialogTitle>
                        <DialogDescription>
                            {description || t('roles.new.description', { ns: 'glossary' })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <TextField
                            disabled={isPending}
                            control={form.control}
                            name="name"
                            label={t('roles.name', { ns: 'glossary' })}
                        />
                        <TextAreaField
                            disabled={isPending}
                            control={form.control}
                            name="description"
                            label={t('roles.description', { ns: 'glossary' })}
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button disabled={isPending} variant="outline">
                                {t('cancel')}
                            </Button>
                        </DialogClose>
                        <Button disabled={isPending} type="button" onClick={form.handleSubmit(onSubmit)}>
                            {isPending ? (
                                <React.Fragment>
                                    <Loader2Icon className="animate-spin" />
                                    {t('saving')}
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                    <Save />
                                    {t('save')}
                                </React.Fragment>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Form>
        </Dialog>
    );
};
