import { array, number, object, ObjectSchema, string } from 'yup';
import { PartialEvaluationTemplate } from '@/types/evaluation-template';
import i18next from '@/i18next';

export const evaluationTemplateSchema: ObjectSchema<PartialEvaluationTemplate> = object({
    name: string().required(i18next.t('validation:required.evaluation_templates.name')),
    description: string().optional(),
    criterias: array().of(
        object({
            value: number().required(i18next.t('validation:required.evaluation_criterias.id')),
        }),
    ),
});
