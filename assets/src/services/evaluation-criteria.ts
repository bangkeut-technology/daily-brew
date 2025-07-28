import { apiAxios } from '@/lib/apiAxios';
import { EvaluationCriteria, PartialEvaluationCriteria } from '@/types/evaluation-criteria';
import { EvaluationTemplateCriteria } from '@/types/evaluation-template-criterias';

export const fetchEvaluationCriterias = async (): Promise<EvaluationCriteria[]> => {
    return apiAxios.get('/evaluation-criterias').then((response) => response.data);
};

export const postEvaluationCriteria = async (data: PartialEvaluationCriteria) => {
    return apiAxios
        .post<{ message: string; criteria: EvaluationCriteria }>('/evaluation-criterias', data)
        .then((response) => response.data);
};

export const fetchEvaluationCriteria = async (identifier: string) => {
    return apiAxios.get<EvaluationCriteria>(`/evaluation-criterias/${identifier}`).then((response) => response.data);
};

export const putEvaluationCriteria = async ({
    identifier,
    data,
}: {
    identifier: string;
    data: PartialEvaluationCriteria;
}): Promise<{ message: string; criteria: EvaluationCriteria }> => {
    return apiAxios.put(`/evaluation-criterias/${identifier}`, data).then((response) => response.data);
};

export const deleteEvaluationCriteria = async (identifier: string): Promise<{ message: string }> => {
    return apiAxios.delete(`/evaluation-criterias/${identifier}`).then((response) => response.data);
};

export const getEvaluationCriteria = async (identifier: string): Promise<EvaluationCriteria> => {
    return apiAxios.get(`/evaluation-criterias/${identifier}`).then((response) => response.data);
};

export const fetchTemplateCriterias = async (identifier: string) => {
    return await apiAxios
        .get<EvaluationTemplateCriteria[]>(`/evaluation-criterias/${identifier}/templates`)
        .then((response) => response.data);
};

export const postCriteriaTemplates = async ({
    identifier,
    templates = [],
}: {
    identifier: string;
    templates: number[];
}) => {
    return await apiAxios
        .post<{ message: string }>(`/evaluation-criterias/${identifier}/templates`, { templates })
        .then((response) => response.data);
};
