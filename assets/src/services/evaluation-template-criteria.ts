import { apiAxios } from '@/lib/apiAxios';

export const deleteTemplateCriteria = async (identifier: string) => {
    return await apiAxios
        .delete<{ message: string }>(`/evaluation-template-criterias/${identifier}`)
        .then((response) => response.data);
};
