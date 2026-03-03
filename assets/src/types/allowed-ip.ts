export type AllowedIp = {
    publicId: string;
    ip: string;
    label: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type CreateAllowedIpPayload = {
    ip: string;
    label?: string | null;
    isActive: boolean;
};

export type UpdateAllowedIpPayload = {
    ip?: string;
    label?: string | null;
    isActive?: boolean;
};
