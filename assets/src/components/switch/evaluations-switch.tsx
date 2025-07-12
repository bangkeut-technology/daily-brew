import React from 'react';
import { Switch } from '@/components/ui/switch';
import { QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import { patchEvaluationTemplate } from '@/services/evaluation-template';
import { EvaluationTemplate } from '@/types/evaluation-template';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

interface EvaluationSwitchProps {
    evaluation: EvaluationTemplate;
    withLabel?: boolean;
    queryKey?: QueryKey;
}

export const EvaluationSwitch: React.FC<EvaluationSwitchProps> = ({
    evaluation,
    withLabel,
    queryKey = ['evaluations'],
}) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { mutate } = useMutation({
        mutationFn: patchEvaluationTemplate,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey }).then(() => {
                toast.success(data.message);
            });
        },
        onError: (error) => {
            const message = isAxiosError(error)
                ? error.response?.data.message
                : t('error_occurred', { ns: 'glossary' });
            toast.error(message);
        },
    });

    const handleChange = React.useCallback(() => {
        mutate(evaluation.identifier);
    }, [mutate, evaluation.identifier]);

    return withLabel ? (
        <div className="flex items-center space-x-2">
            <Label htmlFor={evaluation.identifier}>{t('enabled')}</Label>
            <Switch id={evaluation.identifier} checked={evaluation.active} onCheckedChange={handleChange} />
        </div>
    ) : (
        <Switch id={evaluation.identifier} checked={evaluation.active} onCheckedChange={handleChange} />
    );
};
