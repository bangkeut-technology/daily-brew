import { Locale } from '@/types/locale';

export type User = {
    id: number;
    publicId: string;
    email: string;
    emailCanonical: string;
    firstName: string;
    lastName: string;
    enabled: boolean;
    dob?: string;
    avatarUrl?: string;
    roles: string[];
    locale: Locale;
    fullName: string;
    authentications: {
        password: boolean;
        google: boolean;
        apple: boolean;
    };
};

export type UpdateUser = Pick<User, 'firstName' | 'lastName'>;

export type PartialUser = Pick<User, 'firstName' | 'lastName' | 'email'> & {
    dob: Date | null;
    role: string;
} & ChangePassword;

export type PartialUserWithoutPassword = Omit<PartialUser, 'password' | 'confirmPassword'>;

export type SignIn = {
    email: string;
    password: string;
};

export type SignUp = {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
    acceptedTerms: boolean;
};

export type ChangePassword = {
    currentPassword?: string;
    plainPassword: {
        first: string;
        second: string;
    };
};
