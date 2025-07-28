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
import { putEvaluationTemplate } from '@/services/evaluation-template';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { EvaluationTemplate, PartialEvaluationTemplate } from '@/types/evaluation-template';
import { yupResolver } from '@hookform/resolvers/yup';
import { evaluationTemplateSchema } from '@/schema/evaluation-template-schema';
import { Form } from '@/components/ui/form';
import { FilePenLine, Loader2Icon, Save } from 'lucide-react';
import { EvaluationTemplateForm } from '@/components/form/evaluation-template-form';

interface EditEvaluationTemplateDialogProps {
    className?: string;
    template: EvaluationTemplate;
    onSuccess?: (template: EvaluationTemplate) => void;
}

export const EditEvaluationTemplateDialog: React.FunctionComponent<EditEvaluationTemplateDialogProps> = ({
    className,
    template,
    onSuccess,
}) => {
    const { t } = useTranslation();
    const [open, setOpen] = useBoolean(false);
    const { mutate, isPending } = useMutation({
        mutationFn: putEvaluationTemplate,
        onSuccess: (data) => {
            toast.success(data.message);
            setOpen(false);
            if (onSuccess) {
                onSuccess(data.template);
            }
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });
    const form = useForm<PartialEvaluationTemplate>({
        resolver: yupResolver(evaluationTemplateSchema),
        defaultValues: {
            name: template.name,
            description: template.description || '',
        },
    });

    const onSubmit = React.useCallback(
        (data: PartialEvaluationTemplate) => {
            mutate({ publicId: template.publicId, data });
        },
        [mutate, template.publicId],
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
                    <DialogTitle>{t('evaluation_templates.edit.title', { ns: 'glossary' })}</DialogTitle>
                    <DialogDescription>
                        {t('evaluation_templates.edit.description', { ns: 'glossary' })}
                    </DialogDescription>
                    <EvaluationTemplateForm form={form} isPending={isPending} />
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

EditEvaluationTemplateDialog.displayName = 'EditEvaluationTemplateDialog';
