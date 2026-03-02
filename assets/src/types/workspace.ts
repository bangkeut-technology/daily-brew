export type Workspace = {
    publicId: string;
    name: string;
    customName?: string | null;
    logoUrl?: string | null;
    internal: boolean;
    role: WorkspaceUserRole;
    subscription: WorkspaceSubscription;
};

export type WorkspaceUserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export type WorkspaceInvite = {
    publicId: string;
    email: string | null;
    role: string;
    status: 'pending' | 'accepted' | 'revoked' | 'expired';
    expiresAt: string | null;
    createdAt: string | null;
    acceptedAt: string | null;
};

export type WorkspaceUser = {
    publicId: string;
    email: string;
    fullName: string;
    role: WorkspaceUserRole;
};

export type SubscriptionStatus = 'trialing' | 'active' | 'canceled' | 'expired';

export type WorkspaceSubscription = {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    // Scheduling
    scheduledChangeAt?: string;
    scheduledPlanCode?: string;

    // Convenience flags
    isActive: boolean;
    isTrialing: boolean;
};

export type SubscriptionPlan = {
    code: string;
    name: string;
    level: number;
    priceCents: number;
    currency: string;
    billingInterval: string;
    intervalCount: number;

    // Feature flags / limits
    allowBasicAnalytics: boolean;
    allowAdvancedAnalytics: boolean;
    allowComparison: boolean;
    maxComparisonItems?: number;
    allowGeolocation: boolean;
    maxTeamMembers?: number;
    allowExportTools: boolean;
    allowExportComparisonData: boolean;
    maxCustomEntryPoints?: number;

    // Presentation
    isPublic: boolean;
    isActive: boolean;
    displayOrder: number;
};
