import React from 'react';
import { Employee, PartialEmployee } from '@/types/employee';
import { useForm } from 'react-hook-form';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { FilePenLine, Loader2Icon, Save } from 'lucide-react';
import { employeeSchema } from '@/schema/employee-schema';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { putEmployee } from '@/services/employee';
import { EmployeeForm } from '@/components/form/employee-form';

interface EditEmployeeDialogProps {
    className?: string;
    employee: Employee;
    onSuccess?: (employee: Employee) => void;
}

export const EditEmployeeDialog: React.FC<EditEmployeeDialogProps> = ({ className, employee, onSuccess }) => {
    const { t } = useTranslation();
    const [open, setOpen] = React.useState(false);
    const { mutate, isPending } = useMutation({
        mutationFn: putEmployee,
        onSuccess: (data) => {
            toast.success(data.message);
            setOpen(false);
            if (onSuccess) {
                onSuccess(data.employee);
            }
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });
    const form = useForm<PartialEmployee>({
        resolver: yupResolver(employeeSchema),
        defaultValues: {
            firstName: employee.firstName,
            lastName: employee.lastName,
            phoneNumber: employee.phoneNumber,
            dob: employee.dob ? new Date(employee.dob) : undefined,
            joinedAt: employee.joinedAt ? new Date(employee.joinedAt) : undefined,
            roles: employee.roles.map((role) => ({ value: role.id })),
        },
    });

    const onSubmit = React.useCallback(
        (data: PartialEmployee) => {
            mutate({ data, publicId: employee.publicId });
        },
        [mutate, employee.publicId],
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Form {...form}>
                <DialogTrigger asChild>
                    <Button className={className}>
                        <FilePenLine />
                        {t('edit')}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>{t('evaluation_criterias.edit.title', { ns: 'glossary' })}</DialogTitle>
                    <DialogDescription>
                        {t('evaluation_criterias.edit.description', { ns: 'glossary' })}
                    </DialogDescription>
                    <EmployeeForm form={form} isPending={isPending} />
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
