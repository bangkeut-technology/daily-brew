"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";
import {
  Crown,
  Globe,
  MapPin,
  MousePointerClick,
  Nfc,
  Smartphone,
  FileText,
  Clock,
  Send,
  KeyRound,
  Check,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePaddle } from "@/hooks/usePaddle";
import type { EspressoFeature } from "@/hooks/useUpgradeModal";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: EspressoFeature;
}

const featureConfig: Record<
  EspressoFeature,
  { icon: LucideIcon; titleKey: string; descKey: string }
> = {
  ipRestriction: {
    icon: Globe,
    titleKey: "upgrade.ipRestriction.title",
    descKey: "upgrade.ipRestriction.description",
  },
  geofencing: {
    icon: MapPin,
    titleKey: "upgrade.geofencing.title",
    descKey: "upgrade.geofencing.description",
  },
  deviceVerification: {
    icon: Smartphone,
    titleKey: "upgrade.deviceVerification.title",
    descKey: "upgrade.deviceVerification.description",
  },
  leaveRequests: {
    icon: FileText,
    titleKey: "upgrade.leaveRequests.title",
    descKey: "upgrade.leaveRequests.description",
  },
  shiftTimeRules: {
    icon: Clock,
    titleKey: "upgrade.shiftTimeRules.title",
    descKey: "upgrade.shiftTimeRules.description",
  },
  telegramNotifications: {
    icon: Send,
    titleKey: "upgrade.telegramNotifications.title",
    descKey: "upgrade.telegramNotifications.description",
  },
  tapCheckin: {
    icon: MousePointerClick,
    titleKey: "upgrade.tapCheckin.title",
    descKey: "upgrade.tapCheckin.description",
  },
  nfcCheckin: {
    icon: Nfc,
    titleKey: "upgrade.nfcCheckin.title",
    descKey: "upgrade.nfcCheckin.description",
  },
  apiTokens: {
    icon: KeyRound,
    titleKey: "upgrade.apiTokens.title",
    descKey: "upgrade.apiTokens.description",
  },
};

/**
 * Drawn from `pricing.espresso.features.*` — the same catalogue the pricing
 * page reads — so the modal can't drift from what the plan actually includes,
 * and the list is translated rather than hardcoded English.
 */
const BENEFIT_KEYS = [
  "employees20",
  "leaveRequests",
  "ipRestriction",
  "geofencing",
  "deviceVerification",
  "perDaySchedules",
] as const;

/**
 * Contextual upgrade prompt shown when someone hits an Espresso wall. Names the
 * feature they were reaching for, then opens Paddle checkout directly — the
 * alternative is sending them to settings to find the plan card themselves.
 */
export function UpgradeModal({ open, onOpenChange, feature }: Props) {
  const { t } = useTranslation();
  const { openCheckout } = usePaddle();
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const config = featureConfig[feature];
  const FeatureIcon = config.icon;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-glass-border bg-glass-bg shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none backdrop-blur-xl">
          <div className="h-1 rounded-t-2xl bg-gradient-to-r from-amber to-coffee" />

          <div className="p-6 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber/10">
              <Crown size={28} className="text-amber" />
            </div>

            <Dialog.Title className="mb-2 font-serif text-[20px] font-semibold text-text-primary">
              {t(config.titleKey)}
            </Dialog.Title>

            <Dialog.Description className="mb-5 text-[15px] leading-relaxed text-text-secondary">
              {t(config.descKey)}
            </Dialog.Description>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber/15 bg-amber/8 px-3 py-1.5">
              <FeatureIcon size={14} className="text-amber" />
              <span className="text-[13.5px] font-medium text-amber">
                {t("upgrade.espressoFeature", "Espresso feature")}
              </span>
            </div>

            <div className="mb-5 rounded-xl border border-cream-3/40 bg-cream-3/20 p-4 text-left">
              <p className="mb-2.5 text-[13px] font-medium uppercase tracking-[1px] text-text-tertiary">
                {t("upgrade.espressoIncludes", "Espresso includes")}
              </p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {BENEFIT_KEYS.map((key) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <Check size={12} className="flex-shrink-0 text-amber" />
                    <span className="text-[14px] text-text-secondary">
                      {t(`pricing.espresso.features.${key}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4 inline-flex items-center rounded-lg bg-cream-3/40 p-0.5">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={cn(
                  "cursor-pointer rounded-md border-none px-4 py-1.5 text-[14px] font-medium transition-colors",
                  billing === "monthly"
                    ? "bg-coffee text-white"
                    : "bg-transparent text-text-secondary hover:text-text-primary",
                )}
              >
                {t("settings.billingMonthly", "Monthly")}
              </button>
              <button
                type="button"
                onClick={() => setBilling("annual")}
                className={cn(
                  "cursor-pointer rounded-md border-none px-4 py-1.5 text-[14px] font-medium transition-colors",
                  billing === "annual"
                    ? "bg-coffee text-white"
                    : "bg-transparent text-text-secondary hover:text-text-primary",
                )}
              >
                {t("settings.billingAnnual", "Annual")}
              </button>
            </div>

            <p className="mb-1 text-[15px] font-semibold text-text-primary">
              {billing === "annual"
                ? t("settings.priceEspressoYear", "$199/year")
                : t("settings.priceEspressoMonth", "$19.99/month")}
            </p>
            {billing === "annual" && (
              <p className="mb-3 text-[13px] font-medium text-green">
                {t("settings.annualSaving", "Save 17% vs monthly")}
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                openCheckout(billing);
              }}
              className="btn-shimmer w-full cursor-pointer rounded-xl border-none py-2.5 text-[16px] font-medium text-white transition-all hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(107,66,38,0.30)]"
            >
              {t("upgrade.startTrial", "Start 14-day free trial")}
            </button>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="mt-3 cursor-pointer border-none bg-transparent text-[14.5px] text-text-tertiary transition-colors hover:text-text-secondary"
            >
              {t("upgrade.maybeLater", "Maybe later")}
            </button>
          </div>

          <Dialog.Close className="absolute right-3 top-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-text-tertiary transition-all hover:bg-cream-3/40 hover:text-text-secondary">
            <X size={15} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
