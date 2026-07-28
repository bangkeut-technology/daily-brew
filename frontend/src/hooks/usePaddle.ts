"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { getWorkspacePublicId } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useApplication } from "@/providers/application-provider";

declare global {
  interface Window {
    Paddle?: {
      Environment?: { set: (env: "sandbox" | "production") => void };
      Initialize: (opts: {
        token: string;
        eventCallback?: (event: { name: string; data?: Record<string, unknown> }) => void;
      }) => void;
      Checkout: { open: (opts: Record<string, unknown>) => void };
    };
  }
}

export type BillingCycle = "monthly" | "annual";
export type PaidPlan = "espresso" | "double_espresso";

/**
 * Wraps Paddle.js checkout. The script itself is loaded by `<PaddleScript />`
 * in the console layout; this hook only initializes the SDK once it's there
 * and opens the overlay.
 *
 * `ready` is false when the client-side token isn't configured — callers
 * should route the operator somewhere they can still act (a mailto, the
 * pricing page) rather than rendering a button that silently does nothing.
 */
export function usePaddle() {
  const initialized = useRef(false);
  const { user } = useAuth();
  const config = useApplication();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (initialized.current) return;
    if (!config.paddleClientSideToken || !window.Paddle) return;

    if (config.paddleEnvironment === "sandbox" && window.Paddle.Environment) {
      window.Paddle.Environment.set("sandbox");
    }

    window.Paddle.Initialize({
      token: config.paddleClientSideToken,
      eventCallback: (event) => {
        // Paddle's webhook lands on the API a moment after the overlay
        // closes; the short delay lets the plan flip server-side before the
        // page re-reads it.
        if (event.name === "checkout.completed") {
          setTimeout(() => window.location.reload(), 2000);
        }
      },
    });
    initialized.current = true;
  }, [config.paddleClientSideToken, config.paddleEnvironment]);

  const priceIdFor = useCallback(
    (billing: BillingCycle, plan: PaidPlan): string => {
      if (plan === "double_espresso") {
        return billing === "annual"
          ? config.paddlePriceIdDoubleEspressoAnnual
          : config.paddlePriceIdDoubleEspressoMonthly;
      }
      return billing === "annual"
        ? config.paddlePriceIdEspressoAnnual
        : config.paddlePriceIdEspressoMonthly;
    },
    [config],
  );

  const openCheckout = useCallback(
    (billing: BillingCycle, plan: PaidPlan = "espresso") => {
      const priceId = priceIdFor(billing, plan);
      if (!priceId || !window.Paddle) return false;

      const workspaceId = getWorkspacePublicId();
      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: user?.email ? { email: user.email } : undefined,
        // The webhook reads this back to know which workspace to upgrade.
        customData: workspaceId ? { workspace_public_id: workspaceId } : undefined,
        settings: {
          displayMode: "overlay",
          theme: resolvedTheme === "dark" ? "dark" : "light",
          successUrl: `${window.location.origin}/console/settings`,
        },
      });
      return true;
    },
    [priceIdFor, resolvedTheme, user],
  );

  return { openCheckout, ready: !!config.paddleClientSideToken };
}
