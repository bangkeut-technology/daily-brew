import { useQuery } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';

/**
 * Map of feature-flag key → enabled state. The set of keys is fixed in
 * src/Enum/FeatureFlagEnum.php on the server side. New keys can be added
 * to the type below as they ship.
 */
export type FeatureFlags = {
  nfc_checkin?: boolean;
} & Record<string, boolean | undefined>;

export function useFeatures() {
  return useQuery<FeatureFlags>({
    queryKey: ['features'],
    queryFn: async () => {
      const { data } = await apiAxios.get<FeatureFlags>('/features');
      return data;
    },
    // Feature flags rarely change; a 5-minute stale window keeps the
    // network quiet while still reacting to admin toggles within one
    // session.
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
