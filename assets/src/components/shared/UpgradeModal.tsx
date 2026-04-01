import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { usePaddle } from '@/hooks/usePaddle';
import {
  Crown,
  Globe,
  MapPin,
  Smartphone,
  FileText,
  Clock,
  Check,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { EspressoFeature } from '@/hooks/useUpgradeModal';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: EspressoFeature;
}

const featureConfig: Record<EspressoFeature, { icon: LucideIcon; titleKey: string; descKey: string }> = {
  ipRestriction: { icon: Globe, titleKey: 'upgrade.ipRestriction.title', descKey: 'upgrade.ipRestriction.description' },
  geofencing: { icon: MapPin, titleKey: 'upgrade.geofencing.title', descKey: 'upgrade.geofencing.description' },
  deviceVerification: { icon: Smartphone, titleKey: 'upgrade.deviceVerification.title', descKey: 'upgrade.deviceVerification.description' },
  leaveRequests: { icon: FileText, titleKey: 'upgrade.leaveRequests.title', descKey: 'upgrade.leaveRequests.description' },
  shiftTimeRules: { icon: Clock, titleKey: 'upgrade.shiftTimeRules.title', descKey: 'upgrade.shiftTimeRules.description' },
};

const espressoBenefits = [
  'Unlimited employees',
  'IP restriction',
  'Geofencing',
  'Leave requests',
  'Per-day schedules',
  'Device verification',
];

export function UpgradeModal({ open, onOpenChange, feature }: UpgradeModalProps) {
  const { t } = useTranslation();
  const { openCheckout } = usePaddle();
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  const config = featureConfig[feature];
  const FeatureIcon = config.icon;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-[420px] bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
          {/* Accent bar */}
          <div className="h-1 bg-gradient-to-r from-amber to-coffee rounded-t-2xl" />

          <div className="p-6 text-center">
            {/* Crown icon */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber/10 mb-4">
              <Crown size={28} className="text-amber" />
            </div>

            <Dialog.Title className="text-[20px] font-semibold text-text-primary font-serif mb-2">
              {t(config.titleKey)}
            </Dialog.Title>

            <Dialog.Description className="text-[15px] text-text-secondary leading-relaxed mb-5">
              {t(config.descKey)}
            </Dialog.Description>

            {/* Feature badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber/8 border border-amber/15 mb-5">
              <FeatureIcon size={14} className="text-amber" />
              <span className="text-[13.5px] font-medium text-amber">
                {t('upgrade.espressoFeature', 'Espresso feature')}
              </span>
            </div>

            {/* Benefits list */}
            <div className="text-left rounded-xl bg-cream-3/20 border border-cream-3/40 p-4 mb-5">
              <p className="text-[13px] uppercase tracking-[1px] font-medium text-text-tertiary mb-2.5">
                {t('upgrade.espressoIncludes', 'Espresso includes')}
              </p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {espressoBenefits.map((b) => (
                  <div key={b} className="flex items-center gap-1.5">
                    <Check size={12} className="text-amber flex-shrink-0" />
                    <span className="text-[14px] text-text-secondary">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing toggle */}
            <div className="inline-flex items-center rounded-lg bg-cream-3/40 p-0.5 mb-4">
              <button
                onClick={() => setBilling('monthly')}
                className={cn(
                  'px-4 py-1.5 rounded-md text-[14px] font-medium border-none cursor-pointer transition-colors',
                  billing === 'monthly' ? 'bg-coffee text-white' : 'bg-transparent text-text-secondary hover:text-text-primary',
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling('annual')}
                className={cn(
                  'px-4 py-1.5 rounded-md text-[14px] font-medium border-none cursor-pointer transition-colors',
                  billing === 'annual' ? 'bg-coffee text-white' : 'bg-transparent text-text-secondary hover:text-text-primary',
                )}
              >
                Annual
              </button>
            </div>

            <p className="text-[15px] font-semibold text-text-primary mb-1">
              {billing === 'annual' ? '$149/year' : '$14.99/month'}
            </p>
            {billing === 'annual' && (
              <p className="text-[13px] text-green font-medium mb-3">Save 17% vs monthly</p>
            )}

            {/* CTA */}
            <button
              onClick={() => {
                onOpenChange(false);
                openCheckout(billing);
              }}
              className="w-full py-2.5 rounded-xl text-[16px] font-medium text-white border-none cursor-pointer btn-shimmer transition-all hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(107,66,38,0.30)]"
            >
              {t('upgrade.startTrial', 'Start 14-day free trial')}
            </button>

            {/* Secondary */}
            <button
              onClick={() => onOpenChange(false)}
              className="mt-3 text-[14.5px] text-text-tertiary hover:text-text-secondary bg-transparent border-none cursor-pointer transition-colors"
            >
              {t('upgrade.maybeLater', 'Maybe later')}
            </button>
          </div>

          {/* Close button */}
          <Dialog.Close className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center bg-transparent border-none text-text-tertiary hover:text-text-secondary hover:bg-cream-3/40 cursor-pointer transition-all">
            <X size={15} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
