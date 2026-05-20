import { useQuery } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';
import { getWorkspacePublicId } from '@/lib/auth';
import type { FeatureFlagStage } from '@/hooks/queries/useAdmin';

/**
 * Response from GET /features. `flags` covers every known flag (true when
 * visible to this workspace's testing track); `stages` only includes the
 * flags the workspace can see, so we don't leak the existence of hidden
 * features. Pair the boolean with the stage to render a "Beta" / "Alpha"
 * pill alongside testing-phase UI.
 *
 * The set of keys is fixed in src/Enum/FeatureFlagEnum.php on the server
 * side. Add new keys to the FeatureFlagKey union below as they ship.
 */
export type FeatureFlagKey = 'nfc_checkin';

export type FeatureFlagsResponse = {
  flags: Partial<Record<FeatureFlagKey, boolean>> & Record<string, boolean | undefined>;
  stages: Partial<Record<FeatureFlagKey, FeatureFlagStage>> & Record<string, FeatureFlagStage | undefined>;
};

export function useFeatures() {
  const workspaceId = getWorkspacePublicId() || '';
  return useQuery<FeatureFlagsResponse>({
    queryKey: ['features', workspaceId],
    queryFn: async () => {
      const { data } = await apiAxios.get<FeatureFlagsResponse>('/features', {
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
export function useFeatureEnabled(key: FeatureFlagKey | string): boolean {
  const { data } = useFeatures();
  return data?.flags?.[key] === true;
}

/**
 * Returns the rollout stage of a flag that's visible to this workspace,
 * or undefined if the flag isn't visible (or still loading). Use with
 * <FeatureStageBadge> to label testing-phase UI as Beta / Alpha / Dev.
 */
export function useFeatureStage(key: FeatureFlagKey | string): FeatureFlagStage | undefined {
  const { data } = useFeatures();
  return data?.stages?.[key];
}
