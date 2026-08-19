"use client";

import { useState } from "react";

export type EspressoFeature =
  | "ipRestriction"
  | "geofencing"
  | "deviceVerification"
  | "leaveRequests"
  | "shiftTimeRules"
  | "telegramNotifications"
  | "tapCheckin"
  | "cardCheckin"
  | "nfcCheckin"
  | "apiTokens";

/**
 * Tracks which Espresso wall the user hit, so {@link UpgradeModal} can name the
 * feature they were reaching for rather than pitching the plan generically.
 */
export function useUpgradeModal() {
  const [feature, setFeature] = useState<EspressoFeature | null>(null);

  return {
    isOpen: feature !== null,
    feature,
    openFor: (f: EspressoFeature) => setFeature(f),
    close: () => setFeature(null),
  };
}
