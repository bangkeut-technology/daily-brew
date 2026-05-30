import { useTranslation } from 'react-i18next';
import { LogIn, LogOut, CheckCircle } from 'lucide-react';
import { useCheckinStatus } from '@/hooks/queries/useCheckin';
import { GlassCard } from '@/components/shared/GlassCard';

interface ManagerCheckinCardProps {
  qrToken: string;
}

/**
 * Manager-view "today" status card for the console dashboard.
 *
 * The web check-in/check-out action button was removed deliberately — every
 * legitimate punch should go through the QR scan + device + IP + (NFC tag)
 * verification stack, which only the mobile app and the /checkin/{token}
 * route can run. The dashboard card stays as a read-only status indicator
 * so a manager who's logged in from a desktop can still see whether their
 * own day is open / closed without rendering an action that would bypass
 * verification.
 */
export function ManagerCheckinCard({ qrToken }: ManagerCheckinCardProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useCheckinStatus(qrToken);

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
                ? t('checkin.completed', 'Attendance completed for today')
                : checkedIn
                  ? t('checkin.checkedInAt', 'Checked in at {{time}}', { time: today?.checkInAt ?? '—' })
                  : t('dashboard.notCheckedIn', 'Not checked in yet')}
            </p>
            {data.shiftName && (
              <p className="text-[13px] text-text-tertiary">
                {data.shiftName} ({data.shiftStart}–{data.shiftEnd})
              </p>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
