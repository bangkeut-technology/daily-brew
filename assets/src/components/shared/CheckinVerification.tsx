import { useTranslation } from 'react-i18next';
import { Check, Lock, MapPin, ShieldCheck, Smartphone, Wifi, type LucideIcon } from 'lucide-react';
import { usePlan } from '@/hooks/queries/usePlan';
import { useWorkspaceSettings } from '@/hooks/queries/useWorkspaces';
import { useUpgradeModal, type EspressoFeature } from '@/hooks/useUpgradeModal';
import { UpgradeModal } from './UpgradeModal';
import { cn } from '@/lib/utils';

interface CheckinVerificationProps {
  workspacePublicId: string;
}

type PillState = 'verified' | 'off' | 'locked';

interface Protection {
  feature: EspressoFeature;
  icon: LucideIcon;
  canUse: boolean;
  enabled: boolean;
  verifiedLabel: string;
  offLabel: string;
  lockedLabel: string;
  hint: string;
}

/**
 * Shows which check-in protections (location / device / network) are active
 * for this workspace, rendered as small pills on the attendance detail.
 *
 * Privacy by design: this surfaces only the verification *outcome* — never the
 * raw coordinates, IP address, or device UUID, which stay server-side. On Free
 * plans the protections aren't available, so the pills become a contextual
 * upsell into the Espresso upgrade flow.
 */
export function CheckinVerification({ workspacePublicId }: CheckinVerificationProps) {
  const { t } = useTranslation();
  const { data: plan } = usePlan(workspacePublicId);
  const { data: settings } = useWorkspaceSettings(workspacePublicId);
  const upgrade = useUpgradeModal();

  if (!plan || !settings) return null;

  const protections: Protection[] = [
    {
      feature: 'geofencing',
      icon: MapPin,
      canUse: plan.canUseGeofencing,
      enabled: settings.geofencingEnabled,
      verifiedLabel: t('attendance.verification.atRestaurant', 'At restaurant'),
      offLabel: t('attendance.verification.locationOff', 'Location not verified'),
      lockedLabel: t('attendance.verification.verifyLocation', 'Verify location'),
      hint: t(
        'attendance.verification.atRestaurantHint',
        'Check-in is only allowed within the restaurant boundary',
      ),
    },
    {
      feature: 'deviceVerification',
      icon: Smartphone,
      canUse: plan.canUseDeviceVerification,
      enabled: settings.deviceVerificationEnabled,
      verifiedLabel: t('attendance.verification.sameDevice', 'Same device'),
      offLabel: t('attendance.verification.deviceOff', 'Device not verified'),
      lockedLabel: t('attendance.verification.verifyDevice', 'Verify device'),
      hint: t(
        'attendance.verification.sameDeviceHint',
        'Same device for check-in and check-out, and not reused by another employee that day',
      ),
    },
    {
      feature: 'ipRestriction',
      icon: Wifi,
      canUse: plan.canUseIpRestriction,
      enabled: settings.ipRestrictionEnabled,
      verifiedLabel: t('attendance.verification.restaurantNetwork', 'Restaurant network'),
      offLabel: t('attendance.verification.networkOff', 'Network not verified'),
      lockedLabel: t('attendance.verification.restrictNetwork', 'Verify network'),
      hint: t(
        'attendance.verification.restaurantNetworkHint',
        'Check-in is only allowed from an approved network',
      ),
    },
  ];

  const stateOf = (p: Protection): PillState => (!p.canUse ? 'locked' : p.enabled ? 'verified' : 'off');
  const anyLocked = protections.some((p) => stateOf(p) === 'locked');

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <ShieldCheck size={13} className="text-text-tertiary" />
        <p className="text-[12px] uppercase tracking-[0.6px] font-medium text-text-tertiary">
          {t('attendance.verification.title', 'Check-in verification')}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {protections.map((p) => {
          const state = stateOf(p);
          const Icon = p.icon;

          if (state === 'locked') {
            return (
              <button
                key={p.feature}
                type="button"
                onClick={() => upgrade.openFor(p.feature)}
                title={t('attendance.verification.upgradeHint', 'Upgrade to Espresso to enforce this')}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12.5px] font-medium',
                  'bg-amber/8 text-amber border border-amber/20 cursor-pointer transition-all',
                  'hover:bg-amber/15 hover:-translate-y-px',
                )}
              >
                <Lock size={11} />
                {p.lockedLabel}
              </button>
            );
          }

          return (
            <span
              key={p.feature}
              title={p.hint}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12.5px] font-medium cursor-default',
                state === 'verified'
                  ? 'bg-green/10 text-green border border-green/20'
                  : 'bg-cream-3/30 text-text-tertiary border border-cream-3',
              )}
            >
              {state === 'verified' ? <Check size={11} /> : <Icon size={11} />}
              {state === 'verified' ? p.verifiedLabel : p.offLabel}
            </span>
          );
        })}
      </div>

      {anyLocked && (
        <p className="text-[12px] text-text-tertiary leading-snug">
          {t(
            'attendance.verification.upsell',
            'Upgrade to Espresso to verify where, on which device, and from which network staff check in.',
          )}
        </p>
      )}

      <UpgradeModal
        open={upgrade.isOpen}
        onOpenChange={(open) => {
          if (!open) upgrade.close();
        }}
        feature={upgrade.feature ?? 'geofencing'}
      />
    </div>
  );
}
