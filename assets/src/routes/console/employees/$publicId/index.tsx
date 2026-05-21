import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Copy, Pencil, X, Check, Link2, Mail, Unlink, Info, AtSign, ShieldCheck, ShieldOff, UserPlus, QrCode, Clock, Globe, MapPin, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useMemo } from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  useEmployee,
  useEmployees,
  useUpdateEmployee,
  useUpdateManagerPermissions,
} from '@/hooks/queries/useEmployees';
import type { ManagerPermission, Shift } from '@/types';
import { MANAGER_PERMISSIONS } from '@/types';
import { useShifts } from '@/hooks/queries/useShifts';
import { usePlan } from '@/hooks/queries/usePlan';
import { useRoleContext } from '@/hooks/queries/useRoleContext';
import { getWorkspacePublicId } from '@/lib/auth';
import { publicIdFormatError } from '@/lib/publicId';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { Avatar } from '@/components/shared/Avatar';
import { CustomSelect } from '@/components/shared/CustomSelect';
import { Toggle } from '@/components/shared/Toggle';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { AttendanceEditModal } from '@/components/shared/AttendanceEditModal';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import { JobTitleInput } from '@/components/shared/JobTitleInput';
import { useDateFormat } from '@/hooks/useDateFormat';
import { useWorkspaceTimezone } from '@/hooks/useWorkspaceTimezone';

const editEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  jobTitle: z.string().optional(),
  phoneNumber: z.string().optional(),
  username: z.string().optional(),
  dob: z.string().optional(),
  joinedAt: z.string().optional(),
  leftAt: z.string().optional(),
  shiftPublicId: z.string().optional(),
  active: z.boolean(),
  attendanceTracking: z.enum(['full', 'none']),
  role: z.enum(['employee', 'manager']),
});

/** Visual divider with a small label between form sections. */
function SectionHeader({ children }: { children: import('react').ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-[11px] uppercase tracking-[1.5px] font-semibold text-text-tertiary">
        {children}
      </span>
      <div className="flex-1 h-px bg-cream-3/60" />
    </div>
  );
}

function OwnerNextStep({
  icon,
  title,
  children,
  onClick,
}: {
  icon: import('react').ReactNode;
  title: string;
  children: import('react').ReactNode;
  onClick?: () => void;
}) {
  const interactive = typeof onClick === 'function';
  const inner = (
    <>
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-coffee/10 text-coffee">
        {icon}
      </div>
      <div>
        <p className="text-[14px] font-semibold text-text-primary">{title}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-text-tertiary">{children}</p>
      </div>
    </>
  );
  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full gap-3 rounded-xl border border-cream-3/70 bg-glass-bg/70 p-4 text-left transition-colors hover:border-coffee/30 hover:bg-glass-bg cursor-pointer"
      >
        {inner}
      </button>
    );
  }
  return (
    <div className="flex gap-3 rounded-xl border border-cream-3/70 bg-glass-bg/70 p-4">
      {inner}
    </div>
  );
}

/** Smooth-scroll to an element by id and add a brief highlight pulse. */
function focusSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  el.classList.add('ring-2', 'ring-coffee/40', 'ring-offset-2', 'ring-offset-cream-1', 'rounded-2xl');
  window.setTimeout(() => {
    el.classList.remove('ring-2', 'ring-coffee/40', 'ring-offset-2', 'ring-offset-cream-1', 'rounded-2xl');
  }, 1800);
}

type EditEmployeeForm = z.infer<typeof editEmployeeSchema>;

export const Route = createFileRoute('/console/employees/$publicId/')({
  validateSearch: (search: Record<string, unknown>): { created?: boolean } => {
    const created = search.created === true || search.created === 'true' || search.created === '1';
    return created ? { created } : {};
  },
  component: EmployeeDetailPage,
});

