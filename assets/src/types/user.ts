export type User = {
    id: number;
    avatarUrl?: string;
    firstName: string;
    lastName: string;
    email: string;
    canonicalEmail: string;
    roles: string[];
    locale: string;
    fullName: string;
};

export type SignIn = Omit<
    User,
    'id' | 'firstName' | 'lastName' | 'canonicalEmail' | 'locale' | 'fullName' | 'avatarUrl' | 'roles'
> & {
    password: string;
};

export type SignUp = Omit<User, 'id' | 'canonicalEmail' | 'locale' | 'fullName' | 'avatarUrl' | 'roles'> & {
    password: string;
    confirmPassword: string;
    acceptedTerms: boolean;
};

export type ChangePassword = {
    password: string;
    confirmPassword: string;
};
