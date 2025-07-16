import { EvaluationCriteria } from '@/types/evaluation-criteria';

export type EvaluationTemplate = {
    id: number;
    identifier: string;
    name: string;
    description?: string;
    active: boolean;
    criterias: EvaluationCriteria[];
};

export type PartialEvaluationTemplate = Omit<EvaluationTemplate, 'id' | 'active' | 'identifier' | 'criterias'> & {
    criterias?: Array<{ value: number }>;
};
