"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

/**
 * OAuth landing. Symfony has already set the JWT cookie, so we just bootstrap
 * auth state and route the user onward.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { status, user } = useAuth();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/sign-in");
      return;
    }
    if (user && !user.onboardingCompleted) {
      router.replace("/onboarding");
      return;
    }
    router.replace("/console/dashboard");
  }, [status, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-text-tertiary">Signing you in…</p>
    </div>
  );
}
