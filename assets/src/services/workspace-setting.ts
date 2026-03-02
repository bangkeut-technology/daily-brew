import { apiAxios } from '@/lib/apiAxios';
import { Setting, SettingType } from '@/types/setting';

export const fetchSettings = (publicId: string) =>
    apiAxios.get<SettingType>(`/workspaces/${publicId}/settings`).then((response) => response.data);

export const updateSettings = ({ publicId, data }: { publicId: string; data: SettingType }) =>
    apiAxios
        .patch<{ message: string; settings: Setting[] }>(`/workspaces/${publicId}/settings`, data)
        .then((response) => response.data);
