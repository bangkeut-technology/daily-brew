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
import { postEvaluationCriteria } from '@/services/evaluation-criteria';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { PartialEvaluationCriteria } from '@/types/evaluation-criteria';
import { yupResolver } from '@hookform/resolvers/yup';
import { evaluationCriteriaSchema } from '@/schema/evaluation-criteria-schema';
import { Form } from '@/components/ui/form';
import { Loader2Icon, Save } from 'lucide-react';
import { EvaluationCriteriaForm } from '@/components/form/evaluation-criteria-form';

interface NewEvaluationCriteriaDialogProps {
    queryKey?: string[];
}

export const NewEvaluationCriteriaDialog: React.FunctionComponent<NewEvaluationCriteriaDialogProps> = () => {
    const { t } = useTranslation();
    const [open, setOpen] = useBoolean(false);
    const { mutate, isPending } = useMutation({
        mutationFn: postEvaluationCriteria,
        onSuccess: (data) => {
            toast.success(data.message);
            setOpen(false);
            form.reset({
                label: '',
                description: '',
                weight: 1,
            });
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });
    const form = useForm<PartialEvaluationCriteria>({
        resolver: yupResolver(evaluationCriteriaSchema),
        defaultValues: {
            label: '',
            description: '',
            weight: 1,
        },
    });

    const onSubmit = React.useCallback(
        (data: PartialEvaluationCriteria) => {
            mutate(data);
        },
        [mutate],
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Form {...form}>
                <DialogTrigger asChild>
                    <Button variant="outline">{t('new_criteria')}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogTitle>{t('evaluation_criterias.new.title', { ns: 'glossary' })}</DialogTitle>
                    <DialogDescription>
                        {t('evaluation_criterias.new.description', { ns: 'glossary' })}
                    </DialogDescription>
                    <div className="grid gap-4">
                        <EvaluationCriteriaForm form={form} isPending={isPending} />
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

NewEvaluationCriteriaDialog.displayName = 'NewEvaluationCriteriaDialog';
