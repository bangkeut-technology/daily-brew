import React from 'react';
import { useTranslation } from 'react-i18next';
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
import { useBoolean } from 'react-use';
import { useMutation } from '@tanstack/react-query';
import { putEvaluationCriteria } from '@/services/evaluation-criteria';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { EvaluationCriteria, PartialEvaluationCriteria } from '@/types/evaluation-criteria';
import { yupResolver } from '@hookform/resolvers/yup';
import { evaluationCriteriaSchema } from '@/schema/evaluation-criteria-schema';
import { Form } from '@/components/ui/form';
import { FilePenLine, Loader2Icon, Save } from 'lucide-react';
import { EvaluationCriteriaForm } from '@/components/form/evaluation-criteria-form';

interface EditEvaluationCriteriaDialogProps {
    className?: string;
    criteria: EvaluationCriteria;
    onSuccess?: (criteria: EvaluationCriteria) => void;
}

export const EditEvaluationCriteriaDialog: React.FunctionComponent<EditEvaluationCriteriaDialogProps> = ({
    className,
    criteria,
    onSuccess,
}) => {
    const { t } = useTranslation();
    const [open, setOpen] = useBoolean(false);
    const { mutate, isPending } = useMutation({
        mutationFn: putEvaluationCriteria,
        onSuccess: (data) => {
            toast.success(data.message);
            setOpen(false);
            if (onSuccess) {
                onSuccess(data.criteria);
            }
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });
    const form = useForm<PartialEvaluationCriteria>({
        resolver: yupResolver(evaluationCriteriaSchema),
        defaultValues: {
            label: criteria.label,
            description: criteria.description || '',
        },
    });

    const onSubmit = React.useCallback(
        (data: PartialEvaluationCriteria) => {
            mutate({ identifier: criteria.identifier, data });
        },
        [mutate, criteria.identifier],
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
                    <EvaluationCriteriaForm form={form} isPending={isPending} />
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

EditEvaluationCriteriaDialog.displayName = 'EditEvaluationCriteriaDialog';
