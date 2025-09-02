import { apiAxios } from '@/lib/apiAxios';
import { Setting, SettingType } from '@/types/setting';

export const fetchSettings = () => apiAxios.get<SettingType>('/settings').then((response) => response.data);

export const updateSettings = (data: SettingType) =>
    apiAxios.patch<{ message: string; settings: Setting[] }>('/settings', data).then((response) => response.data);
