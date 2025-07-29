import { EvaluationCriteria } from '@/types/evaluation-criteria';
import { EvaluationTemplate } from '@/types/evaluation-template';

export type EvaluationTemplateCriteria = {
    id: number;
    publicId: string;
    createdAt: string;
    updatedAt: string;
    weight: number;
    criteria: EvaluationCriteria;
    template: EvaluationTemplate;
};
