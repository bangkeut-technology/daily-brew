import { createFileRoute } from '@tanstack/react-router';
import { DeviceVerificationPage } from './features/device-verification';

/**
 * Alias route for /features/device-verification.
 *
 * Both URLs serve the same React component. Search engines see the alias's
 * canonical link rewritten to /features/device-verification (handled
 * server-side in App\Service\Seo\SeoMetaResolver via CANONICAL_ALIASES), so
 * duplicate-content authority is preserved. The alias is also excluded from
 * the dynamic sitemap so we never advertise two URLs for one page.
 *
 * Kept as a separate route file (rather than a server-side 301) so the SPA
 * shell, link-preview scrapers, and any inbound campaign links keep working
 * exactly the same way the canonical does.
 */
export const Route = createFileRoute('/device-verified-attendance')({
  component: DeviceVerificationPage,
});
