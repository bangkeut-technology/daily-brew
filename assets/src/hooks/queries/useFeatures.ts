import { useQuery } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';
import { getWorkspacePublicId } from '@/lib/auth';

/**
 * Map of feature-flag key → enabled state for the current workspace.
 * The server resolves stages (dev/alpha/beta/release) against the
 * workspace's testing track, so the frontend gets a single boolean
 * per flag and doesn't have to know about stages.
 *
 * The set of keys is fixed in src/Enum/FeatureFlagEnum.php on the
 * server side. New keys can be added to the type below as they ship.
 */
export type FeatureFlags = {
  nfc_checkin?: boolean;
} & Record<string, boolean | undefined>;

export function useFeatures() {
  const workspaceId = getWorkspacePublicId() || '';
  return useQuery<FeatureFlags>({
    queryKey: ['features', workspaceId],
    queryFn: async () => {
      const { data } = await apiAxios.get<FeatureFlags>('/features', {
        params: workspaceId ? { workspaceId } : undefined,
      });
      return data;
    },
    // Flags rarely change; a 5-minute stale window keeps the network
    // quiet while still reacting to admin toggles within one session.
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Convenience: returns a single flag's enabled state. Defaults to false
 * while loading so gated UI stays hidden until the answer is known.
 */
export function useFeatureEnabled(key: keyof FeatureFlags): boolean {
  const { data } = useFeatures();
  return data?.[key] === true;
}
