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
  avatarUrl?: string | null;
}

export interface Workspace {
  publicId: string;
  name: string;
  logoUrl?: string | null;
}
