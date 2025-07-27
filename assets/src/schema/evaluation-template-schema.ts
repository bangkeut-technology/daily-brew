import { array, number, object, ObjectSchema, string } from 'yup';
import {
    EvaluationTemplateCriterias,
    EvaluationTemplateEmployees,
    PartialEvaluationTemplate,
} from '@/types/evaluation-template';
import i18next from '@/i18next';

export const evaluationTemplateSchema: ObjectSchema<PartialEvaluationTemplate> = object({
    name: string().required(i18next.t('validation:required.evaluation_templates.name')),
    description: string().optional(),
    criterias: array().of(
        object({
            value: number().required(i18next.t('validation:required.evaluation_criterias.id')),
        }),
    ),
    employees: array().of(
        object({
            value: number().required(i18next.t('validation:required.employees.id')),
        }),
    ),
});

export const evaluationTemplateCriteriasSchema: ObjectSchema<EvaluationTemplateCriterias> = object({
    criterias: array().of(
        object({
            value: number().required(i18next.t('validation:required.evaluation_criterias.id')),
        }).required(),
    ),
});

export const evaluationTemplateEmployeesSchema: ObjectSchema<EvaluationTemplateEmployees> = object({
    employees: array().of(
        object({
            value: number().required(i18next.t('validation:required.employees.id')),
        }),
    ),
});
