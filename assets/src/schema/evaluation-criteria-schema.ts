import { array, number, object, ObjectSchema, string } from 'yup';
import { PartialEvaluationCriteria } from '@/types/evaluation-criteria';
import { WEIGHT_MAXIMUM, WEIGHT_MINIMUM } from '@/constants/value';
import i18next from '@/i18next';

export const evaluationCriteriaSchema: ObjectSchema<PartialEvaluationCriteria> = object({
    label: string().required(i18next.t('required.evaluation_criterias.label', { ns: 'validation' })),
    description: string().optional(),
    weight: number()
        .min(
            WEIGHT_MINIMUM,
            i18next.t('maximum.evaluation_criterias.weight', {
                ns: 'validation',
                minimum: WEIGHT_MINIMUM,
                maximum: WEIGHT_MAXIMUM,
            }),
        )
        .max(
            WEIGHT_MAXIMUM,
            i18next.t('maximum.evaluation_criterias.weight', {
                ns: 'validation',
                minimum: WEIGHT_MINIMUM,
                maximum: WEIGHT_MAXIMUM,
            }),
        )
        .default(1),
    templates: array().of(
        object({
            value: number().required(i18next.t('validation:required.evaluation_templates.id')),
        }),
    ),
});
