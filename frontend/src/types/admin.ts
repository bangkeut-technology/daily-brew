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
  /** Each step is a strict subset of the one above it. */
  activation: {
    workspacesTotal: number;
    workspacesWithEmployees: number;
    workspacesWithAttendance: number;
    workspacesActiveLast7d: number;
  };
  growth: {
    usersLast7d: number;
    usersLast30d: number;
    workspacesLast7d: number;
    workspacesLast30d: number;
    employeesLast7d: number;
    employeesLast30d: number;
    attendancesLast7d: number;
    attendancesLast30d: number;
  };
  growthSeries: GrowthPoint[];
  recentSignups: { publicId: string; email: string; fullName: string; createdAt: string }[];
  recentWorkspaces: {
    publicId: string;
    name: string;
    owner: { publicId: string; email: string } | null;
    createdAt: string;
  }[];
  recentActivity: {
    publicId: string;
    action: string;
    actionLabel: string;
    actorEmail: string | null;
    targetType: string;
    targetPublicId: string | null;
    targetLabel: string | null;
    createdAt: string;
  }[];
}

export interface GrowthPoint {
  /** YYYY-MM-DD */
  date: string;
  users: number;
  workspaces: number;
  employees: number;
  attendances: number;
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
  /** Workspace-local date of the most recent check-in; null if never used. */
  lastActivityDate: string | null;
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

export interface AdminUserDetail extends AdminUserRow {
  locale: string | null;
  onboardingCompleted: boolean;
  updatedAt: string;
  ownedWorkspaces: { publicId: string; name: string; deletedAt: string | null }[];
  linkedWorkspaces: {
    employeePublicId: string;
    employeeName: string;
    workspacePublicId: string | null;
    workspaceName: string | null;
    role: string;
  }[];
}

export type WorkspaceTestingTrack = "none" | "alpha" | "beta";
export type WorkspacePlan = "free" | "espresso" | "double_espresso";

/**
 * Churn has two shapes and they overlap: a canceled subscription is lost
 * revenue, a deleted workspace is a lost account, and deleting a workspace
 * cancels its subscription. The counters keep both; the timeline emits one
 * event per workspace (a deletion carries the plan it was on).
 */
export interface AdminChurnData {
  windowDays: number;
  summary: {
    paidChurned: number;
    paidChurnedLast30d: number;
    livePaid: number;
    paidChurnRate: number;
    paidChurnRateLast30d: number;
    workspacesDeleted: number;
    workspacesDeletedLast30d: number;
    liveWorkspaces: number;
    workspaceChurnRate: number;
    avgLifetimeDays: number | null;
  };
  series: AdminChurnPoint[];
  events: AdminPagedResponse<AdminChurnEvent>;
  dormant: AdminDormantWorkspace[];
  /** Days of silence after which a paid workspace is listed as at risk. */
  dormantAfterDays: number;
}

export interface AdminChurnPoint {
  /** YYYY-MM */
  month: string;
  paidCanceled: number;
  workspacesDeleted: number;
}

export interface AdminChurnEvent {
  id: string;
  type: "subscription_canceled" | "workspace_deleted";
  occurredAt: string;
  workspace: { publicId: string; name: string };
  owner: { publicId: string; email: string } | null;
  /** Null when a deleted workspace never had a subscription row. */
  plan: WorkspacePlan | null;
  wasPaid: boolean;
  paddleSubscriptionId: string | null;
  lifetimeDays: number;
}

export interface AdminDormantWorkspace {
  publicId: string;
  name: string;
  ownerEmail: string | null;
  plan: WorkspacePlan;
  /** YYYY-MM-DD of the last check-in. */
  lastActivity: string;
  daysQuiet: number;
}

export interface AdminWorkspaceDetail {
  publicId: string;
  name: string;
  qrToken: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  owner: { publicId: string; email: string; fullName: string } | null;
  employeeCount: number;
  qrCodeCount: number;
  activity: {
    lastActivityDate: string | null;
    attendancesTotal: number;
    attendancesLast7d: number;
    attendancesLast30d: number;
    linkedEmployeeCount: number;
    managerCount: number;
  };
  subscription: {
    plan: string;
    status: string;
    paddleSubscriptionId: string | null;
    paddleCustomerId: string | null;
    currentPeriodEnd: string | null;
    trialEndsAt: string | null;
    canceledAt: string | null;
    isActive: boolean;
  } | null;
  settings: {
    timezone: string;
    ipRestrictionEnabled: boolean;
    geofencingEnabled: boolean;
    deviceVerificationEnabled: boolean;
  } | null;
  testingTrack: WorkspaceTestingTrack;
}

export interface AdminFilterOption {
  value: string;
  label: string;
}

/** The audit-log list ships its own filter vocabulary — see AdminAuditLogController. */
export interface AdminAuditLogResponse extends AdminPagedResponse<AdminAuditLogRow> {
  actions?: AdminFilterOption[];
  targetTypes?: AdminFilterOption[];
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
