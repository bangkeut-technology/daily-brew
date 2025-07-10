import { EvaluationTemplate, PartialEvaluationTemplate } from '@/types/EvaluationTemplate';
import { apiAxios } from '@/lib/apiAxios';

export const fetchEvaluationTemplates = async () => {
    const response = await apiAxios.get<EvaluationTemplate[]>(`/evaluation-templates`);
    return response.data;
};
export const postEvaluationTemplate = async (data: PartialEvaluationTemplate) => {
    return await apiAxios
        .post<{ evaluation: EvaluationTemplate; message: string }>('/evaluation-templates', data)
        .then((response) => response.data);
};
export const fetchEvaluationTemplate = async (identifier: string) => {
    return await apiAxios
        .get<EvaluationTemplate>(`/evaluation-templates/${identifier}`)
        .then((response) => response.data);
};

export const putEvaluationTemplate = async ({
    identifier,
    data,
}: {
    identifier: string;
    data: PartialEvaluationTemplate;
}) => {
    return await apiAxios
        .put<{ evaluation: EvaluationTemplate; message: string }>(`/evaluation-templates/${identifier}`, data)
        .then((response) => response.data);
};

export const deleteEvaluationTemplate = async (identifier: string) => {
    return await apiAxios
        .delete<{ message: string }>(`/evaluation-templates/${identifier}`)
        .then((response) => response.data);
};

export const patchEvaluationTemplate = async (identifier: string) => {
    return await apiAxios
        .patch<{ evaluation: EvaluationTemplate; message: string }>(`/evaluation-templates/${identifier}`)
        .then((response) => response.data);
};
