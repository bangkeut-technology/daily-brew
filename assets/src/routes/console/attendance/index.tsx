import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAttendance } from '@/hooks/queries/useAttendance';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { AttendanceRow } from '@/components/shared/AttendanceRow';

export const Route = createFileRoute('/console/attendance/')({
  component: AttendancePage,
});

function AttendancePage() {
  const { t } = useTranslation();
  const workspaceId = getWorkspacePublicId() || '';
  const today = new Date().toISOString().split('T')[0];
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const { data: attendance, isLoading } = useAttendance(workspaceId, from, to);

  return (
    <div className="page-enter">
      <PageHeader title={t('nav.attendance')} />

      <div className="flex gap-3 mb-4">
        <div>
          <label className="block text-[11px] font-medium text-text-secondary mb-1">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 rounded-lg text-[13px] bg-white/62 border border-cream-3 text-text-primary outline-none focus:border-coffee transition-colors"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-text-secondary mb-1">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 rounded-lg text-[13px] bg-white/62 border border-cream-3 text-text-primary outline-none focus:border-coffee transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-text-tertiary">{t('common.loading')}</p>
      ) : (
        <GlassCard hover={false}>
          {attendance?.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-text-tertiary">
              {t('common.noResults')}
            </p>
          ) : (
            attendance?.map((a, i) => (
              <AttendanceRow
                key={a.publicId}
                employee={a.employeeName || ''}
                shift={a.shiftName || null}
                time={a.checkInAt}
                checkOut={a.checkOutAt}
                isLate={a.isLate}
                leftEarly={a.leftEarly}
                index={i}
              />
            ))
          )}
        </GlassCard>
      )}
    </div>
  );
}
