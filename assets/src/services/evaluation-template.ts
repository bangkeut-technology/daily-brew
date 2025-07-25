import { EvaluationTemplate, PartialEvaluationTemplate } from '@/types/evaluation-template';
import { apiAxios } from '@/lib/apiAxios';
import { EvaluationTemplateCriteria } from '@/types/evaluation-template-criterias';
import { Employee } from '@/types/employee';

export const fetchEvaluationTemplates = async () => {
    const response = await apiAxios.get<EvaluationTemplate[]>(`/evaluation-templates`);
    return response.data;
};
export const postEvaluationTemplate = async ({ criterias = [], ...data }: PartialEvaluationTemplate) => {
    return await apiAxios
        .post<{
            template: EvaluationTemplate;
            message: string;
        }>('/evaluation-templates', { ...data, criterias: criterias.map((criteria) => criteria.value) })
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
        .put<{ template: EvaluationTemplate; message: string }>(`/evaluation-templates/${identifier}`, data)
        .then((response) => response.data);
};

export const deleteEvaluationTemplate = async (identifier: string) => {
    return await apiAxios
        .delete<{ message: string }>(`/evaluation-templates/${identifier}`)
        .then((response) => response.data);
};

export const patchEvaluationTemplate = async (identifier: string) => {
    return await apiAxios
        .patch<{ template: EvaluationTemplate; message: string }>(`/evaluation-templates/${identifier}`)
        .then((response) => response.data);
};

export const fetchTemplateCriterias = async (identifier: string) => {
    return await apiAxios
        .get<EvaluationTemplateCriteria[]>(`/evaluation-templates/${identifier}/criterias`)
        .then((response) => response.data);
};

export const fetchTemplateEmployees = async (identifier: string) => {
    return await apiAxios
        .get<Employee[]>(`/evaluation-templates/${identifier}/employees`)
        .then((response) => response.data);
};
