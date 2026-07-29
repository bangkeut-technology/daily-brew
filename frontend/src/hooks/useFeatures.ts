"use client";

import { useQuery } from "@tanstack/react-query";
import { apiAxios, getWorkspacePublicId } from "@/lib/api";
import type { FeatureFlagStage } from "@/types/admin";

/**
 * Response from GET /features. `flags` covers every known flag (true when
 * visible to this workspace's testing track); `stages` only includes the flags
 * the workspace can see, so we don't leak the existence of hidden features.
 *
 * The set of keys is fixed in src/Enum/FeatureFlagEnum.php server-side.
 */
export type FeatureFlagKey = "nfc_checkin";

export type FeatureFlagsResponse = {
  flags: Partial<Record<FeatureFlagKey, boolean>> & Record<string, boolean | undefined>;
  stages: Partial<Record<FeatureFlagKey, FeatureFlagStage>> &
    Record<string, FeatureFlagStage | undefined>;
};

export function useFeatures() {
  const workspaceId = getWorkspacePublicId() || "";
  return useQuery<FeatureFlagsResponse>({
    queryKey: ["features", workspaceId],
    queryFn: async () =>
      (
        await apiAxios.get<FeatureFlagsResponse>("/features", {
          params: workspaceId ? { workspaceId } : undefined,
        })
      ).data,
    // Flags rarely change; a 5-minute stale window keeps the network quiet
    // while still reacting to admin toggles within one session.
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * A single flag's enabled state. Defaults to false while loading so gated UI
 * stays hidden until the answer is known.
 */
export function useFeatureEnabled(key: FeatureFlagKey | string): boolean {
  const { data } = useFeatures();
  return data?.flags?.[key] === true;
}

/**
 * The rollout stage of a flag visible to this workspace, or undefined if the
 * flag isn't visible (or is still loading). Pair with `<FeatureStageBadge>` to
 * label testing-phase UI as Beta / Alpha / Dev, so an owner can tell a feature
 * that's still being trialled from one that's fully shipped.
 */
export function useFeatureStage(key: FeatureFlagKey | string): FeatureFlagStage | undefined {
  const { data } = useFeatures();
  return data?.stages?.[key];
}
