import { apiAxios } from '@/lib/apiAxios';
import { EvaluationCriteria, PartialEvaluationCriteria } from '@/types/evaluation-criteria';

export const fetchEvaluationCriterias = async (): Promise<EvaluationCriteria[]> => {
    return apiAxios.get('/evaluation-criterias').then((response) => response.data);
};

export const postEvaluationCriteria = async (data: PartialEvaluationCriteria): Promise<{ message: string }> => {
    return apiAxios.post('/evaluation-criterias', data).then((response) => response.data);
};

export const putEvaluationCriteria = async ({
    identifier,
    data,
}: {
    identifier: string;
    data: PartialEvaluationCriteria;
}): Promise<{ message: string }> => {
    return apiAxios.put(`/evaluation-criterias/${identifier}`, data).then((response) => response.data);
};

export const deleteEvaluationCriteria = async (identifier: string): Promise<{ message: string }> => {
    return apiAxios.delete(`/evaluation-criterias/${identifier}`).then((response) => response.data);
};

export const getEvaluationCriteria = async (identifier: string): Promise<EvaluationCriteria> => {
    return apiAxios.get(`/evaluation-criterias/${identifier}`).then((response) => response.data);
};
