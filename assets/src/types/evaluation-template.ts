export type EvaluationTemplate = {
    id: number;
    identifier: string;
    name: string;
    description?: string;
    active: boolean;
    criterias: EvaluationCriteria[];
};

export type EvaluationCriteria = {
    id: number;
    identifier: string;
    label: string;
    description?: string;
    weight: number;
};

export type PartialEvaluationCriteria = Omit<EvaluationCriteria, 'id' | 'identifier'>;

export type PartialEvaluationTemplate = Omit<EvaluationTemplate, 'id' | 'active' | 'identifier' | 'criterias'> & {
    criterias: PartialEvaluationCriteria[];
};
