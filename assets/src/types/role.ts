export type Role = {
    id: number;
    name: string;
    canonicalName: string;
    description?: string;
};

export type PartialRole = Omit<Role, 'id' | 'canonicalName'>;
