import { EvaluationTemplate } from '@/types/evaluation-template';

export type EvaluationCriteria = {
    id: number;
    publicId: string;
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
    'id' | 'publicId' | 'templates' | 'createdAt' | 'updatedAt'
> &
    EvaluationTemplateCriterias;
