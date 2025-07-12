import React from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { evaluationTemplateSchema } from '@/schema/evaluation-template-schema';
import { PartialEvaluationTemplate } from '@/types/evaluation-template';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { EvaluationTemplateForm } from '@/components/form/evaluation-template-form';
import { useMutation } from '@tanstack/react-query';
import { postEvaluationTemplate } from '@/services/evaluation-template';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

export const Route = createLazyFileRoute('/console/_authenticated/_layout/evaluations/criterias/new')({
    component: NewEvaluationTemplate,
});

function NewEvaluationTemplate() {
    const { t } = useTranslation();
    const navigate = Route.useNavigate();
    const { mutate, isPending } = useMutation({
        mutationFn: postEvaluationTemplate,
        onSuccess: (data) => {
            toast.success(data.message);
            navigate({
                to: '/console/evaluation-templates/$identifier',
                params: { identifier: data.evaluation.identifier },
            }).then();
        },
        onError: (error) => {
            const message = isAxiosError(error)
                ? error.response?.data.message
                : t('error_occurred', { ns: 'glossary' });
            toast.error(message);
        },
    });
    const form = useForm<PartialEvaluationTemplate>({
        resolver: yupResolver(evaluationTemplateSchema),
        defaultValues: {
            description: '',
            criterias: [],
        },
    });

    const handleCreate = React.useCallback(
        (data: PartialEvaluationTemplate) => {
            mutate(data);
        },
        [mutate],
    );

    return (
        <div>
            <Card className="w-full">
                <CardContent className="p-6 space-y-4">
                    <EvaluationTemplateForm form={form} isPending={isPending} />
                    <div className="flex-row flex justify-between space-x-2">
                        <Button className="w-full" onClick={form.handleSubmit(handleCreate)} disabled={isPending}>
                            {t('create.title')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
