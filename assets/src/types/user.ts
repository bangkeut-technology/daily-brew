export type User = {
    id: number;
    avatarUrl?: string;
    firstName: string;
    lastName: string;
    email: string;
    canonicalEmail: string;
    locale: string;
    fullName: string;
};

export type SignIn = Omit<
    User,
    'id' | 'firstName' | 'lastName' | 'canonicalEmail' | 'locale' | 'fullName' | 'avatarUrl'
> & {
    password: string;
};

export type SignUp = Omit<User, 'id' | 'canonicalEmail' | 'locale' | 'fullName' | 'avatarUrl'> & {
    password: string;
    confirmPassword: string;
    acceptedTerms: boolean;
};

export type ChangePassword = {
    password: string;
    confirmPassword: string;
};
