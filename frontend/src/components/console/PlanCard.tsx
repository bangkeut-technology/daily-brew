"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Check, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApplication } from "@/providers/application-provider";
import { usePaddle, type BillingCycle } from "@/hooks/usePaddle";
import { useDevTogglePlan } from "@/hooks/useDevTogglePlan";
import type { PlanDetails } from "@/hooks/usePlan";
import { GlassCard, GlassCardHeader } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";

/**
 * Plan comparison + billing controls.
 *
 * Subscribing runs through the Paddle overlay; *managing* an existing
 * subscription deliberately links out to Paddle's hosted customer portal
 * rather than reimplementing payment-method and cancellation flows here.
 */
export function PlanCard({
  plan,
  formatDate,
}: {
  plan: PlanDetails;
  formatDate: (iso: string) => string;
}) {
  const { t } = useTranslation();
  const config = useApplication();
  const { openCheckout, ready: paddleReady } = usePaddle();
  const devToggle = useDevTogglePlan();
  const [billing, setBilling] = useState<BillingCycle>("annual");

  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost");
  const portalDomain =
    config.paddleEnvironment === "sandbox"
      ? "sandbox-customer-portal.paddle.com"
      : "customer-portal.paddle.com";
  const doubleEspressoSellable = !!config.paddlePriceIdDoubleEspressoMonthly && paddleReady;

  const checkout = (cycle: BillingCycle, target: "espresso" | "double_espresso") => {
    if (!openCheckout(cycle, target)) {
      toast.error(t("settings.checkoutUnavailable", "Checkout is unavailable right now"));
    }
  };

  return (
    <GlassCard hover={false}>
      <GlassCardHeader
        title={t("settings.plan", "Plan")}
        action={
          <StatusBadge
            label={
              plan.isTrialing
                ? t("settings.trialBadge", "Trial · {{count}}d left", {
                    count: plan.trialDaysRemaining ?? 0,
                  })
                : plan.planLabel
            }
            variant={plan.isTrialing ? "amber" : plan.isEspresso ? "green" : "gray"}
          />
        }
      />
      <div className="p-5">
        {isLocalhost && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber/15 bg-amber/8 px-3 py-2">
            <span className="mr-2 text-[12px] font-semibold uppercase tracking-wider text-amber">
              Dev
            </span>
            {(["free", "espresso", "double_espresso"] as const).map((p) => (
              <button
                key={p}
                type="button"
                disabled={devToggle.isPending}
                onClick={() =>
                  devToggle.mutate(p, {
                    onSuccess: () =>
                      toast.success(
                        t("settings.devSwitched", "Switched to {{plan}}", { plan: PLAN_LABEL[p] }),
                      ),
                    onError: () =>
                      toast.error(t("settings.devToggleFailed", "Failed to toggle plan")),
                  })
                }
                className={cn(
                  "rounded-md px-3 py-1 text-[13px] font-medium transition-colors",
                  plan.plan === p
                    ? "bg-coffee text-white"
                    : "bg-glass-bg text-text-secondary hover:bg-cream-3",
                )}
              >
                {PLAN_LABEL[p]}
              </button>
            ))}
          </div>
        )}

        {plan.isTrialing && (
          <div className="mb-4 flex items-center gap-4 rounded-xl border border-amber/20 bg-amber/8 px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber/15">
              <Crown size={20} className="text-amber" />
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-amber">
                {t("settings.trialBannerTitle", "Espresso trial — {{count}} day remaining", {
                  count: plan.trialDaysRemaining ?? 0,
                })}
              </p>
              <p className="text-sm text-text-secondary">
                {t(
                  "settings.trialBannerBody",
                  "You have full access to all Espresso features. Your first payment will be charged after the trial ends.",
                )}
              </p>
            </div>
            {plan.currentPeriodEnd && (
              <p className="shrink-0 text-[13px] font-medium text-amber">
                {t("settings.trialEnds", "Ends {{date}}", {
                  date: formatDate(plan.currentPeriodEnd),
                })}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* ── Free ── */}
          <div
            className={cn(
              "rounded-xl border-2 p-5 transition-colors",
              plan.plan === "free" ? "border-coffee bg-coffee/5" : "border-cream-3 bg-glass-bg",
            )}
          >
            <h3 className="mb-1 text-[17px] font-semibold text-text-primary">Free</h3>
            <p className="mb-4 text-sm text-text-tertiary">
              {t("settings.planGetStarted", "Get started")}
            </p>
            <ul className="space-y-2">
              {[
                t("settings.featureUpTo10", "Up to 10 active employees"),
                t("settings.featureQrCheckin", "QR code check-in"),
                t("settings.featureShiftMgmt", "Shift management"),
                t("settings.featureClosureMgmt", "Closure management"),
                t("settings.featureDashboard", "Dashboard & attendance log"),
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-[14.5px] text-text-secondary">
                  <Check size={14} className="shrink-0 text-green" />
                  {f}
                </li>
              ))}
            </ul>
            {plan.plan === "free" && plan.remainingEmployeeSlots !== null && (
              <p className="mt-4 text-[13px] text-text-tertiary">
                {t("settings.employeeSlotsRemaining", "{{count}} employee slot remaining", {
                  count: plan.remainingEmployeeSlots,
                })}
              </p>
            )}
          </div>

          {/* ── Espresso ── */}
          <div
            className={cn(
              "relative overflow-hidden rounded-xl border-2 p-5 transition-colors",
              plan.isEspresso ? "border-amber bg-amber/5" : "border-cream-3 bg-glass-bg",
            )}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-amber to-amber-light" />
            <div className="mb-1 flex items-center gap-2">
              <Crown size={18} className="text-amber" />
              <h3 className="text-[20px] font-semibold text-text-primary">Espresso</h3>
              {plan.isEspresso && (
                <span className="rounded-full bg-green/10 px-2 py-0.5 text-[13px] font-semibold text-green">
                  {plan.isTrialing
                    ? t("settings.planTrialLabel", "Trial")
                    : t("settings.planCurrentLabel", "Current")}
                </span>
              )}
            </div>
            <p className="mb-4 text-base text-text-tertiary">
              {t("settings.planGrowingTeams", "For growing teams")}
            </p>
            <ul className="space-y-2.5">
              {[
                t("settings.featureUpTo20", "Up to 20 employees"),
                t("settings.featureIpRestriction", "IP restriction for check-in & out"),
                t("settings.featureDeviceVerification", "Device verification for check-in & out"),
                t("settings.featureGeofencing", "Geofencing for check-in & out"),
                t("settings.featurePerDaySchedules", "Per-day schedules"),
                t("settings.featureLeaveRequests", "Leave requests"),
                t("settings.featureBasilBook", "BasilBook linking"),
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-base text-text-secondary">
                  <Check size={16} className="shrink-0 text-amber" />
                  {f}
                </li>
              ))}
            </ul>

            {plan.plan === "free" && (
              <div className="mt-4 space-y-3">
                <BillingToggle
                  billing={billing}
                  onChange={setBilling}
                  price={
                    billing === "annual"
                      ? t("settings.priceEspressoYear", "$199/year")
                      : t("settings.priceEspressoMonth", "$19.99/month")
                  }
                />
                <button
                  type="button"
                  disabled={!paddleReady}
                  onClick={() => checkout(billing, "espresso")}
                  className="w-full rounded-lg bg-linear-to-r from-amber to-coffee px-4 py-2.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(193,127,59,0.3)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {paddleReady
                    ? t("settings.startFreeTrial", "Start 14-day free trial")
                    : t("settings.checkoutUnavailable", "Checkout is unavailable right now")}
                </button>
              </div>
            )}

            {plan.isEspresso && (
              <div className="mt-4 space-y-3">
                <div className="space-y-1 text-[13px] text-text-tertiary">
                  {plan.remainingEmployeeSlots !== null && (
                    <p>
                      {t("settings.employeeSlotsRemaining", "{{count}} employee slot remaining", {
                        count: plan.remainingEmployeeSlots,
                      })}
                    </p>
                  )}
                  {plan.currentPeriodEnd && (
                    <p>
                      {plan.isTrialing
                        ? t("settings.trialEndsDate", "Trial ends {{date}}", {
                            date: formatDate(plan.currentPeriodEnd),
                          })
                        : t("settings.renewsDate", "Renews {{date}}", {
                            date: formatDate(plan.currentPeriodEnd),
                          })}
                    </p>
                  )}
                </div>
                {plan.paddleSubscriptionId && (
                  <div className="flex gap-2">
                    <PortalLink
                      href={`https://${portalDomain}/subscriptions/${plan.paddleSubscriptionId}/update-payment-method`}
                      className="flex-1 border-cream-3 bg-glass-bg text-text-primary hover:bg-cream-3"
                    >
                      {t("settings.manageBilling", "Manage billing")}
                    </PortalLink>
                    <PortalLink
                      href={`https://${portalDomain}/subscriptions/${plan.paddleSubscriptionId}/cancel`}
                      className="border-red/20 text-red hover:bg-red/5"
                    >
                      {t("common.cancel", "Cancel")}
                    </PortalLink>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Double Espresso ── */}
          <div
            className={cn(
              "relative overflow-hidden rounded-xl border-2 p-5 transition-colors",
              plan.plan === "double_espresso"
                ? "border-coffee bg-coffee/5"
                : "border-cream-3 bg-glass-bg",
            )}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-coffee to-amber" />
            <div className="mb-1 flex items-center gap-2">
              <Crown size={16} className="text-coffee" />
              <h3 className="text-[17px] font-semibold text-text-primary">Double Espresso</h3>
              {!doubleEspressoSellable && (
                <span className="rounded-full bg-coffee/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-coffee">
                  {t("settings.comingSoon", "Coming soon")}
                </span>
              )}
            </div>
            <p className="mb-1 text-sm text-text-tertiary">
              {t("settings.priceDoubleMonth", "$39.99/month")}
            </p>
            <p className="mb-4 text-sm text-text-tertiary">
              {t("settings.planLargeTeams", "For large teams")}
            </p>
            <ul className="space-y-2">
              {[
                { text: t("settings.featureUnlimited", "Unlimited employees") },
                { text: t("settings.featureEverythingEspresso", "Everything in Espresso") },
                { text: t("settings.featurePrioritySupport", "Priority support") },
                { text: t("settings.featureMultiQrStations", "Multiple QR stations") },
                { text: t("settings.featurePerQrSettings", "Per-QR geofence & settings") },
                { text: t("settings.featureEmployeeAssign", "Employee assignment per QR") },
                { text: t("settings.featureManagerRole", "Unlimited managers") },
              ].map((f) => (
                <li key={f.text} className="flex items-center gap-2 text-[14.5px] text-text-secondary">
                  <Check size={14} className="shrink-0 text-coffee" />
                  {f.text}
                </li>
              ))}
            </ul>

            {(plan.plan === "free" || plan.plan === "espresso") &&
              (doubleEspressoSellable ? (
                <div className="mt-4 space-y-2">
                  <BillingToggle
                    billing={billing}
                    onChange={setBilling}
                    price={
                      billing === "annual"
                        ? t("settings.priceDoubleYear", "$399/year")
                        : t("settings.priceDoubleMonth", "$39.99/month")
                    }
                  />
                  <button
                    type="button"
                    onClick={() => checkout(billing, "double_espresso")}
                    className="w-full rounded-lg bg-linear-to-r from-coffee to-amber px-4 py-2.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(107,66,38,0.3)]"
                  >
                    {t("settings.upgradeDouble", "Upgrade to Double Espresso")}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-4 w-full cursor-not-allowed rounded-lg border border-cream-3 bg-glass-bg px-4 py-2.5 text-[15px] font-semibold text-text-secondary opacity-70"
                >
                  {t("settings.comingSoon", "Coming soon")}
                </button>
              ))}

            {plan.plan === "double_espresso" && plan.currentPeriodEnd && (
              <p className="mt-4 text-[13px] text-text-tertiary">
                {t("settings.renewsDate", "Renews {{date}}", {
                  date: formatDate(plan.currentPeriodEnd),
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

const PLAN_LABEL: Record<"free" | "espresso" | "double_espresso", string> = {
  free: "Free",
  espresso: "Espresso",
  double_espresso: "Double Espresso",
};

function BillingToggle({
  billing,
  onChange,
  price,
}: {
  billing: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  price: string;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex items-center justify-between">
        <div
          role="radiogroup"
          aria-label={t("settings.billingCycle", "Billing cycle")}
          className="inline-flex items-center rounded-lg bg-cream-3/40 p-0.5"
        >
          {(["monthly", "annual"] as const).map((cycle) => (
            <button
              key={cycle}
              type="button"
              role="radio"
              aria-checked={billing === cycle}
              onClick={() => onChange(cycle)}
              className={cn(
                "rounded-md px-3 py-1 text-[13px] font-medium transition-colors",
                billing === cycle ? "bg-coffee text-white" : "text-text-secondary",
              )}
            >
              {cycle === "monthly"
                ? t("settings.billingMonthly", "Monthly")
                : t("settings.billingAnnual", "Annual")}
            </button>
          ))}
        </div>
        <span className="text-[15px] font-semibold text-text-primary">{price}</span>
      </div>
      {billing === "annual" && (
        <p className="text-[12.5px] font-medium text-green">
          {t("settings.save17", "Save 17% vs monthly")}
        </p>
      )}
    </>
  );
}

/** Paddle's hosted portal opens in a new tab — it's a different origin. */
function PortalLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "rounded-lg border px-3 py-2 text-center text-sm font-medium no-underline transition-colors",
        className,
      )}
    >
      {children}
    </a>
  );
}
