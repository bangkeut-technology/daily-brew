import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Link2, AtSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateEmployee } from '@/hooks/queries/useEmployees';
import { useShifts, useCreateShift } from '@/hooks/queries/useShifts';
import { usePlan } from '@/hooks/queries/usePlan';
import { useRoleContext } from '@/hooks/queries/useRoleContext';
import { getWorkspacePublicId } from '@/lib/auth';
import { isValidPublicIdFormat } from '@/lib/publicId';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { CustomSelect } from '@/components/shared/CustomSelect';
import { CustomTimePicker } from '@/components/shared/CustomTimePicker';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';

const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().optional(),
  username: z.string().optional(),
  dob: z.string().optional(),
  joinedAt: z.string().optional(),
  shiftPublicId: z.string().optional(),
  linkedUserPublicId: z.string()
    .optional()
    .refine(
      (v) => v === undefined || v.trim() === '' || isValidPublicIdFormat(v.trim()),
      { message: 'Public ID must be 12 chars using a–z (no i, l, o) and 2–9.' },
    ),
  attendanceTracking: z.enum(['full', 'none']),
  role: z.enum(['employee', 'manager']),
});

/** Visual divider with a small label between form sections. */
function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-[11px] uppercase tracking-[1.5px] font-semibold text-text-tertiary">
        {children}
      </span>
      <div className="flex-1 h-px bg-cream-3/60" />
    </div>
  );
}

type CreateEmployeeForm = z.infer<typeof createEmployeeSchema>;

export const Route = createFileRoute('/console/employees/new')({
  component: NewEmployeePage,
});

function NewEmployeePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const workspaceId = getWorkspacePublicId() || '';
  const createEmployee = useCreateEmployee(workspaceId);
  const createShift = useCreateShift(workspaceId);
  const { data: shifts } = useShifts(workspaceId);
  const { data: plan } = usePlan(workspaceId);
  const { data: roleContext } = useRoleContext();
  const isOwner = roleContext?.isOwner ?? false;
  // Role picker is only meaningful when the caller can actually create a manager:
  // owner + plan supports managers. Otherwise we silently default to 'employee'.
  const canChooseRole = isOwner && (plan?.canUseManagers ?? false);

  const [showShiftForm, setShowShiftForm] = useState(false);
  const [newShiftName, setNewShiftName] = useState('');
  const [newStartTime, setNewStartTime] = useState('08:00');
  const [newEndTime, setNewEndTime] = useState('17:00');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CreateEmployeeForm>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      username: '',
      dob: '',
      joinedAt: '',
      shiftPublicId: '',
      linkedUserPublicId: '',
      attendanceTracking: 'full',
      role: 'employee',
    },
  });

  const onSubmit = async (values: CreateEmployeeForm) => {
    try {
      await createEmployee.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber || undefined,
        username: values.username || undefined,
        dob: values.dob || undefined,
        joinedAt: values.joinedAt || undefined,
        shiftPublicId: values.shiftPublicId || undefined,
        linkedUserPublicId: values.linkedUserPublicId || undefined,
        attendanceTracking: values.attendanceTracking,
        // Only send role when the picker is actually shown — backend defaults to employee.
        ...(canChooseRole ? { role: values.role } : {}),
      });
      toast.success(t('employee.createSuccess', 'Employee created'));
      navigate({ to: '/console/employees' });
    } catch {
      toast.error(t('employee.createError', 'Failed to create employee'));
    }
  };

  const inputClassName =
    'w-full px-3 py-2 rounded-lg text-[15.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee transition-colors';

  return (
    <div className="page-enter">
      <PageHeader title={t('employee.add')} />

      <GlassCard hover={false}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* ── Identity ─────────────────────────────────────────── */}
          <SectionHeader>{t('employee.sectionIdentity', 'Identity')}</SectionHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="emp-firstName" className="block text-[14px] font-medium text-text-secondary mb-1.5">
                {t('employee.firstName', 'First name')} *
              </label>
              <input id="emp-firstName" type="text" {...register('firstName')} className={inputClassName} />
              {errors.firstName && (
                <p className="text-[13px] text-status-red mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="emp-lastName" className="block text-[14px] font-medium text-text-secondary mb-1.5">
                {t('employee.lastName', 'Last name')} *
              </label>
              <input id="emp-lastName" type="text" {...register('lastName')} className={inputClassName} />
              {errors.lastName && (
                <p className="text-[13px] text-status-red mt-1">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="emp-phone" className="block text-[14px] font-medium text-text-secondary mb-1.5">
                {t('employee.phoneNumber', 'Phone number')}
              </label>
              <input id="emp-phone" type="text" {...register('phoneNumber')} className={inputClassName} />
            </div>

            {/* Username — Espresso only, for BasilBook linking. Takes the partner cell when shown. */}
            <div>
              <label htmlFor="emp-username" className="flex items-center gap-1.5 text-[14px] font-medium text-text-secondary mb-1.5">
                <AtSign size={12} />
                Username
                {!plan?.isEspresso && (
                  <span className="text-[12px] font-medium px-1.5 py-0.5 rounded-full bg-amber/10 text-amber">
                    Espresso
                  </span>
                )}
              </label>
              {plan?.isEspresso ? (
                <>
                  <input
                    id="emp-username"
                    type="text"
                    {...register('username')}
                    placeholder="e.g. vandeth.tho"
                    className={cn(inputClassName, 'font-mono')}
                  />
                  <p className="text-[12.5px] text-text-tertiary mt-1">
                    Unique identifier for BasilBook staff records.
                  </p>
                </>
              ) : (
                <p className="text-[13px] text-text-tertiary">
                  Upgrade to Espresso to link employees with BasilBook.
                </p>
              )}
            </div>

            <div>
              <label className="block text-[14px] font-medium text-text-secondary mb-1.5">
                {t('employee.dob', 'Date of birth')}
              </label>
              <CustomDatePicker value={watch('dob') || ''} onChange={(v) => setValue('dob', v)} />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-text-secondary mb-1.5">
                {t('employee.joinedAt', 'Join date')}
              </label>
              <CustomDatePicker value={watch('joinedAt') || ''} onChange={(v) => setValue('joinedAt', v)} />
            </div>
          </div>

          {/* ── Role & schedule ──────────────────────────────────── */}
          <SectionHeader>{t('employee.sectionRoleSchedule', 'Role & schedule')}</SectionHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {canChooseRole && (
              <div>
                <label className="block text-[14px] font-medium text-text-secondary mb-1.5">
                  {t('employee.role', 'Role')}
                </label>
                <CustomSelect
                  value={watch('role')}
                  onChange={(v) => setValue('role', v as 'employee' | 'manager')}
                  options={[
                    { value: 'employee', label: t('employee.roleEmployee', 'Employee') },
                    { value: 'manager', label: t('employee.roleManager', 'Manager') },
                  ]}
                  placeholder=""
                />
                {watch('role') === 'manager' && (
                  <p className="text-[12.5px] text-amber mt-1">
                    {t(
                      'employee.roleManagerHint',
                      'Managers need a linked user account. Set the User public ID below before saving.',
                    )}
                  </p>
                )}
              </div>
            )}

            <div className={cn(!canChooseRole && 'md:col-span-2')}>
              <label id="emp-shift-label" className="block text-[14px] font-medium text-text-secondary mb-1.5">
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

              {!showShiftForm ? (
                <button
                  type="button"
                  onClick={() => setShowShiftForm(true)}
                  className={cn(
                    'mt-2 flex items-center gap-1 text-[14px] font-medium bg-transparent border-none cursor-pointer transition-colors p-0',
                    !shifts?.length ? 'text-amber' : 'text-coffee hover:text-coffee-light',
                  )}
                >
                  <Plus size={13} />
                  {t('employee.createShift', 'Create a shift')}
                </button>
              ) : (
                <div className="mt-2.5 rounded-lg border border-cream-3 bg-cream-3/20 p-3 space-y-2.5">
                  <input
                    id="inline-shift-name"
                    name="inlineShiftName"
                    type="text"
                    value={newShiftName}
                    onChange={(e) => setNewShiftName(e.target.value)}
                    placeholder={t('shift.name', 'Shift name (e.g. Morning)')}
                    className={inputClassName}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label id="inline-shift-start-label" className="block text-[13px] text-text-tertiary mb-1">
                        {t('shift.startTime', 'Start')}
                      </label>
                      <CustomTimePicker value={newStartTime} onChange={setNewStartTime} />
                    </div>
                    <div>
                      <label id="inline-shift-end-label" className="block text-[13px] text-text-tertiary mb-1">
                        {t('shift.endTime', 'End')}
                      </label>
                      <CustomTimePicker value={newEndTime} onChange={setNewEndTime} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={createShift.isPending || !newShiftName.trim()}
                      onClick={async () => {
                        try {
                          const shift = await createShift.mutateAsync({
                            name: newShiftName.trim(),
                            startTime: newStartTime,
                            endTime: newEndTime,
                          });
                          setValue('shiftPublicId', shift.publicId);
                          toast.success(t('shift.createSuccess', 'Shift created'));
                          setShowShiftForm(false);
                          setNewShiftName('');
                        } catch {
                          toast.error(t('shift.createError', 'Failed to create shift'));
                        }
                      }}
                      className="px-3 py-1.5 rounded-md text-[14px] font-medium bg-coffee text-white border-none cursor-pointer transition-all hover:bg-coffee-light disabled:opacity-50"
                    >
                      {createShift.isPending ? t('common.loading') : t('common.create')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowShiftForm(false)}
                      className="text-[14px] text-text-tertiary hover:text-text-secondary bg-transparent border-none cursor-pointer transition-colors"
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label id="emp-tracking-label" className="block text-[14px] font-medium text-text-secondary mb-1.5">
              {t('employee.attendanceTracking', 'Attendance tracking')}
            </label>
            <CustomSelect
              value={watch('attendanceTracking') ?? 'full'}
              onChange={(v) => setValue('attendanceTracking', v as 'full' | 'none')}
              options={[
                { value: 'full', label: t('employee.attendanceTrackingFull', 'Tracked (default)') },
                { value: 'none', label: t('employee.attendanceTrackingNone', 'Excluded — never counted as absent') },
              ]}
              placeholder=""
            />
            <p className="text-[12.5px] text-text-tertiary mt-1">
              {t(
                'employee.attendanceTrackingHint',
                'Set "Excluded" for staff who help run the workspace but don\'t follow a shift (e.g. admin helpers). They can still check in to log times — they just won\'t be counted as absent.',
              )}
            </p>
          </div>

          {/* ── Linking ─────────────────────────────────────────── */}
          <SectionHeader>{t('employee.sectionLinking', 'Link user account')}</SectionHeader>

          <div>
            <label htmlFor="emp-linkedUser" className="flex items-center gap-1.5 text-[14px] font-medium text-text-secondary mb-1.5">
              <Link2 size={12} />
              {t('employee.userPublicId', 'User public ID')}
            </label>
            <input
              id="emp-linkedUser"
              type="text"
              {...register('linkedUserPublicId', {
                onBlur: () => trigger('linkedUserPublicId'),
              })}
              placeholder={t('employee.userPublicIdPlaceholder', 'Optional — link to a user account')}
              className={cn(
                inputClassName,
                'font-mono',
                errors.linkedUserPublicId && 'border-status-red focus:border-status-red',
              )}
            />
            {errors.linkedUserPublicId && (
              <p className="text-[13px] text-status-red mt-1">{errors.linkedUserPublicId.message}</p>
            )}
            <p className="text-[12.5px] text-text-tertiary mt-1">
              {t('employee.userPublicIdHint', 'The employee can find their public ID on their profile page.')}
            </p>
          </div>

          <div className="flex gap-3 pt-3 border-t border-cream-3/60">
            <button
              type="submit"
              disabled={createEmployee.isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[15px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light disabled:opacity-50"
            >
              {createEmployee.isPending ? t('common.loading') : t('common.create')}
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: '/console/employees' })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[15px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 cursor-pointer transition-all duration-150 hover:bg-cream-3"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
