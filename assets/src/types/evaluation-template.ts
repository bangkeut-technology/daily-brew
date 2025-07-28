import { EvaluationCriteria } from '@/types/evaluation-criteria';

export type EvaluationTemplate = {
    id: number;
    publicId: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    canonicalName: string;
    description?: string;
    active: boolean;
    criterias: EvaluationCriteria[];
};

export type EvaluationTemplateCriterias = {
    criterias?: Array<{ value: number }>;
};

export type EvaluationTemplateEmployees = {
    employees?: Array<{ value: number }>;
};

export type PartialEvaluationTemplate = Omit<
    EvaluationTemplate,
    'id' | 'canonicalName' | 'active' | 'publicId' | 'criterias' | 'createdAt' | 'updatedAt'
> &
    EvaluationTemplateCriterias &
    EvaluationTemplateEmployees;
