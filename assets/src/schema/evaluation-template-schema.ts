import { array, number, object, ObjectSchema, string } from 'yup';
import { PartialEvaluationTemplate } from '@/types/EvaluationTemplate';
import i18next from '@/i18next';
import { CRITERIA_MINIMUM, WEIGHT_MAXIMUM, WEIGHT_MINIMUM } from '@/constants/value';

export const evaluationTemplateSchema: ObjectSchema<PartialEvaluationTemplate> = object({
    name: string().required(i18next.t('validation:required.evaluation_template.name')),
    description: string().optional(),
    criterias: array()
        .of(
            object({
                label: string().required(i18next.t('validation:required.evaluation_template.criteria.label')),
                description: string().optional(),
                weight: number()
                    .min(WEIGHT_MINIMUM, i18next.t('validation:min.criteria.weight', { min: WEIGHT_MINIMUM }))
                    .max(WEIGHT_MAXIMUM, i18next.t('validation:max.criteria.weight', { min: WEIGHT_MAXIMUM }))
                    .required(i18next.t('validation:required.evaluation_template.criteria.weight')),
            }),
        )
        .min(CRITERIA_MINIMUM, i18next.t('validation:min.criterias.items', { min: CRITERIA_MINIMUM }))
        .required(),
});
