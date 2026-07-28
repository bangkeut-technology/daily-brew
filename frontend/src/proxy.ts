import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

/**
 * Locale routing for the public marketing pages.
 *
 * Named `proxy` rather than `middleware`: this Next version deprecated the
 * `middleware` file convention in favour of `proxy`. next-intl's docs still
 * show `middleware.ts`, which would silently never run here.
 */
export const proxy = createMiddleware(routing);

export const config = {
  /**
   * Marketing only. The console, admin, auth screens and the check-in page are
   * deliberately excluded — they're behind auth or device-specific, their
   * language follows the signed-in user's setting rather than the URL, and
   * prefixing them would break every stored `/console/...` link.
   *
   * Also skips `/api`, `/oauth` and `/.well-known` (proxied to Symfony),
   * Next internals, and anything with a file extension.
   */
  matcher: [
    "/((?!api|oauth|\\.well-known|_next|console|admin|auth|checkin|sign-in|sign-up|forgot-password|reset-password|onboarding|.*\\..*).*)",
  ],
};
