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
import { PartialRole } from '@/types/role';
import { TextField } from '@/components/field/text-field';
import { TextAreaField } from '@/components/field/textarea-field';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postRole } from '@/services/role';
import { useBoolean } from 'react-use';
import { Loader2Icon } from 'lucide-react';

interface NewRoleDialogProps {
    queryKey?: string[];
}

export const NewRoleDialog: React.FunctionComponent<NewRoleDialogProps> = ({ queryKey }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useBoolean(false);
    const queryClient = useQueryClient();
    const form = useForm<PartialRole>({
        resolver: yupResolver(roleSchema),
        defaultValues: {
            name: '',
            description: '',
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
            const message = isAxiosError(error) ? error.response?.data.message : t('error:occurred');
            toast.error(message);
        },
    });

    const onSubmit = React.useCallback(
        (data: PartialRole) => {
            console.log('Submitting new role:', data);
            mutate(data);
        },
        [mutate],
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Form {...form}>
                <DialogTrigger asChild>
                    <Button variant="outline">{t('new_role')}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t('glossary:role.new.title')}</DialogTitle>
                        <DialogDescription>{t('glossary:role.new.description')}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <TextField
                            disabled={isPending}
                            control={form.control}
                            name="name"
                            label={t('glossary:role.name')}
                        />
                        <TextAreaField
                            disabled={isPending}
                            control={form.control}
                            name="description"
                            label={t('glossary:role.description')}
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button disabled={isPending} variant="outline">
                                {t('cancel')}
                            </Button>
                        </DialogClose>
                        <Button
                            disabled={isPending}
                            type="button"
                            onClick={form.handleSubmit(onSubmit, (errors) => {
                                console.error(errors);
                            })}
                        >
                            {isPending ? (
                                <React.Fragment>
                                    <Loader2Icon className="animate-spin" />
                                    {t('saving')}
                                </React.Fragment>
                            ) : (
                                t('save')
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Form>
        </Dialog>
    );
};
