import { apiAxios } from './apiAxios';

export function getWorkspacePublicId(): string | null {
    return localStorage.getItem('workspace_public_id');
}

export function setWorkspacePublicId(id: string): void {
    localStorage.setItem('workspace_public_id', id);
    // Fire and forget — persist to server for cross-device sync
    apiAxios.put('/users/me/current-workspace', { workspacePublicId: id }).catch(() => {});
}

/** Restore workspace from server if not in localStorage */
export async function syncWorkspaceFromServer(): Promise<string | null> {
    const local = getWorkspacePublicId();
    if (local) return local;

    try {
        const { data } = await apiAxios.get('/users/me/current-workspace');
        if (data?.data?.publicId) {
            localStorage.setItem('workspace_public_id', data.data.publicId);
            return data.data.publicId;
        }
    } catch {
        // Not authenticated or network error — ignore
    }
    return null;
}
