import { Copy, Nfc } from 'lucide-react';
import { toast } from 'sonner';
import { buildCheckinUrl } from '@/lib/checkinUrl';
import { useFeatureStage } from '@/hooks/queries/useFeatures';
import { FeatureStageBadge } from '@/components/shared/FeatureStageBadge';

/**
 * Single-line row showing the universal-link URL for a workspace QR or sub-QR,
 * with a copy button. Owners paste this into an NFC tag-writing app (NFC Tools,
 * TagWriter) so tapping the tag launches the mobile app directly.
 */
export function CheckinUrlRow({ qrToken, kind = 'ws' }: { qrToken: string; kind?: 'ws' | 'wqr' }) {
  const url = buildCheckinUrl(qrToken, kind);
  const nfcStage = useFeatureStage('nfc_checkin');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL copied — paste into your NFC tag-writing app');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="flex items-start gap-2 mt-2">
      <Nfc size={13} className="text-coffee mt-1.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <code className="text-[12.5px] font-mono text-text-secondary bg-cream-3/30 px-2 py-1 rounded truncate flex-1 min-w-0">
            {url}
          </code>
          {nfcStage && <FeatureStageBadge stage={nfcStage} />}
          <button
            type="button"
            onClick={handleCopy}
            className="text-text-tertiary hover:text-coffee bg-transparent border-none cursor-pointer p-1 rounded transition-colors shrink-0"
            aria-label="Copy NFC URL"
          >
            <Copy size={12} />
          </button>
        </div>
        <p className="text-[11.5px] text-text-tertiary mt-1 leading-snug">
          For NFC tags — write this URL with an app like NFC Tools so tapping the tag launches DailyBrew directly.
        </p>
      </div>
    </div>
  );
}
