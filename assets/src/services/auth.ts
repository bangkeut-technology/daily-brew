import { SignInType, SignUpType, User } from '@/types/user';
import axios from 'axios';

export const signIn = async (signIn: SignInType) => {
    return axios.post<{ message: string; user: User }>('/console/login', signIn).then((response) => response.data);
};

export const signUp = async (signUp: SignUpType) => {
    const { password, confirmPassword, ...rest } = signUp;
    return axios
        .post<{ message: string; user: User }>('/console/sign-up', { ...rest, plainPassword: password })
        .then((response) => response.data);
};
