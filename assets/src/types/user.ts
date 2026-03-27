export interface User {
  publicId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string;
  locale?: string;
  onboardingCompleted?: boolean;
}

export interface Workspace {
  publicId: string;
  name: string;
}
