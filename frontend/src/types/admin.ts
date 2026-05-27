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
