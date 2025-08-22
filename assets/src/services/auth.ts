import { SignIn, SignUp, User } from '@/types/user';
import axios from 'axios';

export const signIn = async (signIn: SignIn) => {
    return axios.post<{ message: string; user: User }>('/console/login', signIn).then((response) => response.data);
};

export const signUp = async (signUp: SignUp) => {
    const { password, confirmPassword, ...rest } = signUp;
    return axios
        .post<{ message: string; user: User }>('/sign-up', { ...rest, plainPassword: password })
        .then((response) => response.data);
};
