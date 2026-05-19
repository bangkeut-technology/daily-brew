/**
 * Builds the canonical Universal-Link / App-Link URL for an NFC tag (or any
 * deep link) that should resolve to a workspace or sub-QR check-in. Owners
 * paste this URL into NFC tag-writing apps; the mobile app's universal-link
 * route handlers (app/checkin/[qrToken].tsx and app/checkin/qr/[qrToken].tsx)
 * catch the URL and run the check-in pipeline directly.
 *
 * Origin is taken from window.location.origin so dev / staging / prod
 * automatically generate the right host.
 */
export function buildCheckinUrl(qrToken: string, kind: 'ws' | 'wqr' = 'ws'): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dailybrew.work';
  return kind === 'wqr'
    ? `${origin}/checkin/qr/${qrToken}`
    : `${origin}/checkin/${qrToken}`;
}
