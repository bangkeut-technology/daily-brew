import { useWorkspaceSettings } from '@/hooks/queries/useWorkspaces';
import { getWorkspacePublicId } from '@/lib/auth';
import { formatDate } from '@/lib/dateFormat';
import { useCallback } from 'react';

/**
 * Returns a formatting function that uses the workspace's date format setting.
 */
export function useDateFormat() {
  const workspaceId = getWorkspacePublicId() || '';
  const { data: settings } = useWorkspaceSettings(workspaceId);
  const df = settings?.dateFormat || 'DD/MM/YYYY';

  return useCallback((dateStr: string) => formatDate(dateStr, df), [df]);
}
