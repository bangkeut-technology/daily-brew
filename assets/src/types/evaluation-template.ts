import { EvaluationCriteria } from '@/types/evaluation-criteria';

export type EvaluationTemplate = {
    id: number;
    identifier: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    canonicalName: string;
    description?: string;
    active: boolean;
    criterias: EvaluationCriteria[];
};

export type PartialEvaluationTemplate = Omit<
    EvaluationTemplate,
    'id' | 'canonicalName' | 'active' | 'identifier' | 'criterias'
> & {
    criterias?: Array<{ value: number }>;
    employees?: Array<{ value: number }>;
};
