export type User = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    canonicalEmail: string;
    locale: string;
    fullName: string;
};

export type SignIn = Omit<User, 'id' | 'firstName' | 'lastName' | 'canonicalEmail' | 'locale' | 'fullName'> & {
    password: string;
};

export type SignUp = Omit<User, 'id' | 'canonicalEmail' | 'locale' | 'fullName'> & {
    password: string;
    confirmPassword: string;
};

export type ChangePassword = {
    password: string;
    confirmPassword: string;
};
