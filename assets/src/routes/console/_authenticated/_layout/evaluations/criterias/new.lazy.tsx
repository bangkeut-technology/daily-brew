import React from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { evaluationCriteriaSchema } from '@/schema/evaluation-criteria-schema';
import { PartialEvaluationCriteria } from '@/types/evaluation-criteria';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { EvaluationCriteriaForm } from '@/components/form/evaluation-criteria-form';
import { useMutation } from '@tanstack/react-query';
import { postEvaluationCriteria } from '@/services/evaluation-criteria';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

export const Route = createLazyFileRoute('/console/_authenticated/_layout/evaluations/criterias/new')({
    component: NewEvaluationCriteria,
});

function NewEvaluationCriteria() {
    const { t } = useTranslation();
    const navigate = Route.useNavigate();
    const { mutate, isPending } = useMutation({
        mutationFn: postEvaluationCriteria,
        onSuccess: (data) => {
            toast.success(data.message);
            navigate({
                to: '/console/evaluations/criterias/$identifier',
                params: { identifier: data.criteria.identifier },
            }).then();
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

    const handleCreate = React.useCallback(
        (data: PartialEvaluationCriteria) => {
            mutate(data);
        },
        [mutate],
    );

    return (
        <div>
            <Card className="w-full">
                <CardContent className="p-6 space-y-4">
                    <EvaluationCriteriaForm form={form} isPending={isPending} />
                    <div className="flex-row flex justify-between space-x-2">
                        <Button className="w-full" onClick={form.handleSubmit(handleCreate)} disabled={isPending}>
                            {t('save')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
