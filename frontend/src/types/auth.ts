export interface User {
  publicId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string;
  locale?: string;
  onboardingCompleted?: boolean;
  currentWorkspacePublicId?: string | null;
  isSuperAdmin?: boolean;
}

export interface Workspace {
  publicId: string;
  name: string;
}

export type ManagerPermission =
  | "manage_employees"
  | "manage_shifts"
  | "manage_closures"
  | "manage_leave"
  | "manage_attendance";

export type EmployeeRole = "employee" | "manager";

export interface RoleContext {
  isOwner: boolean;
  isEmployee: boolean;
  isManager: boolean;
  managerPermissions: ManagerPermission[];
  onboardingCompleted: boolean;
  ownedWorkspaces: { publicId: string; name: string }[];
  employee: {
    publicId: string;
    name: string;
    workspacePublicId: string | null;
    workspaceName: string | null;
  } | null;
  linkedWorkspaces: {
    workspacePublicId: string | null;
    workspaceName: string | null;
    employeePublicId: string;
    employeeName: string;
    role: EmployeeRole;
  }[];
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthState {
  status: AuthStatus;
  user: User | undefined;
  workspace: Workspace | undefined;
}
