import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { useEmployee } from '@/hooks/queries/useEmployees';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { Avatar } from '@/components/shared/Avatar';
import { StatusBadge } from '@/components/shared/StatusBadge';

export const Route = createFileRoute('/console/employees/$publicId/')({
  component: EmployeeDetailPage,
});

function EmployeeDetailPage() {
  const { t } = useTranslation();
  const { publicId } = Route.useParams();
  const workspaceId = getWorkspacePublicId() || '';
  const { data: employee, isLoading } = useEmployee(workspaceId, publicId);

  if (isLoading || !employee) {
    return (
      <div className="page-enter">
        <p className="text-text-tertiary">{t('common.loading')}</p>
      </div>
    );
  }

  const checkinUrl = `${window.location.origin}/checkin/${employee.qrToken}`;

  return (
    <div className="page-enter">
      <PageHeader title={employee.name} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info card */}
        <GlassCard hover={false}>
          <div className="p-6 flex flex-col items-center text-center">
            <Avatar name={employee.name} index={0} size={64} radius="20px" />
            <h2 className="text-[16px] font-semibold text-text-primary mt-3">{employee.name}</h2>
            <p className="text-[12px] text-text-tertiary mt-1">
              {employee.shiftName || 'No shift assigned'}
            </p>
            {employee.phone && (
              <p className="text-[12px] text-text-secondary mt-1">{employee.phone}</p>
            )}
            <div className="mt-3">
              <StatusBadge
                label={employee.active ? t('employee.active') : t('employee.inactive')}
                variant={employee.active ? 'green' : 'gray'}
              />
            </div>
          </div>
        </GlassCard>

        {/* QR Code */}
        <GlassCard hover={false}>
          <GlassCardHeader title={t('employee.qrCode')} />
          <div className="p-6 flex flex-col items-center">
            <QRCodeSVG value={checkinUrl} size={180} />
            <p className="text-[11px] text-text-tertiary mt-3 break-all text-center max-w-[200px]">
              {checkinUrl}
            </p>
          </div>
        </GlassCard>

        {/* Attendance history */}
        <GlassCard hover={false} className="lg:col-span-1">
          <GlassCardHeader title={t('employee.attendanceHistory')} />
          <div className="max-h-[400px] overflow-y-auto">
            {employee.attendance?.length === 0 ? (
              <p className="px-5 py-8 text-center text-[13px] text-text-tertiary">
                No attendance records
              </p>
            ) : (
              employee.attendance?.map((a) => (
                <div
                  key={a.publicId}
                  className="flex items-center justify-between px-5 py-2.5 border-b border-cream-3/50 last:border-0"
                >
                  <div>
                    <div className="text-[12.5px] font-mono tabular-nums text-text-primary">
                      {a.date}
                    </div>
                    <div className="text-[11px] text-text-tertiary">
                      {a.checkInAt || '--:--'} &rarr; {a.checkOutAt || '--:--'}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {a.isLate && <StatusBadge label="Late" variant="amber" />}
                    {a.leftEarly && <StatusBadge label="Early" variant="amber" />}
                    {!a.isLate && !a.leftEarly && <StatusBadge label="On time" variant="green" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
