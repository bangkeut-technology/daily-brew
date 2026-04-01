import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LogIn, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';
import { useCheckinStatus, useCheckinAction } from '@/hooks/queries/useCheckin';
import { GlassCard } from '@/components/shared/GlassCard';

interface ManagerCheckinCardProps {
  qrToken: string;
}

export function ManagerCheckinCard({ qrToken }: ManagerCheckinCardProps) {
  const { t } = useTranslation();
  const { data, isLoading, refetch } = useCheckinStatus(qrToken);
  const checkinAction = useCheckinAction(qrToken);
  const [error, setError] = useState<string | null>(null);

  const handleCheckin = useCallback(async () => {
    setError(null);
    const perform = async (coords?: { latitude: number; longitude: number }) => {
      try {
        await checkinAction.mutateAsync(coords);
        refetch();
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response: { data: { message: string } } }).response?.data?.message
            : t('checkin.failed', 'Check-in failed');
        setError(message);
      }
    };

    if (!navigator.geolocation) {
      await perform();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => perform({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      async () => perform(),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [checkinAction, refetch, t]);

  if (isLoading || !data) return null;

  const today = data.today;
  const checkedIn = today?.checkedIn ?? false;
  const checkedOut = today?.checkedOut ?? false;
  const completed = checkedIn && checkedOut;

  return (
    <GlassCard hover={false}>
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber/10 flex items-center justify-center">
            {completed ? (
              <CheckCircle size={18} className="text-green" />
            ) : checkedIn ? (
              <LogOut size={18} className="text-amber" />
            ) : (
              <LogIn size={18} className="text-coffee" />
            )}
          </div>
          <div>
            <p className="text-[15px] font-medium text-text-primary">
              {completed
                ? 'Shift complete'
                : checkedIn
                  ? `Checked in at ${today?.checkInAt ?? '—'}`
                  : 'Not checked in yet'}
            </p>
            {data.shiftName && (
              <p className="text-[13px] text-text-tertiary">
                {data.shiftName} ({data.shiftStart}–{data.shiftEnd})
              </p>
            )}
          </div>
        </div>

        {!completed && (
          <button
            type="button"
            onClick={handleCheckin}
            disabled={checkinAction.isPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[14px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px disabled:opacity-50"
          >
            {checkedIn ? <LogOut size={14} /> : <LogIn size={14} />}
            {checkinAction.isPending
              ? '...'
              : checkedIn
                ? 'Check out'
                : 'Check in'}
          </button>
        )}
      </div>

      {error && (
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red/8 border border-red/15">
            <AlertTriangle size={14} className="text-red flex-shrink-0" />
            <p className="text-[13.5px] text-red">{error}</p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
