import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useCheckinStatus, useCheckinAction } from '@/hooks/queries/useCheckin';
import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

export const Route = createFileRoute('/checkin/$publicId')({
  component: CheckinPage,
});

function CheckinPage() {
  const { t } = useTranslation();
  const { publicId } = Route.useParams();
  const { data, isLoading, error, refetch } = useCheckinStatus(publicId);
  const checkinAction = useCheckinAction(publicId);
  const [actionResult, setActionResult] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Request geolocation on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        (err) => setGeoError(err.message),
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }
  }, []);

  const handleCheckin = async () => {
    setActionError(null);
    try {
      const result = await checkinAction.mutateAsync(coords ?? undefined);
      if (result.checkOutAt) {
        setActionResult(`Checked out at ${result.checkOutAt}`);
      } else {
        setActionResult(`Checked in at ${result.checkInAt}`);
      }
      refetch();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : 'Check-in failed';
      setActionError(message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-text-tertiary">{t('common.loading')}</p>
      </div>
    );
  }

  if (error) {
    const status = (error as { response?: { status: number } })?.response?.status;
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 py-10">
        <p className="text-[11px] font-medium tracking-[2px] uppercase text-text-tertiary mb-8 font-sans">
          DailyBrew
        </p>
        <div className="bg-red/10 border border-red/20 rounded-2xl px-6 py-4 text-center max-w-xs">
          <p className="text-[14px] font-medium text-red">
            {status === 403 ? t('checkin.ipRestricted') : t('checkin.invalidToken')}
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { today } = data;
  const completed = today.checkedIn && today.checkedOut;

  const initials = data.employeeName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 py-10">
      {/* Logo */}
      <p className="text-[11px] font-medium tracking-[2px] uppercase text-text-tertiary mb-8 font-sans">
        DailyBrew
      </p>

      {/* Avatar */}
      <div
        className="w-16 h-16 rounded-[20px] flex items-center justify-center text-2xl font-bold text-white mb-4 bg-gradient-to-br from-amber-light to-coffee shadow-[0_4px_14px_rgba(107,66,38,0.25)]"
      >
        {initials}
      </div>

      {/* Name + Shift */}
      <h1 className="text-[18px] font-semibold text-text-primary mb-1">{data.employeeName}</h1>
      <p className="text-[12px] text-text-tertiary mb-6 font-sans">
        {data.shiftName
          ? `${data.shiftName} \u00b7 ${data.shiftStart}\u2013${data.shiftEnd}`
          : 'No shift assigned'}
      </p>

      {/* Geolocation warning */}
      {geoError && (
        <div className="flex items-center gap-1.5 bg-amber/10 border border-amber/20 rounded-xl px-4 py-2 text-[11px] text-amber font-medium mb-4 max-w-xs text-center">
          <MapPin size={14} className="shrink-0" />
          {t('checkin.locationDenied')}
        </div>
      )}

      {/* Status pill */}
      {today.checkedIn && (
        <div
          className={`border rounded-full px-4 py-1.5 text-[12px] font-medium mb-8 font-sans ${
            completed
              ? 'bg-green/10 border-green/20 text-green'
              : 'bg-green/10 border-green/20 text-green'
          }`}
        >
          {completed
            ? `\u2713 Checked out at ${today.checkOutAt}`
            : `\u2713 Checked in at ${today.checkInAt}`}
        </div>
      )}

      {/* Action result */}
      {actionResult && (
        <div className="bg-green/10 border border-green/20 rounded-full px-4 py-1.5 text-[12px] text-green font-medium mb-4">
          {actionResult}
        </div>
      )}

      {/* Error */}
      {actionError && (
        <div className="bg-red/10 border border-red/20 rounded-2xl px-4 py-3 text-[12px] text-red font-medium mb-4 max-w-xs text-center">
          {actionError}
        </div>
      )}

      {/* CTA button */}
      {!completed && (
        <button
          onClick={handleCheckin}
          disabled={checkinAction.isPending}
          className="w-full max-w-xs bg-coffee text-white text-[16px] font-semibold rounded-2xl py-4 border-none cursor-pointer shadow-[0_4px_14px_rgba(107,66,38,0.30)] active:scale-[0.97] transition-transform disabled:opacity-50"
        >
          {checkinAction.isPending
            ? t('common.loading')
            : today.checkedIn
              ? t('checkin.checkOut')
              : t('checkin.checkIn')}
        </button>
      )}

      {completed && (
        <div className="bg-green/10 border border-green/20 rounded-2xl px-6 py-4 text-center max-w-xs">
          <p className="text-[14px] font-medium text-green">{t('checkin.completed')}</p>
        </div>
      )}

      {/* Time */}
      <p className="text-[11px] text-text-tertiary mt-6 font-sans">
        {dateStr} &middot; {timeStr}
      </p>
    </div>
  );
}
