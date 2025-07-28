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
import { EvaluationCriteriaSelect } from '@/components/select/evaluation-criteria-select';
import { Loader2Icon, Save } from 'lucide-react';
import { evaluationTemplateCriteriasSchema } from '@/schema/evaluation-template-schema';
import { yupResolver } from '@hookform/resolvers/yup';
import { EvaluationTemplate, EvaluationTemplateCriterias } from '@/types/evaluation-template';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { postTemplateCriterias } from '@/services/evaluation-template';

interface AddEvaluationCriteriaDialogProps {
    template: EvaluationTemplate;
    onSuccess?: () => void;
}

export const AddEvaluationCriteriaDialog: React.FunctionComponent<AddEvaluationCriteriaDialogProps> = ({
    template,
    onSuccess,
}) => {
    const { t } = useTranslation();
    const form = useForm<EvaluationTemplateCriterias>({
        resolver: yupResolver(evaluationTemplateCriteriasSchema),
        defaultValues: {
            criterias: [],
        },
    });
    const { mutate, isPending } = useMutation({
        mutationFn: postTemplateCriterias,
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
                publicId: template.publicId,
                criterias: data.criterias?.map((criteria) => criteria.value) || [],
            });
        },
        [mutate, template.publicId],
    );

    return (
        <Dialog>
            <Form {...form}>
                <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="ml-2 mt-2 md:mt-0">
                        {t('evaluation_templates.criteria.add.title', { ns: 'glossary' })}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>{t('evaluation_templates.edit.title', { ns: 'glossary' })}</DialogTitle>
                    <DialogDescription>
                        {t('evaluation_templates.edit.description', { ns: 'glossary' })}
                    </DialogDescription>
                    <EvaluationCriteriaSelect
                        control={form.control}
                        name="criterias"
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
