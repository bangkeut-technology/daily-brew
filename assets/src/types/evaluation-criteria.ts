import { EvaluationTemplate } from '@/types/evaluation-template';

export type EvaluationCriteria = {
    id: number;
    identifier: string;
    createdAt: string;
    updatedAt: string;
    label: string;
    description?: string;
    weight: number;
    templates: EvaluationTemplate[];
};

export type EvaluationTemplateCriterias = {
    templates?: Array<{ value: number }>;
};

export type PartialEvaluationCriteria = Omit<
    EvaluationCriteria,
    'id' | 'identifier' | 'templates' | 'createdAt' | 'updatedAt'
> &
    EvaluationTemplateCriterias;
