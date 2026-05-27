export interface AdminDashboardData {
  totals: {
    users: number;
    workspaces: number;
    employees: number;
    attendances: number;
    subscriptions: number;
  };
  byPlan: Record<"free" | "espresso" | "double_espresso", number>;
  byStatus: Record<"active" | "trialing" | "past_due" | "paused" | "canceled", number>;
}

export interface AdminPagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AdminUserRow {
  publicId: string;
  email: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  isSuperAdmin: boolean;
  hasGoogle: boolean;
  hasApple: boolean;
  hasPassword: boolean;
  createdAt: string;
}

export interface AdminWorkspaceRow {
  publicId: string;
  name: string;
  owner: { publicId: string; email: string; fullName: string } | null;
  plan: string;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  isTrialing: boolean;
  employeeCount: number;
  createdAt: string;
  deletedAt: string | null;
  testingTrack: "none" | "alpha" | "beta";
}

export interface AdminSubscriptionRow {
  publicId: string;
  plan: string;
  status: string;
  isActive: boolean;
  isTrialing: boolean;
  trialDaysRemaining: number | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  canceledAt: string | null;
  paddleSubscriptionId: string | null;
  workspace: { publicId: string; name: string };
  owner: { publicId: string; email: string } | null;
  createdAt: string;
}

export interface AdminAuditLogRow {
  publicId: string;
  action: string;
  actionLabel: string;
  actor: { publicId: string; email: string } | null;
  actorEmail: string | null;
  targetType: string;
  targetPublicId: string | null;
  targetLabel: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export type FeatureFlagStage = "dev" | "alpha" | "beta" | "release";

export interface AdminFeatureFlagRow {
  key: string;
  label: string;
  description: string;
  stage: FeatureFlagStage;
  stageLabel: string;
}

export interface AdminFeatureFlagStageOption {
  value: FeatureFlagStage;
  label: string;
  description: string;
}

export interface AdminMobileAppConfig {
  iosTeamId: string | null;
  iosBundleId: string | null;
  androidPackage: string | null;
  androidSha256Fingerprints: string[];
  iosConfigured: boolean;
  androidConfigured: boolean;
}

export interface AdminMobileAppConfigInput {
  iosTeamId?: string | null;
  iosBundleId?: string | null;
  androidPackage?: string | null;
  androidSha256Fingerprints?: string[] | null;
}
