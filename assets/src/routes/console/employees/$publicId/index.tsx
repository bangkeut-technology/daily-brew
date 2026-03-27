import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Copy, Pencil, X, Check, Link2 } from 'lucide-react';
import { useState } from 'react';
import { useEmployee, useUpdateEmployee } from '@/hooks/queries/useEmployees';
import { useShifts } from '@/hooks/queries/useShifts';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { Avatar } from '@/components/shared/Avatar';
import { StatusBadge } from '@/components/shared/StatusBadge';

const editEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().optional(),
  shiftPublicId: z.string().optional(),
  active: z.boolean(),
});

type EditEmployeeForm = z.infer<typeof editEmployeeSchema>;

export const Route = createFileRoute('/console/employees/$publicId/')({
  component: EmployeeDetailPage,
});

function EmployeeDetailPage() {
  const { t } = useTranslation();
  const { publicId } = Route.useParams();
  const workspaceId = getWorkspacePublicId() || '';
  const { data: employee, isLoading } = useEmployee(workspaceId, publicId);
  const { data: shifts } = useShifts(workspaceId);
  const updateEmployee = useUpdateEmployee(workspaceId);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditEmployeeForm>({
    resolver: zodResolver(editEmployeeSchema),
    values: employee
      ? {
          firstName: employee.firstName,
          lastName: employee.lastName,
          phoneNumber: employee.phoneNumber || '',
          shiftPublicId: employee.shiftPublicId || '',
          active: employee.active,
        }
      : undefined,
  });

  if (isLoading || !employee) {
    return (
      <div className="page-enter">
        <p className="text-text-tertiary">{t('common.loading')}</p>
      </div>
    );
  }

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const checkinUrl = `${window.location.origin}/checkin/${employee.publicId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(checkinUrl);
      toast.success(t('common.copied', 'Link copied to clipboard'));
    } catch {
      toast.error(t('common.copyFailed', 'Failed to copy link'));
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    reset();
    setIsEditing(false);
  };

  const onSubmit = async (values: EditEmployeeForm) => {
    try {
      await updateEmployee.mutateAsync({
        publicId: employee.publicId,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber || undefined,
        shiftPublicId: values.shiftPublicId || null,
        active: values.active,
      });
      toast.success(t('employee.updateSuccess', 'Employee updated'));
      setIsEditing(false);
    } catch {
      toast.error(t('employee.updateError', 'Failed to update employee'));
    }
  };

  const inputClassName =
    'w-full px-3 py-2 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee transition-colors';

  return (
    <div className="page-enter">
      <PageHeader
        title={fullName}
        action={
          !isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)]"
            >
              <Pencil size={14} />
              {t('common.edit', 'Edit')}
            </button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info card */}
        <GlassCard hover={false}>
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                  {t('employee.firstName', 'First name')} *
                </label>
                <input type="text" {...register('firstName')} className={inputClassName} />
                {errors.firstName && (
                  <p className="text-[11px] text-status-red mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                  {t('employee.lastName', 'Last name')} *
                </label>
                <input type="text" {...register('lastName')} className={inputClassName} />
                {errors.lastName && (
                  <p className="text-[11px] text-status-red mt-1">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                  {t('employee.phoneNumber', 'Phone number')}
                </label>
                <input type="text" {...register('phoneNumber')} className={inputClassName} />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                  {t('employee.shift', 'Shift')}
                </label>
                <select {...register('shiftPublicId')} className={inputClassName}>
                  <option value="">{t('employee.noShift', 'No shift')}</option>
                  {shifts?.map((s) => (
                    <option key={s.publicId} value={s.publicId}>
                      {s.name} ({s.startTime} - {s.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active-toggle"
                  {...register('active')}
                  className="accent-coffee w-4 h-4"
                />
                <label htmlFor="active-toggle" className="text-[13px] text-text-secondary">
                  {t('employee.active', 'Active')}
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={updateEmployee.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light disabled:opacity-50"
                >
                  <Check size={14} />
                  {updateEmployee.isPending ? t('common.loading') : t('common.save', 'Save')}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 cursor-pointer transition-all duration-150 hover:bg-cream-3"
                >
                  <X size={14} />
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 flex flex-col items-center text-center">
              <Avatar name={fullName} index={0} size={64} radius="20px" />
              <h2 className="text-[16px] font-semibold text-text-primary mt-3">{fullName}</h2>
              <p className="text-[12px] text-text-tertiary mt-1">
                {employee.shiftName || t('employee.noShift', 'No shift assigned')}
              </p>
              {employee.phoneNumber && (
                <p className="text-[12px] text-text-secondary mt-1">{employee.phoneNumber}</p>
              )}
              <div className="mt-3">
                <StatusBadge
                  label={employee.active ? t('employee.active') : t('employee.inactive')}
                  variant={employee.active ? 'green' : 'gray'}
                />
              </div>

              {/* Linked user info */}
              {employee.linkedUserEmail && (
                <div className="mt-4 flex items-center gap-1.5 text-[12px] text-text-secondary">
                  <Link2 size={12} className="text-text-tertiary" />
                  {employee.linkedUserEmail}
                </div>
              )}
            </div>
          )}
        </GlassCard>

        {/* QR Code + Link User */}
        <div className="flex flex-col gap-6">
          <GlassCard hover={false}>
            <GlassCardHeader title={t('employee.qrCode', 'QR Code')} />
            <div className="p-6 flex flex-col items-center">
              <QRCodeSVG value={checkinUrl} size={180} />
              <p className="text-[11px] text-text-tertiary mt-3 break-all text-center max-w-[200px]">
                {checkinUrl}
              </p>
              <button
                type="button"
                onClick={handleCopyLink}
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 cursor-pointer transition-all duration-150 hover:bg-cream-3"
              >
                <Copy size={12} />
                {t('common.copyLink', 'Copy link')}
              </button>
            </div>
          </GlassCard>

          {/* Link user section */}
          {!employee.linkedUserPublicId && (
            <GlassCard hover={false}>
              <GlassCardHeader title={t('employee.linkUser', 'Link user account')} />
              <div className="p-5">
                <p className="text-[12px] text-text-secondary mb-3">
                  {t(
                    'employee.linkUserDescription',
                    'Share this employee ID with the staff member. They can use it during onboarding to link their account.',
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 rounded-lg text-[13px] bg-cream-2 border border-cream-3 text-text-primary font-mono select-all">
                    {employee.publicId}
                  </code>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(employee.publicId);
                        toast.success(t('common.copied', 'Copied to clipboard'));
                      } catch {
                        toast.error(t('common.copyFailed', 'Failed to copy'));
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-[12px] bg-glass-bg border border-cream-3 text-text-secondary cursor-pointer transition-colors hover:bg-cream-3"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Attendance history */}
        <GlassCard hover={false} className="lg:col-span-1">
          <GlassCardHeader title={t('employee.attendanceHistory', 'Attendance history')} />
          <div className="max-h-[400px] overflow-y-auto">
            {!employee.attendance || employee.attendance.length === 0 ? (
              <p className="px-5 py-8 text-center text-[13px] text-text-tertiary">
                {t('employee.noAttendance', 'No attendance records')}
              </p>
            ) : (
              employee.attendance.slice(0, 30).map((a) => (
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
                    {a.isLate && (
                      <StatusBadge label={t('attendance.late', 'Late')} variant="amber" />
                    )}
                    {a.leftEarly && (
                      <StatusBadge label={t('attendance.early', 'Early')} variant="amber" />
                    )}
                    {!a.isLate && !a.leftEarly && (
                      <StatusBadge label={t('attendance.onTime', 'On time')} variant="green" />
                    )}
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
