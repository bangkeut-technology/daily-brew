// Auth utilities — cookie-based JWT, no localStorage
// Session data is managed by AuthenticationProvider via /api/v1/{locale}/users/me

export function getWorkspacePublicId(): string | null {
    return sessionStorage.getItem('workspace_public_id');
}

export function setWorkspacePublicId(id: string): void {
    sessionStorage.setItem('workspace_public_id', id);
}