function EmployeeDetailPage() {
  const { t } = useTranslation();
  const { publicId } = Route.useParams();
  const { created } = Route.useSearch();
  const workspaceId = getWorkspacePublicId() || '';
  const { data: employee, isLoading } = useEmployee(workspaceId, publicId);
  const fmtDate = useDateFormat();
  const { data: shifts } = useShifts(workspaceId);
  const { data: plan } = usePlan(workspaceId);
  const { data: workspaceEmployees } = useEmployees(workspaceId);
  const workspaceJobTitles = (workspaceEmployees ?? [])
    .filter((e) => e.publicId !== publicId)
    .map((e) => e.jobTitle)
    .filter((v): v is string => !!v);
  const updateEmployee = useUpdateEmployee(workspaceId);
  const updatePermissions = useUpdateManagerPermissions(workspaceId);
  const { data: roleContext } = useRoleContext();
  // Promote/demote and edit-manager-permissions are owner-only on the backend
  // (see WorkspaceVoter) — hide those affordances for managers so they don't
  // click buttons that 403.
  const isOwner = roleContext?.isOwner ?? false;
  const canEditAttendance = isOwner
    || (roleContext?.managerPermissions ?? []).includes('manage_attendance');
  const [editAttendance, setEditAttendance] = useState<{
    publicId: string;
    employeeName?: string | null;
    date: string;
    checkInAt: string | null;
    checkOutAt: string | null;
    originalCheckInAt?: string | null;
    originalCheckOutAt?: string | null;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [linkUserId, setLinkUserId] = useState('');
  const [linkUserIdError, setLinkUserIdError] = useState<string | null>(null);
  const [showCreatedGuide, setShowCreatedGuide] = useState(created);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const wsTz = useWorkspaceTimezone();
  // Deactivation requires picking the last day worked so history stays accurate
  // even when the owner deactivates an employee days/weeks after they actually
  // left. Toggling Active off opens this modal; confirm flips the form's
  // `active` to false and stamps `leftAt`. Cancel reverts.
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateDate, setDeactivateDate] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<EditEmployeeForm>({
    resolver: zodResolver(editEmployeeSchema),
    values: employee
      ? {
          firstName: employee.firstName,
          lastName: employee.lastName,
          jobTitle: employee.jobTitle || '',
          phoneNumber: employee.phoneNumber || '',
          username: employee.username || '',
          dob: employee.dob || '',
          joinedAt: employee.joinedAt || '',
          leftAt: employee.leftAt || '',
          shiftPublicId: employee.shiftPublicId || '',
          active: employee.active,
          attendanceTracking: employee.attendanceTracking,
          role: employee.role,
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
    const formatError = publicIdFormatError(id);
    if (formatError !== null) {
      setLinkUserIdError(formatError);
      return;
    }
    try {
      await updateEmployee.mutateAsync({ publicId, linkedUserPublicId: id });
      toast.success(t('employee.userLinked', 'User account linked'));
      setLinkUserId('');
      setLinkUserIdError(null);
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
        jobTitle: values.jobTitle || null,
        phoneNumber: values.phoneNumber || undefined,
        username: values.username || null,
        dob: values.dob || null,
        joinedAt: values.joinedAt || null,
        // leftAt is only meaningful when the employee is inactive; clearing on
        // re-activation is handled server-side too, but we send null here for
        // clarity.
        leftAt: values.active ? null : values.leftAt || null,
        shiftPublicId: values.shiftPublicId || null,
        active: values.active,
        attendanceTracking: values.attendanceTracking,
        // Only send role when the picker is actually rendered (see Role & schedule
        // section): owner + plan supports managers + employee has a linked user.
        // The backend rejects role changes from anyone else.
        ...(isOwner && plan?.canUseManagers && employee.linkedUserPublicId
          ? { role: values.role }
          : {}),
      });
      toast.success(t('employee.updateSuccess', 'Employee updated'));
      setIsEditing(false);
    } catch {
      toast.error(t('employee.updateError', 'Failed to update employee'));
    }
  };

  const inputClassName =
    'w-full px-3 py-2 rounded-lg text-[15.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee transition-colors';

  return (
    <div className="page-enter">
      <Link
        to="/console/employees"
        className="inline-flex items-center gap-1.5 text-[13.5px] text-text-secondary hover:text-coffee mb-3 no-underline"
      >
        <ArrowLeft size={14} />
        {t('employee.backToList', 'Back to employees')}
      </Link>

      <PageHeader
        title={fullName}
        action={
          !isEditing ? (
            <div className="flex items-center gap-2">
              {/* Promote / demote is owner-only — managers see a manager-permissions card below
                  but cannot create or remove other managers. */}
              {isOwner && plan?.canUseManagers && employee.linkedUserPublicId && (
                <button
                  type="button"
                  disabled={updateEmployee.isPending}
                  onClick={() => {
                    const newRole = employee.role === 'manager' ? 'employee' : 'manager';
                    updateEmployee.mutate(
                      { publicId: employee.publicId, role: newRole },
                      {
                        onSuccess: () => toast.success(newRole === 'manager' ? 'Promoted to manager' : 'Demoted to employee'),
                        onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update role'),
                      },
                    );
                  }}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-[14px] font-medium border-none cursor-pointer transition-all duration-150 disabled:opacity-50',
                    employee.role === 'manager'
                      ? 'bg-red/10 text-red hover:bg-red/18'
                      : 'bg-amber/10 text-amber hover:bg-amber/18',
                  )}
                >
                  {employee.role === 'manager' ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                  {employee.role === 'manager' ? 'Demote' : 'Promote to manager'}
                </button>
              )}
              <button
                type="button"
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[15px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)]"
              >
                <Pencil size={14} />
                {t('common.edit', 'Edit')}
              </button>
            </div>
          ) : undefined
        }
      />

      {showCreatedGuide && !isEditing && (
        <GlassCard hover={false} className="mb-6 border-coffee/20 bg-coffee/5">
          <div className="p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[1.5px] text-coffee">
                  {t('employee.createdGuideEyebrow', 'Employee created')}
                </p>
                <h2 className="mt-1 text-[20px] font-semibold text-text-primary">
                  {t('employee.createdGuideTitle', 'Next, help this employee check in')}
                </h2>
                <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
                  {t(
                    'employee.createdGuideDescription',
                    'Finish the setup by linking their user account and sharing the check-in instructions before their first shift.',
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreatedGuide(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cream-3 bg-glass-bg text-text-tertiary transition-colors hover:bg-cream-3 hover:text-text-primary"
                aria-label={t('common.close', 'Close')}
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <OwnerNextStep
                icon={<Link2 size={16} />}
                title={t('employee.createdGuideLinkTitle', 'Link their account')}
                onClick={() => focusSection('employee-linking')}
              >
                {t(
                  'employee.createdGuideLinkDesc',
                  'Ask the employee to sign in and send their user public ID, or share this employee ID so they can link during onboarding.',
                )}
              </OwnerNextStep>
              <OwnerNextStep
                icon={<QrCode size={16} />}
                title={t('employee.createdGuideShareTitle', 'Share the employee ID or QR')}
                onClick={() => focusSection('employee-qr')}
              >
                {t(
                  'employee.createdGuideShareDesc',
                  'The QR code and employee ID below are what staff use to connect their account to this profile.',
                )}
              </OwnerNextStep>
              <OwnerNextStep
                icon={<Clock size={16} />}
                title={t('employee.createdGuideShiftTitle', 'Confirm the shift')}
                onClick={() => focusSection('employee-shift')}
              >
                {employee.shiftName
                  ? t('employee.createdGuideShiftAssigned', '{{name}} is assigned to {{shift}}.', {
                      name: fullName,
                      shift: employee.shiftName,
                    })
                  : t(
                      'employee.createdGuideShiftMissing',
                      'No shift is assigned yet. Add one so late, absent, and early-leave status can be calculated.',
                    )}
              </OwnerNextStep>
            </div>

            <div className="mt-5 rounded-xl border border-amber/20 bg-amber/8 p-4">
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber/15 text-amber">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-text-primary">
                    {t('employee.createdGuideAdvancedTitle', 'Turn on advanced check-in protection')}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-text-tertiary">
                    {t(
                      'employee.createdGuideAdvancedDesc',
                      'After staff profiles are ready, tighten check-in rules so attendance is recorded from the right place, network, and device.',
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <Link
                  to="/console/settings"
                  hash="settings-ip-restriction"
                  className="flex items-start gap-2 rounded-lg border border-cream-3/70 bg-glass-bg px-3 py-2.5 text-left no-underline transition-colors hover:bg-cream-3/60"
                >
                  <Globe size={15} className="mt-0.5 shrink-0 text-amber" />
                  <span>
                    <span className="block text-[13.5px] font-semibold text-text-primary">
                      {t('employee.createdGuideIpTitle', 'IP restriction')}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-relaxed text-text-tertiary">
                      {t('employee.createdGuideIpDesc', 'Only allow check-ins from your restaurant Wi-Fi or approved network.')}
                    </span>
                  </span>
                </Link>
                <Link
                  to="/console/settings"
                  hash="settings-geofencing"
                  className="flex items-start gap-2 rounded-lg border border-cream-3/70 bg-glass-bg px-3 py-2.5 text-left no-underline transition-colors hover:bg-cream-3/60"
                >
                  <MapPin size={15} className="mt-0.5 shrink-0 text-amber" />
                  <span>
                    <span className="block text-[13.5px] font-semibold text-text-primary">
                      {t('employee.createdGuideGeofencingTitle', 'Geofencing')}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-relaxed text-text-tertiary">
                      {t('employee.createdGuideGeofencingDesc', 'Require staff to be near the restaurant before check-in is accepted.')}
                    </span>
                  </span>
                </Link>
                <Link
                  to="/console/settings"
                  hash="settings-device-verification"
                  className="flex items-start gap-2 rounded-lg border border-cream-3/70 bg-glass-bg px-3 py-2.5 text-left no-underline transition-colors hover:bg-cream-3/60"
                >
                  <Smartphone size={15} className="mt-0.5 shrink-0 text-amber" />
                  <span>
                    <span className="block text-[13.5px] font-semibold text-text-primary">
                      {t('employee.createdGuideDeviceTitle', 'Device verification')}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-relaxed text-text-tertiary">
                      {t('employee.createdGuideDeviceDesc', 'Keep check-in and check-out on the same phone to reduce buddy punching.')}
                    </span>
                  </span>
                </Link>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => document.getElementById('employee-linking')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="inline-flex items-center gap-1.5 rounded-lg bg-coffee px-3 py-2 text-[14px] font-medium text-white transition-colors hover:bg-coffee-light"
              >
                <Link2 size={13} />
                {t('employee.createdGuideLinkAction', 'Go to linking')}
              </button>
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[14px] font-medium text-text-primary transition-colors hover:bg-cream-3"
              >
                <Copy size={13} />
                {t('employee.createdGuideCopyAction', 'Copy employee ID')}
              </button>
              <Link
                to="/console/employees/new"
                className="inline-flex items-center gap-1.5 rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[14px] font-medium text-text-primary no-underline transition-colors hover:bg-cream-3"
              >
                <UserPlus size={13} />
                {t('employee.createdGuideAddAnother', 'Add another employee')}
              </Link>
              <a
                href="/guides/owner"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[14px] font-medium text-coffee no-underline transition-colors hover:bg-coffee/8"
              >
                <Info size={13} />
                {t('employee.createdGuideReadFullGuide', 'Read the full owner setup guide')}
              </a>
            </div>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info card — full width */}
        <GlassCard hover={false} className="lg:col-span-2">
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              {/* ── Identity ─────────────────────────────────────────── */}
              <SectionHeader>{t('employee.sectionIdentity', 'Identity')}</SectionHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-firstName" className="block text-[14px] font-medium text-text-secondary mb-1.5">
                    {t('employee.firstName', 'First name')} *
                  </label>
                  <input id="edit-firstName" type="text" {...register('firstName')} className={inputClassName} />
                  {errors.firstName && (
                    <p className="text-[13px] text-status-red mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="edit-lastName" className="block text-[14px] font-medium text-text-secondary mb-1.5">
                    {t('employee.lastName', 'Last name')} *
                  </label>
                  <input id="edit-lastName" type="text" {...register('lastName')} className={inputClassName} />
                  {errors.lastName && (
                    <p className="text-[13px] text-status-red mt-1">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="edit-jobTitle" className="block text-[14px] font-medium text-text-secondary mb-1.5">
                    {t('employee.jobTitle', 'Job title')}
                  </label>
                  <JobTitleInput
                    id="edit-jobTitle"
                    value={watch('jobTitle') || ''}
                    onChange={(v) => setValue('jobTitle', v, { shouldDirty: true })}
                    placeholder={t('employee.jobTitlePlaceholder', 'e.g. Cashier, Cook, Waiter')}
                    workspaceValues={workspaceJobTitles}
                  />
                </div>

                <div>
                  <label htmlFor="edit-phone" className="block text-[14px] font-medium text-text-secondary mb-1.5">
                    {t('employee.phoneNumber', 'Phone number')}
                  </label>
                  <input id="edit-phone" type="text" {...register('phoneNumber')} className={inputClassName} />
                </div>

                {/* Group the two date fields side-by-side so DOB + Join date pair naturally. */}
                <div>
                  <label className="block text-[14px] font-medium text-text-secondary mb-1.5">
                    {t('employee.dob', 'Date of birth')}
                  </label>
                  <CustomDatePicker
                    value={watch('dob') || ''}
                    onChange={(v) => setValue('dob', v)}
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-text-secondary mb-1.5">
                    {t('employee.joinedAt', 'Join date')}
                  </label>
                  <CustomDatePicker
                    value={watch('joinedAt') || ''}
                    onChange={(v) => setValue('joinedAt', v)}
                  />
                </div>
              </div>

              {/* Username gets its own row because the BasilBook hint paragraph is
                  long and would unbalance the grid. */}
              <div>
                <label htmlFor="edit-username" className="flex items-center gap-1.5 text-[14px] font-medium text-text-secondary mb-1.5">
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
                      id="edit-username"
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

              {/* ── Role & schedule ───────────────────────────────────
                  Role picker only renders for owners on a plan that supports
                  managers AND when the employee already has a linked user —
                  promotion requires one anyway, and showing "Manager" as an
                  option that immediately fails validation is confusing. */}
              {isOwner && plan?.canUseManagers && employee.linkedUserPublicId ? (
                <>
                  <SectionHeader>{t('employee.sectionRoleSchedule', 'Role & schedule')}</SectionHeader>
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
                  </div>
                </>
              ) : (
                <SectionHeader>{t('employee.sectionSchedule', 'Schedule')}</SectionHeader>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label id="edit-shift-label" className="block text-[14px] font-medium text-text-secondary mb-1.5">
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

                <div>
                  <label className="block text-[14px] font-medium text-text-secondary mb-1.5">
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
              </div>

              {/* ── Status ─────────────────────────────────────────── */}
              <SectionHeader>{t('employee.sectionStatus', 'Status')}</SectionHeader>

              <div className="flex items-center gap-2">
                <Toggle
                  id="active-toggle"
                  checked={watch('active')}
                  onChange={(v) => {
                    if (!v) {
                      // Opening the deactivation flow — defer flipping `active`
                      // until the date is confirmed.
                      setDeactivateDate(getValues('leftAt') || wsTz.today());
                      setShowDeactivateModal(true);
                    } else {
                      setValue('active', true, { shouldDirty: true });
                      setValue('leftAt', '', { shouldDirty: true });
                    }
                  }}
                />
                <label htmlFor="active-toggle" className="text-[15px] text-text-secondary cursor-pointer">
                  {t('employee.active', 'Active')}
                </label>
                {!watch('active') && watch('leftAt') && (
                  <span className="text-[13px] text-text-tertiary ml-2">
                    {t('employee.lastDayWorked', 'Last day worked')}: {fmtDate(watch('leftAt') || '')}
                  </span>
                )}
              </div>

              <div className="flex gap-3 pt-3 border-t border-cream-3/60">
                <button
                  type="submit"
                  disabled={updateEmployee.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[15px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light disabled:opacity-50"
                >
                  <Check size={14} />
                  {updateEmployee.isPending ? t('common.loading') : t('common.save', 'Save')}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[15px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 cursor-pointer transition-all duration-150 hover:bg-cream-3"
                >
                  <X size={14} />
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6">
              <div className="flex items-start gap-6">
                {/* Left: avatar + name */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <Avatar name={fullName} index={0} size={64} radius="20px" />
                  <div>
                    <h2 className="text-[18px] font-semibold text-text-primary">{fullName}</h2>
                    {employee.jobTitle && (
                      <p className="text-[14px] text-text-secondary mt-0.5">{employee.jobTitle}</p>
                    )}
                    {employee.username && (
                      <p className="text-[13px] text-text-tertiary font-mono mt-0.5">@{employee.username}</p>
                    )}
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <StatusBadge
                        label={employee.active ? t('employee.active') : t('employee.inactive')}
                        variant={employee.active ? 'green' : 'gray'}
                      />
                      {employee.role === 'manager' && (
                        <StatusBadge label="Manager" variant="amber" />
                      )}
                      {employee.attendanceTracking === 'none' && (
                        <StatusBadge
                          label={t('employee.notTrackedBadge', 'Not tracked')}
                          variant="gray"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: details grid */}
                <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
                  <div id="employee-shift" className="scroll-mt-6">
                    <span className="text-[13px] text-text-tertiary block">{t('employee.shift', 'Shift')}</span>
                    {employee.shiftName && employee.shiftPublicId ? (
                      <ShiftPopover
                        shiftName={employee.shiftName}
                        shiftPublicId={employee.shiftPublicId}
                        shifts={shifts}
                      />
                    ) : (
                      <span className="text-[15px] text-text-tertiary">{t('employee.noShift', 'No shift')}</span>
                    )}
                  </div>
                  {employee.phoneNumber && (
                    <div>
                      <span className="text-[13px] text-text-tertiary block">{t('employee.phone', 'Phone')}</span>
                      <span className="text-[15px] font-medium text-text-primary font-mono">{employee.phoneNumber}</span>
                    </div>
                  )}
                  {employee.dob && (
                    <div>
                      <span className="text-[13px] text-text-tertiary block">{t('employee.dob', 'Date of birth')}</span>
                      <span className="text-[15px] text-text-secondary">{fmtDate(employee.dob)}</span>
                    </div>
                  )}
                  {employee.joinedAt && (
                    <div>
                      <span className="text-[13px] text-text-tertiary block">{t('employee.joinedAt', 'Join date')}</span>
                      <span className="text-[15px] text-text-secondary">{fmtDate(employee.joinedAt)}</span>
                    </div>
                  )}
                  {employee.leftAt && (
                    <div>
                      <span className="text-[13px] text-text-tertiary block">{t('employee.lastDayWorked', 'Last day worked')}</span>
                      <span className="text-[15px] text-text-secondary">{fmtDate(employee.leftAt)}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[13px] text-text-tertiary block">Created</span>
                    <span className="text-[15px] text-text-secondary">{fmtDate(employee.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Linked user status */}
              <div className="mt-5">
                {employee.linkedUserEmail ? (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-green/8 border border-green/15">
                    <Mail size={13} className="text-green flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[14px] text-green font-medium truncate block">{employee.linkedUserEmail}</span>
                      <span className="text-[12.5px] text-green/70">Can check in and view own dashboard</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red/8 border border-red/15">
                    <Info size={13} className="text-red flex-shrink-0" />
                    <div>
                      <span className="text-[13.5px] text-red font-medium block">No user account linked</span>
                      <span className="text-[12.5px] text-red/70">This employee cannot check in until linked</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </GlassCard>

        {/* Link user section */}
        <div id="employee-linking" className="scroll-mt-6">
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
                  <p className="text-[13.5px] text-text-tertiary leading-relaxed">
                    This employee can check in by scanning the workspace QR code while signed in. They can also view their own attendance and shifts.
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green/10 flex items-center justify-center flex-shrink-0">
                      <Mail size={16} className="text-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium text-text-primary truncate">{employee.linkedUserEmail}</p>
                      <p className="text-[13px] text-text-tertiary">User account linked</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUnlinkConfirm(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[14px] font-medium text-red bg-red/8 border-none cursor-pointer transition-colors hover:bg-red/15"
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
                  <p className="text-[13.5px] text-text-tertiary leading-relaxed">
                    A linked user account is required for check-in. The employee signs in on their phone and scans the workspace QR code to check in and out.
                  </p>
                  <div>
                    <p className="text-[14px] font-medium text-text-secondary mb-1.5">
                      {t('employee.linkByPublicId', 'Link by user public ID')}
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        id="link-user-id"
                        name="linkUserId"
                        type="text"
                        value={linkUserId}
                        onChange={(e) => {
                          setLinkUserId(e.target.value);
                          // Clear the error as the user types so they're not nagged mid-keystroke.
                          if (linkUserIdError !== null) setLinkUserIdError(null);
                        }}
                        onBlur={(e) => setLinkUserIdError(publicIdFormatError(e.target.value))}
                        placeholder={t('employee.userPublicIdPlaceholder', 'Enter user public ID')}
                        className={cn(
                          'flex-1 px-3 py-2 rounded-lg text-[15px] bg-glass-bg border text-text-primary outline-none font-mono transition-colors',
                          linkUserIdError !== null
                            ? 'border-status-red focus:border-status-red'
                            : 'border-cream-3 focus:border-coffee',
                        )}
                      />
                      <button
                        type="button"
                        onClick={handleLinkUser}
                        disabled={
                          !linkUserId.trim()
                          || linkUserIdError !== null
                          || updateEmployee.isPending
                        }
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[14px] font-medium bg-coffee text-white border-none cursor-pointer transition-colors hover:bg-coffee-light disabled:opacity-50"
                      >
                        <Link2 size={12} />
                        Link
                      </button>
                    </div>
                    {linkUserIdError !== null && (
                      <p className="text-[13px] text-status-red mt-1">{linkUserIdError}</p>
                    )}
                  </div>

                  <div id="employee-qr" className="border-t border-cream-3/60 pt-4 scroll-mt-6">
                    <p className="text-[14px] text-text-secondary mb-3">
                      {t(
                        'employee.linkUserDescription',
                        'Or share this QR code or employee ID with the staff member. They can scan it or enter it during onboarding to link their account.',
                      )}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-xl shadow-[0_2px_8px_rgba(107,66,38,0.06)] flex-shrink-0">
                        <QRCodeSVG
                          value={`dailybrew:emp:${employee.publicId}`}
                          size={64}
                          fgColor="#6B4226"
                          bgColor="#FFFFFF"
                          level="M"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-text-tertiary mb-1">Employee ID</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 px-3 py-2 rounded-lg text-[14px] bg-cream-2 border border-cream-3 text-text-primary font-mono select-all truncate">
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
                            className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-[14px] bg-glass-bg border border-cream-3 text-text-secondary cursor-pointer transition-colors hover:bg-cream-3 flex-shrink-0"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Manager permissions — owner-only on the backend; rendered when this employee is a
            manager AND the viewer is the workspace owner. Hidden from managers viewing other
            managers since they can't edit permissions anyway.
            Sits in column 2 of the lower row, paired with the Link user account card in column 1.
            Attendance history below then spans both columns. */}
        {isOwner && employee.role === 'manager' && (
          <GlassCard hover={false}>
            <GlassCardHeader
              title={t('employee.managerPermissionsTitle', 'Manager permissions')}
              action={<StatusBadge label="Manager" variant="amber" />}
            />
            <div className="p-5 space-y-4">
              <p className="text-[13.5px] text-text-tertiary leading-relaxed">
                {t(
                  'employee.managerPermissionsDesc',
                  "Choose which areas this manager can administer. Workspace settings, billing, sub-QR codes and promoting other managers stay with the owner.",
                )}
              </p>
              <div className="divide-y divide-cream-3/50">
                {MANAGER_PERMISSIONS.map((perm) => (
                  <ManagerPermissionRow
                    key={perm}
                    perm={perm}
                    checked={employee.managerPermissions.includes(perm)}
                    disabled={updatePermissions.isPending}
                    onChange={async (next) => {
                      const set = new Set<ManagerPermission>(employee.managerPermissions);
                      if (next) set.add(perm);
                      else set.delete(perm);
                      try {
                        await updatePermissions.mutateAsync({
                          publicId: employee.publicId,
                          permissions: Array.from(set),
                        });
                        toast.success(t('employee.permSaved', 'Permissions updated'));
                      } catch {
                        toast.error(t('employee.permSaveError', 'Failed to update permissions'));
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </GlassCard>
        )}

        {/* Attendance history — spans both columns when there's a manager-permissions card above
            (i.e. owner viewing a manager), otherwise sits in column 2 next to the Link user card. */}
        <GlassCard hover={false} className={cn(isOwner && employee.role === 'manager' && 'lg:col-span-2')}>
          <GlassCardHeader
            title={t('employee.attendanceHistory', 'Attendance history')}
            action={
              employee.attendance && employee.attendance.length > 0 ? (
                <span className="text-[13px] text-text-tertiary">
                  Last {Math.min(employee.attendance.length, 30)} days
                </span>
              ) : undefined
            }
          />
          <div className="max-h-[400px] overflow-y-auto">
            {!employee.attendance || employee.attendance.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-[15px] text-text-tertiary">
                  {t('employee.noAttendance', 'No attendance records')}
                </p>
                <p className="text-[13px] text-text-tertiary mt-1">
                  Records will appear here after the employee's first check-in.
                </p>
              </div>
            ) : (
              employee.attendance.slice(0, 30).map((a) => (
                <div
                  key={a.publicId}
                  className="flex items-center justify-between px-5 py-2.5 border-b border-cream-3/50 last:border-0"
                >
                  <div>
                    <div className="text-[14.5px] font-mono tabular-nums text-text-primary flex items-center gap-2">
                      {fmtDate(a.date)}
                      {a.editedAt && (
                        <span
                          title={t('attendance.editedTooltip', 'Edited by a manager')}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide bg-coffee/10 text-coffee"
                        >
                          {t('attendance.editedBadge', 'Edited')}
                        </span>
                      )}
                    </div>
                    <div className="text-[13px] text-text-tertiary">
                      {a.checkInAt || '--:--'} &rarr; {a.checkOutAt || '--:--'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {a.isLate && (
                      <StatusBadge label={t('attendance.late', 'Late')} variant="amber" />
                    )}
                    {a.leftEarly && !a.isLate && (
                      <StatusBadge label={t('attendance.leftEarly', 'Left early')} variant="amber" />
                    )}
                    {!a.isLate && !a.leftEarly && a.checkInAt && (
                      <StatusBadge label={t('attendance.onTime', 'On time')} variant="green" />
                    )}
                    {canEditAttendance && a.checkInAt && (
                      <button
                        type="button"
                        onClick={() => setEditAttendance({
                          publicId: a.publicId,
                          employeeName: fullName,
                          date: a.date,
                          checkInAt: a.checkInAt,
                          checkOutAt: a.checkOutAt,
                          originalCheckInAt: a.originalCheckInAt ?? null,
                          originalCheckOutAt: a.originalCheckOutAt ?? null,
                        })}
                        aria-label={t('attendance.editAria', 'Edit attendance')}
                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-transparent border-none text-text-tertiary hover:text-coffee hover:bg-cream-3/40 cursor-pointer transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Deactivation modal — captures the last working day so historical
          attendance still surfaces for prior dates and delayed deactivations
          don't generate phantom absent rows. */}
      <ConfirmModal
        open={showDeactivateModal}
        onOpenChange={(open) => {
          if (!open) setShowDeactivateModal(false);
        }}
        title={t('employee.deactivateTitle', 'Deactivate employee')}
        description={t(
          'employee.deactivateDescription',
          "Pick the last day this employee worked. Attendance won't be tracked after this date, but their past history stays intact.",
        )}
        confirmLabel={t('employee.deactivateConfirm', 'Deactivate')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        onConfirm={() => {
          setValue('active', false, { shouldDirty: true });
          setValue('leftAt', deactivateDate, { shouldDirty: true });
          setShowDeactivateModal(false);
        }}
      >
        <div className="mt-3">
          <label className="block text-[14px] font-medium text-text-secondary mb-1.5">
            {t('employee.lastDayWorked', 'Last day worked')}
          </label>
          <CustomDatePicker
            value={deactivateDate}
            onChange={(v) => setDeactivateDate(v)}
            todayOverride={wsTz.today()}
          />
        </div>
      </ConfirmModal>

      <AttendanceEditModal
        open={!!editAttendance}
        onOpenChange={(open) => { if (!open) setEditAttendance(null); }}
        workspacePublicId={workspaceId}
        attendance={editAttendance}
      />
    </div>
  );
}

// ── Manager permission row ────────────────────────────────────

const PERMISSION_LABELS: Record<ManagerPermission, { titleKey: string; descKey: string; titleFallback: string; descFallback: string }> = {
  manage_employees: {
    titleKey: 'employee.permEmployees',
    titleFallback: 'Manage employees',
    descKey: 'employee.permEmployeesDesc',
    descFallback: 'Create, edit, and remove employees (cannot promote managers)',
  },
  manage_shifts: {
    titleKey: 'employee.permShifts',
    titleFallback: 'Manage shifts',
    descKey: 'employee.permShiftsDesc',
    descFallback: 'Create, edit, and remove shifts and per-day overrides',
  },
  manage_closures: {
    titleKey: 'employee.permClosures',
    titleFallback: 'Manage closures',
    descKey: 'employee.permClosuresDesc',
    descFallback: 'Create, edit, and remove restaurant closure dates',
  },
  manage_leave: {
    titleKey: 'employee.permLeave',
    titleFallback: 'Manage leave',
    descKey: 'employee.permLeaveDesc',
    descFallback: 'Approve, reject, and cancel leave requests for any employee',
  },
  manage_attendance: {
    titleKey: 'employee.permAttendance',
    titleFallback: 'Manage attendance',
    descKey: 'employee.permAttendanceDesc',
    descFallback: 'View all attendance and edit records when corrections are needed',
  },
};

function ManagerPermissionRow({
  perm,
  checked,
  disabled,
  onChange,
}: {
  perm: ManagerPermission;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  const { t } = useTranslation();
  const labels = PERMISSION_LABELS[perm];
  const id = `manager-perm-${perm}`;

  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <label htmlFor={id} className="block text-[15px] font-medium text-text-primary cursor-pointer">
          {t(labels.titleKey, labels.titleFallback)}
        </label>
        <p className="text-[13px] text-text-tertiary mt-0.5">
          {t(labels.descKey, labels.descFallback)}
        </p>
      </div>
      <Toggle id={id} checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

// ── Shift Popover ─────────────────────────────────────────────

function ShiftPopover({
  shiftName,
  shiftPublicId,
  shifts,
}: {
  shiftName: string;
  shiftPublicId: string;
  shifts: Shift[] | undefined;
}) {
  const shift = useMemo(
    () => shifts?.find((s) => s.publicId === shiftPublicId),
    [shifts, shiftPublicId],
  );

  if (!shift) {
    return <span className="text-[15px] font-medium text-text-primary">{shiftName}</span>;
  }

  const [startH, startM] = shift.startTime.split(':').map(Number);
  const [endH, endM] = shift.endTime.split(':').map(Number);
  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;
  const durMin = endMin > startMin ? endMin - startMin : 1440 - startMin + endMin;
  const durH = Math.floor(durMin / 60);
  const durM = durMin % 60;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="text-[15px] font-medium text-coffee hover:text-coffee-light bg-transparent border-none cursor-pointer p-0 transition-colors underline decoration-dotted underline-offset-2"
        >
          {shiftName}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={6}
          className="z-50 w-[220px] bg-glass-bg backdrop-blur-xl border border-glass-border rounded-xl shadow-lg p-4 space-y-3"
        >
          <div>
            <p className="text-[16px] font-semibold text-text-primary">{shift.name}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Clock size={13} className="text-amber" />
              <span className="text-[15px] font-mono tabular-nums text-text-secondary">
                {shift.startTime} – {shift.endTime}
              </span>
            </div>
            <span className="text-[12.5px] font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber mt-2 inline-block">
              {durH}h{durM > 0 ? ` ${durM}m` : ''}
            </span>
          </div>

          {shift.timeRules.length > 0 && (
            <div className="border-t border-cream-3/60 pt-2">
              <p className="text-[12px] uppercase tracking-[1px] font-medium text-text-tertiary mb-1.5">
                Day overrides
              </p>
              <div className="space-y-1">
                {shift.timeRules.map((rule) => (
                  <div key={rule.publicId} className="flex items-center justify-between">
                    <span className="text-[13px] text-text-secondary">{rule.dayOfWeekLabel}</span>
                    <span className="text-[13px] font-mono tabular-nums text-text-tertiary">
                      {rule.startTime} – {rule.endTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Popover.Arrow className="fill-glass-border" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
