import { apiAxios } from '@/lib/apiAxios';
import { EvaluationCriteria, PartialEvaluationCriteria } from '@/types/evaluation-criteria';
import { EvaluationTemplateCriteria } from '@/types/evaluation-template-criterias';

export const fetchEvaluationCriterias = async (): Promise<EvaluationCriteria[]> => {
    return apiAxios.get('/evaluation-criterias').then((response) => response.data);
};

export const postEvaluationCriteria = async (data: PartialEvaluationCriteria) => {
    return apiAxios
        .post<{
            message: string;
            criteria: EvaluationCriteria;
        }>('/evaluation-criterias', { ...data, templates: data.templates?.map((template) => template.value) || [] })
        .then((response) => response.data);
};

export const fetchEvaluationCriteria = async (publicId: string) => {
    return apiAxios.get<EvaluationCriteria>(`/evaluation-criterias/${publicId}`).then((response) => response.data);
};

export const putEvaluationCriteria = async ({
    publicId,
    data,
}: {
    publicId: string;
    data: PartialEvaluationCriteria;
}): Promise<{ message: string; criteria: EvaluationCriteria }> => {
    return apiAxios.put(`/evaluation-criterias/${publicId}`, data).then((response) => response.data);
};

export const deleteEvaluationCriteria = async (publicId: string): Promise<{ message: string }> => {
    return apiAxios.delete(`/evaluation-criterias/${publicId}`).then((response) => response.data);
};

export const getEvaluationCriteria = async (publicId: string): Promise<EvaluationCriteria> => {
    return apiAxios.get(`/evaluation-criterias/${publicId}`).then((response) => response.data);
};

export const fetchTemplateCriterias = async (publicId: string) => {
    return await apiAxios
        .get<EvaluationTemplateCriteria[]>(`/evaluation-criterias/${publicId}/templates`)
        .then((response) => response.data);
};

export const postCriteriaTemplates = async ({
    publicId,
    templates = [],
}: {
    publicId: string;
    templates: number[];
}) => {
    return await apiAxios
        .post<{ message: string }>(`/evaluation-criterias/${publicId}/templates`, { templates })
        .then((response) => response.data);
};
