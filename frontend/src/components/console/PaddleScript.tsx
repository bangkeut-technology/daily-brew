"use client";

import Script from "next/script";
import { useApplication } from "@/providers/application-provider";

/**
 * Loads Paddle.js for the authenticated areas only — marketing pages stay
 * static and shouldn't pull a third-party script. Skipped entirely when no
 * client-side token is configured (local dev, self-hosted installs), so those
 * builds don't hit the CDN for a script they can't use.
 */
export function PaddleScript() {
  const { paddleClientSideToken } = useApplication();
  if (!paddleClientSideToken) return null;

  return <Script src="https://cdn.paddle.com/paddle/v2/paddle.js" strategy="afterInteractive" />;
}
