import { useWorkspaceSettings } from '@/hooks/queries/useWorkspaces';
import { getWorkspacePublicId } from '@/lib/auth';
import { todayInTimezone, startOfMonthInTimezone, todayMidnightInTimezone, parseDateAsUTC } from '@/lib/timezone';
import { useMemo } from 'react';

/**
 * Returns the workspace timezone string and derived helpers.
 * Falls back to the browser's timezone if settings aren't loaded yet.
 */
export function useWorkspaceTimezone() {
  const workspaceId = getWorkspacePublicId() || '';
  const { data: settings } = useWorkspaceSettings(workspaceId);
  const tz = settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  return useMemo(() => ({
    /** IANA timezone string, e.g. "Asia/Phnom_Penh" */
    timezone: tz,
    /** Today's date string (YYYY-MM-DD) in workspace TZ */
    today: () => todayInTimezone(tz),
    /** First of current month (YYYY-MM-01) in workspace TZ */
    startOfMonth: () => startOfMonthInTimezone(tz),
    /** Midnight Date for today in workspace TZ (UTC-based for comparisons) */
    todayMidnight: () => todayMidnightInTimezone(tz),
    /** Parse a YYYY-MM-DD as UTC midnight Date */
    parseDate: parseDateAsUTC,
  }), [tz]);
}
