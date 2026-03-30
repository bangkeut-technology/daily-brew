import { useState } from 'react';

export type EspressoFeature =
  | 'ipRestriction'
  | 'geofencing'
  | 'deviceVerification'
  | 'leaveRequests'
  | 'shiftTimeRules';

export function useUpgradeModal() {
  const [feature, setFeature] = useState<EspressoFeature | null>(null);

  return {
    isOpen: feature !== null,
    feature,
    openFor: (f: EspressoFeature) => setFeature(f),
    close: () => setFeature(null),
  };
}
