import { EvaluationTemplate } from '@/types/evaluation-template';

export type EvaluationCriteria = {
    id: number;
    identifier: string;
    label: string;
    description?: string;
    weight: number;
    templates: EvaluationTemplate[];
};

export type PartialEvaluationCriteria = Omit<EvaluationCriteria, 'id' | 'identifier' | 'templates'> & {
    templates?: Array<{ value: number }>;
};
