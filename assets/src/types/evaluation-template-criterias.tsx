import { EvaluationCriteria } from '@/types/evaluation-criteria';

export type EvaluationTemplateCriteria = {
    id: number;
    identifier: string;
    weight: number;
    criteria: EvaluationCriteria;
};
