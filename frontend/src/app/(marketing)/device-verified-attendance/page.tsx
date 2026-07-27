import { pageMetadata } from "@/lib/seo";
import { DeviceVerificationContent } from "../features/device-verification/DeviceVerificationContent";

/**
 * Alias for /features/device-verification.
 *
 * Both URLs render the same page. The canonical is pinned to
 * /features/device-verification so duplicate-content authority stays on one
 * URL, and the alias is deliberately absent from PAGES — which is what the
 * sitemap enumerates — so we never advertise two URLs for one page.
 *
 * Kept as a real route rather than a 301 so inbound campaign links and
 * link-preview scrapers keep resolving exactly as the canonical does.
 */
export const metadata = {
  ...pageMetadata("/features/device-verification"),
  alternates: { canonical: "/features/device-verification" },
};

export default function DeviceVerifiedAttendancePage() {
  return <DeviceVerificationContent />;
}
