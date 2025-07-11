import { apiAxios } from '@/lib/apiAxios';
import { User } from '@/types/User';

export const fetchCurrentUser = () => apiAxios.get<User>('/users/me').then((response) => response.data);
export const userChangePassword = ({
    email,
    data,
}: {
    email: string;
    data: { plainPassword: { first: string; second: string } };
}) =>
    apiAxios
        .put<{ message: string; user: User }>(`/users/${email}/change-password`, data)
        .then((response) => response.data);
