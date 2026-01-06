export type User = {
    id: number;
    publicId: string;
    avatarUrl?: string;
    firstName: string;
    lastName: string;
    email: string;
    canonicalEmail: string;
    roles: string[];
    locale: string;
    fullName: string;
};

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
    password: string;
    confirmPassword: string;
};
