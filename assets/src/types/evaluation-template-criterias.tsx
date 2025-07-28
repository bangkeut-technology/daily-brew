import { EvaluationCriteria } from '@/types/evaluation-criteria';

export type EvaluationTemplateCriteria = {
    id: number;
    publicId: string;
    weight: number;
    criteria: EvaluationCriteria;
};
