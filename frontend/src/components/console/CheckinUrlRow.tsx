"use client";

import { Copy, Nfc } from "lucide-react";
import { toast } from "sonner";

/**
 * Builds the canonical Universal-Link / App-Link URL for an NFC tag. Owners
 * paste this into a tag-writing app; the mobile app's universal-link handlers
 * catch it and run the check-in pipeline directly. Origin comes from
 * `window.location` so dev / staging / prod each generate their own host.
 */
export function buildCheckinUrl(qrToken: string, kind: "ws" | "wqr" = "ws"): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://dailybrew.work";
  return kind === "wqr" ? `${origin}/checkin/qr/${qrToken}` : `${origin}/checkin/${qrToken}`;
}

/**
 * Single-line row showing the universal-link URL for a workspace QR or sub-QR,
 * with a copy button.
 */
export function CheckinUrlRow({ qrToken, kind = "ws" }: { qrToken: string; kind?: "ws" | "wqr" }) {
  const url = buildCheckinUrl(qrToken, kind);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied — paste into your NFC tag-writing app");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="mt-2 flex items-start gap-2">
      <Nfc size={13} className="mt-1.5 shrink-0 text-coffee" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded bg-cream-3/30 px-2 py-1 font-mono text-[12.5px] text-text-secondary">
            {url}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy NFC URL"
            className="shrink-0 rounded p-1 text-text-tertiary transition-colors hover:text-coffee"
          >
            <Copy size={12} />
          </button>
        </div>
        <p className="mt-1 text-[11.5px] leading-snug text-text-tertiary">
          For NFC tags — write this URL with an app like NFC Tools so tapping the tag launches
          DailyBrew directly.
        </p>
      </div>
    </div>
  );
}
