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
import { Loader2Icon, Save } from 'lucide-react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { EvaluationCriteria, EvaluationTemplateCriterias } from '@/types/evaluation-criteria';
import { evaluationTemplateCriteriasSchema } from '@/schema/evaluation-criteria-schema';
import { postCriteriaTemplates } from '@/services/evaluation-criteria';
import { EvaluationTemplateMultiSelect } from '@/components/select/evaluation-template-multi-select';

interface AddEvaluationTemplateDialogProps {
    criteria: EvaluationCriteria;
    onSuccess?: () => void;
}

export const AddEvaluationTemplateDialog: React.FunctionComponent<AddEvaluationTemplateDialogProps> = ({
    criteria,
    onSuccess,
}) => {
    const { t } = useTranslation();
    const form = useForm<EvaluationTemplateCriterias>({
        resolver: yupResolver(evaluationTemplateCriteriasSchema),
        defaultValues: {
            templates: [],
        },
    });
    const { mutate, isPending } = useMutation({
        mutationFn: postCriteriaTemplates,
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
        (data: EvaluationTemplateCriterias) => {
            mutate({
                publicId: criteria.publicId,
                templates: data.templates?.map((template) => template.value) || [],
            });
        },
        [mutate, criteria.publicId],
    );

    return (
        <Dialog>
            <Form {...form}>
                <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="ml-2 mt-2 md:mt-0">
                        {t('evaluation_criterias.template.add.title', { ns: 'glossary' })}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>{t('evaluation_criterias.edit.title', { ns: 'glossary' })}</DialogTitle>
                    <DialogDescription>
                        {t('evaluation_criterias.edit.description', { ns: 'glossary' })}
                    </DialogDescription>
                    <EvaluationTemplateMultiSelect
                        control={form.control}
                        name="templates"
                        title={t('evaluation_criterias.table.title', { ns: 'glossary' })}
                        description={t('evaluation_criterias.table.description', { ns: 'glossary' })}
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
