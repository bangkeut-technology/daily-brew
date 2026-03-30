import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Copy, Pencil, X, Check, Link2, Mail, Unlink, Info } from 'lucide-react';
import { useState } from 'react';
import { useEmployee, useUpdateEmployee } from '@/hooks/queries/useEmployees';
import { useShifts } from '@/hooks/queries/useShifts';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { Avatar } from '@/components/shared/Avatar';
import { CustomSelect } from '@/components/shared/CustomSelect';
import { Toggle } from '@/components/shared/Toggle';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';

const editEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().optional(),
  dob: z.string().optional(),
  joinedAt: z.string().optional(),
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
  const [linkUserId, setLinkUserId] = useState('');
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditEmployeeForm>({
    resolver: zodResolver(editEmployeeSchema),
    values: employee
      ? {
          firstName: employee.firstName,
          lastName: employee.lastName,
          phoneNumber: employee.phoneNumber || '',
          dob: employee.dob || '',
          joinedAt: employee.joinedAt || '',
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

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    reset();
    setIsEditing(false);
  };

  const handleLinkUser = async () => {
    const id = linkUserId.trim();
    if (!id) return;
    try {
      await updateEmployee.mutateAsync({ publicId, linkedUserPublicId: id });
      toast.success(t('employee.userLinked', 'User account linked'));
      setLinkUserId('');
    } catch {
      toast.error(t('employee.userLinkError', 'Failed to link user. Check the ID and try again.'));
    }
  };

  const handleUnlinkUser = async () => {
    try {
      await updateEmployee.mutateAsync({ publicId, linkedUserPublicId: null });
      toast.success(t('employee.userUnlinked', 'User account unlinked'));
    } catch {
      toast.error(t('employee.userUnlinkError', 'Failed to unlink user'));
    }
  };

  const onSubmit = async (values: EditEmployeeForm) => {
    try {
      await updateEmployee.mutateAsync({
        publicId: employee.publicId,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber || undefined,
        dob: values.dob || null,
        joinedAt: values.joinedAt || null,
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
                <label htmlFor="edit-firstName" className="block text-[12px] font-medium text-text-secondary mb-1.5">
                  {t('employee.firstName', 'First name')} *
                </label>
                <input id="edit-firstName" type="text" {...register('firstName')} className={inputClassName} />
                {errors.firstName && (
                  <p className="text-[11px] text-status-red mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="edit-lastName" className="block text-[12px] font-medium text-text-secondary mb-1.5">
                  {t('employee.lastName', 'Last name')} *
                </label>
                <input id="edit-lastName" type="text" {...register('lastName')} className={inputClassName} />
                {errors.lastName && (
                  <p className="text-[11px] text-status-red mt-1">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="edit-phone" className="block text-[12px] font-medium text-text-secondary mb-1.5">
                  {t('employee.phoneNumber', 'Phone number')}
                </label>
                <input id="edit-phone" type="text" {...register('phoneNumber')} className={inputClassName} />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                  {t('employee.dob', 'Date of birth')}
                </label>
                <CustomDatePicker
                  value={watch('dob') || ''}
                  onChange={(v) => setValue('dob', v)}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                  {t('employee.joinedAt', 'Join date')}
                </label>
                <CustomDatePicker
                  value={watch('joinedAt') || ''}
                  onChange={(v) => setValue('joinedAt', v)}
                />
              </div>

              <div>
                <label id="edit-shift-label" className="block text-[12px] font-medium text-text-secondary mb-1.5">
                  {t('employee.shift', 'Shift')}
                </label>
                <CustomSelect
                  value={watch('shiftPublicId') || ''}
                  onChange={(v) => setValue('shiftPublicId', v)}
                  options={[
                    { value: '', label: t('employee.noShift', 'No shift') },
                    ...(shifts?.map((s) => ({
                      value: s.publicId,
                      label: `${s.name} (${s.startTime} - ${s.endTime})`,
                    })) ?? []),
                  ]}
                  placeholder={t('employee.noShift', 'No shift')}
                />
              </div>

              <div className="flex items-center gap-2">
                <Toggle
                  id="active-toggle"
                  checked={watch('active')}
                  onChange={(v) => setValue('active', v)}
                />
                <label htmlFor="active-toggle" className="text-[13px] text-text-secondary cursor-pointer">
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
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar name={fullName} index={0} size={64} radius="20px" />
                <h2 className="text-[16px] font-semibold text-text-primary mt-3">{fullName}</h2>
                <div className="mt-3">
                  <StatusBadge
                    label={employee.active ? t('employee.active') : t('employee.inactive')}
                    variant={employee.active ? 'green' : 'gray'}
                  />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-cream-3/50">
                  <span className="text-[11.5px] text-text-tertiary">{t('employee.shift', 'Shift')}</span>
                  <span className="text-[12.5px] font-medium text-text-primary">
                    {employee.shiftName || t('employee.noShift', 'No shift')}
                  </span>
                </div>
                {employee.phoneNumber && (
                  <div className="flex items-center justify-between py-2 border-b border-cream-3/50">
                    <span className="text-[11.5px] text-text-tertiary">{t('employee.phone', 'Phone')}</span>
                    <span className="text-[12.5px] font-medium text-text-primary font-mono">{employee.phoneNumber}</span>
                  </div>
                )}
                {employee.dob && (
                  <div className="flex items-center justify-between py-2 border-b border-cream-3/50">
                    <span className="text-[11.5px] text-text-tertiary">{t('employee.dob', 'Date of birth')}</span>
                    <span className="text-[12.5px] text-text-secondary">
                      {new Date(employee.dob).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {employee.joinedAt && (
                  <div className="flex items-center justify-between py-2 border-b border-cream-3/50">
                    <span className="text-[11.5px] text-text-tertiary">{t('employee.joinedAt', 'Join date')}</span>
                    <span className="text-[12.5px] text-text-secondary">
                      {new Date(employee.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-cream-3/50">
                  <span className="text-[11.5px] text-text-tertiary">Created</span>
                  <span className="text-[12.5px] text-text-secondary">
                    {new Date(employee.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Linked user info */}
                {employee.linkedUserEmail ? (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-green/8 border border-green/15">
                    <Mail size={13} className="text-green flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] text-green font-medium truncate block">{employee.linkedUserEmail}</span>
                      <span className="text-[10.5px] text-green/70">Can view their own dashboard</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber/8 border border-amber/15">
                    <Info size={13} className="text-amber flex-shrink-0" />
                    <div>
                      <span className="text-[11.5px] text-amber font-medium block">No user account linked</span>
                      <span className="text-[10.5px] text-amber/70">This employee can only check in via QR code</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </GlassCard>

        {/* Link User */}
        <div className="flex flex-col gap-6">
            </div>
          </GlassCard>

          {/* Link user section */}
          <GlassCard hover={false}>
            <GlassCardHeader
              title={t('employee.linkUser', 'Link user account')}
              action={
                employee.linkedUserEmail ? (
                  <StatusBadge label="Linked" variant="green" />
                ) : undefined
              }
            />
            <div className="p-5 space-y-4">
              {employee.linkedUserEmail ? (
                <>
                  <p className="text-[11.5px] text-text-tertiary leading-relaxed">
                    This employee is linked to a user account. They can sign in to DailyBrew and view their own attendance, shifts, and leave requests.
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green/10 flex items-center justify-center flex-shrink-0">
                      <Mail size={16} className="text-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-text-primary truncate">{employee.linkedUserEmail}</p>
                      <p className="text-[11px] text-text-tertiary">User account linked</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUnlinkConfirm(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-red bg-red/8 border-none cursor-pointer transition-colors hover:bg-red/15"
                    >
                      <Unlink size={12} />
                      Unlink
                    </button>
                  </div>

                  <ConfirmModal
                    open={showUnlinkConfirm}
                    onOpenChange={setShowUnlinkConfirm}
                    title={t('employee.unlinkTitle', 'Unlink user account')}
                    description={t('employee.unlinkConfirm', 'Remove the link between this employee and their user account? They will no longer be able to see their own dashboard.')}
                    confirmLabel={t('employee.unlink', 'Unlink')}
                    cancelLabel={t('common.cancel')}
                    variant="danger"
                    loading={updateEmployee.isPending}
                    onConfirm={handleUnlinkUser}
                  />
                </>
              ) : (
                <>
                  <p className="text-[11.5px] text-text-tertiary leading-relaxed">
                    Linking a user account lets this employee sign in and view their own attendance and shifts. Without a linked account, they can only check in via QR code.
                  </p>
                  <div>
                    <p className="text-[12px] font-medium text-text-secondary mb-1.5">
                      {t('employee.linkByPublicId', 'Link by user public ID')}
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        id="link-user-id"
                        name="linkUserId"
                        type="text"
                        value={linkUserId}
                        onChange={(e) => setLinkUserId(e.target.value)}
                        placeholder={t('employee.userPublicIdPlaceholder', 'Enter user public ID')}
                        className="flex-1 px-3 py-2 rounded-lg text-[13px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee font-mono transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleLinkUser}
                        disabled={!linkUserId.trim() || updateEmployee.isPending}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium bg-coffee text-white border-none cursor-pointer transition-colors hover:bg-coffee-light disabled:opacity-50"
                      >
                        <Link2 size={12} />
                        Link
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-cream-3/60 pt-4">
                    <p className="text-[12px] text-text-secondary mb-2">
                      {t(
                        'employee.linkUserDescription',
                        'Or share this employee ID with the staff member. They can use it during onboarding to link their account.',
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
                </>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Attendance history */}
        <GlassCard hover={false} className="lg:col-span-1">
          <GlassCardHeader
            title={t('employee.attendanceHistory', 'Attendance history')}
            action={
              employee.attendance && employee.attendance.length > 0 ? (
                <span className="text-[11px] text-text-tertiary">
                  Last {Math.min(employee.attendance.length, 30)} days
                </span>
              ) : undefined
            }
          />
          <div className="max-h-[400px] overflow-y-auto">
            {!employee.attendance || employee.attendance.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-[13px] text-text-tertiary">
                  {t('employee.noAttendance', 'No attendance records')}
                </p>
                <p className="text-[11px] text-text-tertiary mt-1">
                  Records will appear here after the first check-in via QR code.
                </p>
              </div>
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
