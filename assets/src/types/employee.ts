export type Employee = {
    id: number;
    identifier: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
};

export type PartialEmployee = Omit<Employee, 'id' | 'identifier'>;
