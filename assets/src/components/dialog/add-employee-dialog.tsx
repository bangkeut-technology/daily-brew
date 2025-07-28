import React from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { EmployeeSelect } from '@/components/select/employee-select';
import { Loader2Icon, Save } from 'lucide-react';
import { evaluationTemplateEmployeesSchema } from '@/schema/evaluation-template-schema';
import { yupResolver } from '@hookform/resolvers/yup';
import { EvaluationTemplate, EvaluationTemplateEmployees } from '@/types/evaluation-template';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { postTemplateEmployees } from '@/services/evaluation-template';

interface AddEmployeeDialogProps {
    template: EvaluationTemplate;
    onSuccess?: () => void;
}

export const AddEmployeeDialog: React.FunctionComponent<AddEmployeeDialogProps> = ({ template, onSuccess }) => {
    const { t } = useTranslation();
    const form = useForm<EvaluationTemplateEmployees>({
        resolver: yupResolver(evaluationTemplateEmployeesSchema),
        defaultValues: {
            employees: [],
        },
    });
    const { mutate, isPending } = useMutation({
        mutationFn: postTemplateEmployees,
        onSuccess: (data) => {
            toast.success(data.message);
            form.reset();
            if (onSuccess) {
                onSuccess();
            }
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });

    const onSubmit = React.useCallback(
        (data: EvaluationTemplateEmployees) => {
            mutate({
                publicId: template.publicId,
                employees: data.employees?.map((employee) => employee.value) || [],
            });
        },
        [mutate, template.publicId],
    );

    return (
        <Dialog>
            <Form {...form}>
                <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="ml-2 mt-2 md:mt-0">
                        {t('evaluation_templates.employees.add.title', { ns: 'glossary' })}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>{t('evaluation_templates.edit.title', { ns: 'glossary' })}</DialogTitle>
                    <DialogDescription>
                        {t('evaluation_templates.edit.description', { ns: 'glossary' })}
                    </DialogDescription>
                    <EmployeeSelect
                        control={form.control}
                        name="employees"
                        title={t('employees.table.title', { ns: 'glossary' })}
                        description={t('employees.table.description', { ns: 'glossary' })}
                    />
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
