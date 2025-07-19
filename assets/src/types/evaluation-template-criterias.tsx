import { EvaluationCriteria } from '@/types/evaluation-criteria';

export type EvaluationTemplateCriteria = {
    id: number;
    weight: number;
    criteria: EvaluationCriteria;
};
