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
import { postEvaluationTemplate } from '@/services/evaluation-template';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { PartialEvaluationTemplate } from '@/types/evaluation-template';
import { yupResolver } from '@hookform/resolvers/yup';
import { evaluationTemplateSchema } from '@/schema/evaluation-template-schema';
import { Form } from '@/components/ui/form';
import { Loader2Icon, Save } from 'lucide-react';
import { EvaluationTemplateForm } from '@/components/form/evaluation-template-form';

interface NewEvaluationTemplateDialogProps {
    queryKey?: string[];
}

export const NewEvaluationTemplateDialog: React.FunctionComponent<NewEvaluationTemplateDialogProps> = () => {
    const { t } = useTranslation();
    const [open, setOpen] = useBoolean(false);
    const { mutate, isPending } = useMutation({
        mutationFn: postEvaluationTemplate,
        onSuccess: (data) => {
            toast.success(data.message);
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });
    const form = useForm<PartialEvaluationTemplate>({
        resolver: yupResolver(evaluationTemplateSchema),
        defaultValues: {
            name: '',
            description: '',
            criterias: [],
        },
    });

    const onSubmit = React.useCallback(
        (data: PartialEvaluationTemplate) => {
            mutate(data);
        },
        [mutate],
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Form {...form}>
                <DialogTrigger asChild>
                    <Button variant="outline">{t('new_template')}</Button>
                </DialogTrigger>
                <DialogContent className="w-screen h-screen ">
                    <DialogTitle>{t('evaluation_templates.new.title', { ns: 'glossary' })}</DialogTitle>
                    <DialogDescription>
                        {t('evaluation_templates.new.description', { ns: 'glossary' })}
                    </DialogDescription>
                    <EvaluationTemplateForm form={form} isPending={isPending} withCriterias />
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

NewEvaluationTemplateDialog.displayName = 'NewEvaluationTemplateDialog';
