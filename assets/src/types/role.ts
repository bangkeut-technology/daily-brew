export type Role = {
    id: number;
    publicId: string;
    name: string;
    canonicalName: string;
    description?: string;
};

export type PartialRole = Omit<Role, 'id' | 'canonicalName' | 'publicId'>;
