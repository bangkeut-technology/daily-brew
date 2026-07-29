"use client";

import { use, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import {
  ArrowLeft,
  AtSign,
  Check,
  Clock,
  Copy,
  Globe,
  Info,
  Link2,
  Mail,
  MapPin,
  Pencil,
  QrCode,
  ShieldCheck,
  ShieldOff,
  Smartphone,
  Unlink,
  X,
} from "lucide-react";
import { getWorkspacePublicId } from "@/lib/api";
import { publicIdFormatError } from "@/lib/publicId";
import { cn } from "@/lib/utils";
import {
  useEmployee,
  useEmployees,
  useUpdateEmployee,
  useUpdateManagerPermissions,
} from "@/hooks/useEmployees";
import { useUploadEmployeePhoto, useRemoveEmployeePhoto } from "@/hooks/useEmployeePhoto";
import { useShifts } from "@/hooks/useShifts";
import { usePlan } from "@/hooks/usePlan";
import { useRoleContext } from "@/hooks/useRoleContext";
import { useDateFormat } from "@/hooks/useDateFormat";
import { useWorkspaceTimezone } from "@/hooks/useWorkspaceSettings";
import { MANAGER_PERMISSIONS } from "@/types/employee";
import type { ManagerPermission } from "@/types/auth";
import type { AttendanceRecord } from "@/types/attendance";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard, GlassCardHeader } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Toggle } from "@/components/shared/Toggle";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { CustomDatePicker } from "@/components/shared/CustomDatePicker";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { AvatarUploader } from "@/components/shared/AvatarUploader";
import { AttendanceEditModal } from "@/components/console/AttendanceEditModal";
import { ShiftPopover } from "@/components/console/ShiftPopover";
import { JobTitleInput } from "@/components/shared/JobTitleInput";
import { DetailSkeleton } from "@/components/admin/AdminDataStates";

/**
 * Scrolls a section into view and flashes a ring on it. The created-guide's
 * cards point at cards further down the page, which are easy to lose track of
 * on a long detail view — the flash is what makes the jump legible.
 */
function focusSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  const ring = ["ring-2", "ring-coffee/40", "ring-offset-2", "ring-offset-cream-1", "rounded-2xl"];
  el.classList.add(...ring);
  window.setTimeout(() => el.classList.remove(...ring), 1800);
}

function OwnerNextStep({
  icon,
  title,
  children,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full cursor-pointer gap-3 rounded-xl border border-cream-3/70 bg-glass-bg/70 p-4 text-left transition-colors hover:border-coffee/30 hover:bg-glass-bg"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-coffee/10 text-coffee">
        {icon}
      </div>
      <div>
        <p className="text-[14px] font-semibold text-text-primary">{title}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-text-tertiary">{children}</p>
      </div>
    </button>
  );
}

/** One of the three check-in hardening shortcuts under the created guide. */
function ProtectionLink({
  hash,
  icon,
  title,
  children,
}: {
  hash: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={`/console/settings#${hash}`}
      className="flex items-start gap-2 rounded-lg border border-cream-3/70 bg-glass-bg px-3 py-2.5 text-left no-underline transition-colors hover:bg-cream-3/60"
    >
      <span className="mt-0.5 shrink-0 text-amber">{icon}</span>
      <span>
        <span className="block text-[13.5px] font-semibold text-text-primary">{title}</span>
        <span className="mt-0.5 block text-[12.5px] leading-relaxed text-text-tertiary">
          {children}
        </span>
      </span>
    </Link>
  );
}

const editEmployeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  jobTitle: z.string().optional(),
  phoneNumber: z.string().optional(),
  username: z.string().optional(),
  dob: z.string().optional(),
  joinedAt: z.string().optional(),
  linkedAt: z.string().optional(),
  leftAt: z.string().optional(),
  shiftPublicId: z.string().optional(),
  active: z.boolean(),
  attendanceTracking: z.enum(["full", "none"]),
  role: z.enum(["employee", "manager"]),
});

type EditEmployeeForm = z.infer<typeof editEmployeeSchema>;

const inputClass =
  "w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[15.5px] text-text-primary outline-none transition-colors focus:border-coffee";

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { t } = useTranslation();
  const { publicId } = use(params);
  const workspaceId = getWorkspacePublicId() || "";
  const { data: employee, isLoading } = useEmployee(workspaceId, publicId);
  const { data: shifts } = useShifts(workspaceId);
  const { data: plan } = usePlan(workspaceId);
  const { data: workspaceEmployees } = useEmployees(workspaceId);
  const { data: roleContext } = useRoleContext();
  const updateEmployee = useUpdateEmployee(workspaceId);
  const updatePermissions = useUpdateManagerPermissions(workspaceId);
  const uploadPhoto = useUploadEmployeePhoto(workspaceId);
  const removePhoto = useRemoveEmployeePhoto(workspaceId);
  const fmtDate = useDateFormat();
  const wsTz = useWorkspaceTimezone();

  // `?created=1` is set by the create form's redirect. Held in state so
  // dismissing survives re-renders without rewriting the URL.
  const justCreated = useSearchParams().get("created") === "1";
  const [showCreatedGuide, setShowCreatedGuide] = useState(justCreated);

  const [isEditing, setIsEditing] = useState(false);
  const [linkUserId, setLinkUserId] = useState("");
  const [linkUserIdError, setLinkUserIdError] = useState<string | null>(null);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateDate, setDeactivateDate] = useState("");
  const [editAttendance, setEditAttendance] = useState<AttendanceRecord | null>(null);

  // Promote/demote and permission editing are owner-only on the backend (see
  // WorkspaceVoter) — hide those affordances from managers rather than let
  // them click buttons that 403.
  const isOwner = roleContext?.isOwner ?? false;
  const canEditAttendance =
    isOwner || (roleContext?.managerPermissions ?? []).includes("manage_attendance");

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
          jobTitle: employee.jobTitle || "",
          phoneNumber: employee.phoneNumber || "",
          username: employee.username || "",
          dob: employee.dob || "",
          joinedAt: employee.joinedAt || "",
          linkedAt: employee.linkedAt || "",
          leftAt: employee.leftAt || "",
          shiftPublicId: employee.shiftPublicId || "",
          active: employee.active,
          attendanceTracking: employee.attendanceTracking,
          role: employee.role,
        }
      : undefined,
  });

  if (isLoading || !employee) return <DetailSkeleton cards={3} />;

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const canPickRole = isOwner && plan?.canUseManagers && !!employee.linkedUserPublicId;
  const jobTitleSuggestions = Array.from(
    new Set(
      (workspaceEmployees ?? [])
        .filter((e) => e.publicId !== publicId)
        .map((e) => e.jobTitle)
        .filter((v): v is string => !!v),
    ),
  );

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
      toast.success(t("employee.userLinked", "User account linked"));
      setLinkUserId("");
      setLinkUserIdError(null);
    } catch {
      toast.error(t("employee.userLinkError", "Failed to link user. Check the ID and try again."));
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
        linkedAt: values.linkedAt || null,
        // leftAt only means anything while inactive; the server clears it on
        // reactivation too, but send null explicitly for clarity.
        leftAt: values.active ? null : values.leftAt || null,
        shiftPublicId: values.shiftPublicId || null,
        active: values.active,
        attendanceTracking: values.attendanceTracking,
        // Only send role when the picker actually rendered — the backend
        // rejects role changes from anyone but the owner.
        ...(canPickRole ? { role: values.role } : {}),
      });
      toast.success(t("employee.updateSuccess", "Employee updated"));
      setIsEditing(false);
    } catch {
      toast.error(t("employee.updateError", "Failed to update employee"));
    }
  };

  const copyPublicId = async () => {
    try {
      await navigator.clipboard.writeText(employee.publicId);
      toast.success(t("common.copied", "Copied to clipboard"));
    } catch {
      toast.error(t("common.copyFailed", "Failed to copy"));
    }
  };

  return (
    <div className="page-enter">
      <Link
        href="/console/employees"
        className="mb-3 inline-flex items-center gap-1.5 text-[13.5px] text-text-secondary no-underline hover:text-coffee"
      >
        <ArrowLeft size={14} />
        {t("employee.backToList", "Back to employees")}
      </Link>

      <PageHeader
        title={fullName}
        action={
          !isEditing ? (
            <div className="flex items-center gap-2">
              {canPickRole && (
                <button
                  type="button"
                  disabled={updateEmployee.isPending}
                  onClick={() => {
                    const newRole = employee.role === "manager" ? "employee" : "manager";
                    updateEmployee.mutate(
                      { publicId: employee.publicId, role: newRole },
                      {
                        onSuccess: () =>
                          toast.success(
                            newRole === "manager" ? "Promoted to manager" : "Demoted to employee",
                          ),
                        onError: () => toast.error("Failed to update role"),
                      },
                    );
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all disabled:opacity-50",
                    employee.role === "manager"
                      ? "bg-red/10 text-red hover:bg-red/18"
                      : "bg-amber/10 text-amber hover:bg-amber/18",
                  )}
                >
                  {employee.role === "manager" ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                  {employee.role === "manager" ? "Demote" : "Promote to manager"}
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-all hover:bg-coffee-light"
              >
                <Pencil size={14} />
                {t("common.edit", "Edit")}
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
                  {t("employee.createdGuideEyebrow", "Employee created")}
                </p>
                <h2 className="mt-1 text-[20px] font-semibold text-text-primary">
                  {t("employee.createdGuideTitle", "Next, help this employee check in")}
                </h2>
                <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
                  {t("employee.createdGuideDescription", "Finish the setup by linking their user account and sharing the check-in instructions before their first shift.")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreatedGuide(false)}
                aria-label={t("common.close", "Close")}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cream-3 bg-glass-bg text-text-tertiary transition-colors hover:bg-cream-3 hover:text-text-primary"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <OwnerNextStep
                icon={<Link2 size={16} />}
                title={t("employee.createdGuideLinkTitle", "Link their account")}
                onClick={() => focusSection("employee-linking")}
              >
                {t("employee.createdGuideLinkDesc", "Ask the employee to sign in and send their user public ID, or share this employee ID so they can link during onboarding.")}
</OwnerNextStep>
              <OwnerNextStep
                icon={<QrCode size={16} />}
                title={t("employee.createdGuideShareTitle", "Share the employee ID or QR")}
                onClick={() => focusSection("employee-qr")}
              >
                {t("employee.createdGuideShareDesc", "The QR code and employee ID below are what staff use to connect their account to this profile.")}
</OwnerNextStep>
              <OwnerNextStep
                icon={<Clock size={16} />}
                title={t("employee.createdGuideShiftTitle", "Confirm the shift")}
                onClick={() => focusSection("employee-shift")}
              >
                {employee.shiftName
                  ? `${fullName} is assigned to ${employee.shiftName}.`
                  : "No shift is assigned yet. Add one so late, absent, and early-leave status can be calculated."}
              </OwnerNextStep>
            </div>

            <div className="mt-5 rounded-xl border border-amber/20 bg-amber/8 p-4">
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber/15 text-amber">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-text-primary">
                    {t("employee.createdGuideAdvancedTitle", "Turn on advanced check-in protection")}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-text-tertiary">
                    {t("employee.createdGuideAdvancedDesc", "After staff profiles are ready, tighten check-in rules so attendance is recorded from the right place, network, and device.")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <ProtectionLink
                  hash="settings-ip-restriction"
                  icon={<Globe size={15} />}
                  title={t("employee.createdGuideIpTitle", "IP restriction")}
                >
                  {t("employee.createdGuideIpDesc", "Only allow check-ins from your restaurant Wi-Fi or approved network.")}
                </ProtectionLink>
                <ProtectionLink hash="settings-geofencing" icon={<MapPin size={15} />} title={t("employee.createdGuideGeofencingTitle", "Geofencing")}>
                  {t("employee.createdGuideGeofencingDesc", "Require staff to be near the restaurant before check-in is accepted.")}
                </ProtectionLink>
                <ProtectionLink
                  hash="settings-device-verification"
                  icon={<Smartphone size={15} />}
                  title={t("employee.createdGuideDeviceTitle", "Device verification")}
                >
                  {t("employee.createdGuideDeviceDesc", "Keep check-in and check-out on the same phone to reduce buddy punching.")}
                </ProtectionLink>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard id="employee-shift" hover={false} className="lg:col-span-2">
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
              <SectionHeader>{t("employee.sectionIdentity", "Identity")}</SectionHeader>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={t("employee.firstName", "First name")} htmlFor="edit-firstName" required error={errors.firstName?.message}>
                  <input id="edit-firstName" type="text" {...register("firstName")} className={inputClass} />
                </Field>

                <Field label={t("employee.lastName", "Last name")} htmlFor="edit-lastName" required error={errors.lastName?.message}>
                  <input id="edit-lastName" type="text" {...register("lastName")} className={inputClass} />
                </Field>

                <Field label={t("employee.jobTitle", "Job title")} htmlFor="edit-jobTitle">
                  {/* Free text, with the roster's existing titles plus the
                      built-in restaurant roles offered as suggestions. */}
                  <JobTitleInput
                    id="edit-jobTitle"
                    name="jobTitle"
                    value={watch("jobTitle") || ""}
                    onChange={(v) => setValue("jobTitle", v)}
                    placeholder={t("employee.jobTitlePlaceholder", "e.g. Cashier, Cook, Waiter")}
                    workspaceValues={jobTitleSuggestions}
                  />
                </Field>

                <Field label={t("employee.phoneNumber", "Phone number")} htmlFor="edit-phone">
                  <input id="edit-phone" type="text" {...register("phoneNumber")} className={inputClass} />
                </Field>

                <Field label={t("employee.dob", "Date of birth")}>
                  <CustomDatePicker value={watch("dob") || ""} onChange={(v) => setValue("dob", v)} />
                </Field>

                <Field label={t("employee.joinedAt", "Join date")}>
                  <CustomDatePicker
                    value={watch("joinedAt") || ""}
                    onChange={(v) => setValue("joinedAt", v)}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field
                    label={t("employee.linkedAt", "Tracking start")}
                    hint="Absent count starts from this date. Clear it to exclude this employee from the absent calc until they re-link."
                  >
                    <CustomDatePicker
                      value={watch("linkedAt") || ""}
                      onChange={(v) => setValue("linkedAt", v, { shouldDirty: true })}
                      todayOverride={wsTz.today()}
                      // The backend also 400s on a future linkedAt; blocking it
                      // in the picker is friendlier than a failed save.
                      isDateDisabled={(d) => d > wsTz.today()}
                    />
                  </Field>
                </div>
              </div>

              <div>
                <label
                  htmlFor="edit-username"
                  className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-text-secondary"
                >
                  <AtSign size={12} />
                  Username
                  {!plan?.isEspresso && (
                    <span className="rounded-full bg-amber/10 px-1.5 py-0.5 text-xs font-medium text-amber">
                      Espresso
                    </span>
                  )}
                </label>
                {plan?.isEspresso ? (
                  <>
                    <input
                      id="edit-username"
                      type="text"
                      placeholder="e.g. vandeth.tho"
                      {...register("username")}
                      className={cn(inputClass, "font-mono")}
                    />
                    <p className="mt-1 text-[12.5px] text-text-tertiary">
                      Unique identifier for BasilBook staff records.
                    </p>
                  </>
                ) : (
                  <p className="text-[13px] text-text-tertiary">
                    Upgrade to Espresso to link employees with BasilBook.
                  </p>
                )}
              </div>

              <SectionHeader>{canPickRole ? "Role & schedule" : "Schedule"}</SectionHeader>

              {canPickRole && (
                <Field label={t("employee.role", "Role")}>
                  <CustomSelect
                    value={watch("role")}
                    onChange={(v) => setValue("role", v as "employee" | "manager")}
                    options={[
                      { value: "employee", label: "Employee" },
                      { value: "manager", label: "Manager" },
                    ]}
                  />
                </Field>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={t("employee.shift", "Shift")}>
                  <CustomSelect
                    value={watch("shiftPublicId") || ""}
                    onChange={(v) => setValue("shiftPublicId", v)}
                    options={[
                      { value: "", label: "No shift" },
                      ...(shifts?.map((s) => ({
                        value: s.publicId,
                        label: `${s.name} (${s.startTime} - ${s.endTime})`,
                      })) ?? []),
                    ]}
                    placeholder={t("employee.noShift", "No shift")}
                  />
                </Field>

                <Field
                  label={t("employee.attendanceTracking", "Attendance tracking")}
                  hint={`Set "Excluded" for staff who help run the workspace but don't follow a shift. They can still check in to log times — they just won't be counted as absent.`}
                >
                  <CustomSelect
                    value={watch("attendanceTracking") ?? "full"}
                    onChange={(v) => setValue("attendanceTracking", v as "full" | "none")}
                    options={[
                      { value: "full", label: "Tracked (default)" },
                      { value: "none", label: "Excluded — never counted as absent" },
                    ]}
                  />
                </Field>
              </div>

              <SectionHeader>{t("employee.sectionStatus", "Status")}</SectionHeader>

              <div className="flex items-center gap-2">
                <Toggle
                  id="active-toggle"
                  checked={watch("active")}
                  onChange={(v) => {
                    if (!v) {
                      // Defer flipping `active` until the last-day date is
                      // confirmed in the modal.
                      setDeactivateDate(getValues("leftAt") || wsTz.today());
                      setShowDeactivateModal(true);
                    } else {
                      setValue("active", true, { shouldDirty: true });
                      setValue("leftAt", "", { shouldDirty: true });
                    }
                  }}
                />
                <label htmlFor="active-toggle" className="cursor-pointer text-[15px] text-text-secondary">
                  {t("employee.active", "Active")}
                </label>
                {!watch("active") && watch("leftAt") && (
                  <span className="ml-2 text-[13px] text-text-tertiary">
                    Last day worked: {fmtDate(watch("leftAt") || "")}
                  </span>
                )}
              </div>

              <div className="flex gap-3 border-t border-cream-3/60 pt-3">
                <button
                  type="submit"
                  disabled={updateEmployee.isPending}
                  className="flex items-center gap-1.5 rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-all hover:bg-coffee-light disabled:opacity-50"
                >
                  <Check size={14} />
                  {updateEmployee.isPending ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setIsEditing(false);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-cream-3 bg-glass-bg px-4 py-2 text-[15px] font-medium text-text-primary transition-all hover:bg-cream-3"
                >
                  <X size={14} />
                  {t("common.cancel", "Cancel")}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex flex-shrink-0 items-center gap-4">
                  <AvatarUploader
                    name={fullName}
                    imageUrl={employee.photoUrl}
                    size={64}
                    radius="20px"
                    uploading={uploadPhoto.isPending || removePhoto.isPending}
                    onUpload={(file) =>
                      uploadPhoto.mutate(
                        { publicId: employee.publicId, file },
                        {
                          onSuccess: () => toast.success(t("avatar.uploaded", "Photo updated")),
                          onError: () => toast.error(t("avatar.uploadError", "Could not upload photo")),
                        },
                      )
                    }
                    onRemove={() =>
                      removePhoto.mutate(employee.publicId, {
                        onSuccess: () => toast.success(t("avatar.removed", "Photo removed")),
                        onError: () => toast.error(t("avatar.removeError", "Could not remove photo")),
                      })
                    }
                  />
                  <div>
                    <h2 className="text-[18px] font-semibold text-text-primary">{fullName}</h2>
                    {employee.jobTitle && (
                      <p className="mt-0.5 text-sm text-text-secondary">{employee.jobTitle}</p>
                    )}
                    {employee.username && (
                      <p className="mt-0.5 font-mono text-[13px] text-text-tertiary">
                        @{employee.username}
                      </p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <StatusBadge
                        label={employee.active ? "Active" : "Inactive"}
                        variant={employee.active ? "green" : "gray"}
                      />
                      {employee.role === "manager" && <StatusBadge label={t("employee.roleManager", "Manager")} variant="amber" />}
                      {employee.attendanceTracking === "none" && (
                        <StatusBadge label={t("employee.notTrackedBadge", "Not tracked")} variant="gray" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-3 lg:grid-cols-3">
                  <ReadField label={t("employee.shift", "Shift")}>
                    {employee.shiftName ? (
                      <ShiftPopover
                        shiftName={employee.shiftName}
                        shiftPublicId={employee.shiftPublicId}
                        shifts={shifts}
                      />
                    ) : (
                      <span className="text-[15px] text-text-tertiary">{t("employee.noShift", "No shift")}</span>
                    )}
                  </ReadField>
                  {employee.phoneNumber && (
                    <ReadField label={t("employee.phone", "Phone")}>
                      <span className="font-mono text-[15px] font-medium text-text-primary">
                        {employee.phoneNumber}
                      </span>
                    </ReadField>
                  )}
                  {employee.dob && (
                    <ReadField label={t("employee.dob", "Date of birth")}>
                      <span className="text-[15px] text-text-secondary">{fmtDate(employee.dob)}</span>
                    </ReadField>
                  )}
                  {employee.joinedAt && (
                    <ReadField label={t("employee.joinedAt", "Join date")}>
                      <span className="text-[15px] text-text-secondary">
                        {fmtDate(employee.joinedAt)}
                      </span>
                    </ReadField>
                  )}
                  {employee.leftAt && (
                    <ReadField label={t("employee.lastDayWorked", "Last day worked")}>
                      <span className="text-[15px] text-text-secondary">
                        {fmtDate(employee.leftAt)}
                      </span>
                    </ReadField>
                  )}
                  <ReadField label="Created">
                    <span className="text-[15px] text-text-secondary">
                      {fmtDate(employee.createdAt)}
                    </span>
                  </ReadField>
                </div>
              </div>

              <div className="mt-5">
                {employee.linkedUserEmail ? (
                  <div className="flex items-center gap-2 rounded-lg border border-green/15 bg-green/8 px-3 py-2.5">
                    <Mail size={13} className="flex-shrink-0 text-green" />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-green">
                        {employee.linkedUserEmail}
                      </span>
                      <span className="text-[12.5px] text-green/70">
                        Can check in and view own dashboard
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-red/15 bg-red/8 px-3 py-2.5">
                    <Info size={13} className="flex-shrink-0 text-red" />
                    <div>
                      <span className="block text-[13.5px] font-medium text-red">
                        No user account linked
                      </span>
                      <span className="text-[12.5px] text-red/70">
                        This employee cannot check in until linked
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </GlassCard>

        <GlassCard id="employee-linking" hover={false}>
          <GlassCardHeader
            title={t("employee.linkUser", "Link user account")}
            action={employee.linkedUserEmail ? <StatusBadge label={t("employee.linked", "Linked")} variant="green" /> : undefined}
          />
          <div className="space-y-4 p-5">
            {employee.linkedUserEmail ? (
              <>
                <p className="text-[13.5px] leading-relaxed text-text-tertiary">
                  This employee can check in by scanning the workspace QR code while signed in. They
                  can also view their own attendance and shifts.
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green/10">
                    <Mail size={16} className="text-green" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-text-primary">
                      {employee.linkedUserEmail}
                    </p>
                    <p className="text-[13px] text-text-tertiary">{t("employee.userLinked", "User account linked")}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUnlinkConfirm(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-red/8 px-3 py-1.5 text-sm font-medium text-red transition-colors hover:bg-red/15"
                  >
                    <Unlink size={12} />
                    {t("employee.unlink", "Unlink")}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-[13.5px] leading-relaxed text-text-tertiary">
                  A linked user account is required for check-in. The employee signs in on their
                  phone and scans the workspace QR code to check in and out.
                </p>
                <div>
                  <label
                    htmlFor="link-user-id"
                    className="mb-1.5 block text-sm font-medium text-text-secondary"
                  >
                    {t("employee.linkByPublicId", "Link by user public ID")}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="link-user-id"
                      name="linkUserId"
                      type="text"
                      value={linkUserId}
                      onChange={(e) => {
                        setLinkUserId(e.target.value);
                        // Clear as they type so they aren't nagged mid-keystroke.
                        if (linkUserIdError !== null) setLinkUserIdError(null);
                      }}
                      onBlur={(e) => setLinkUserIdError(publicIdFormatError(e.target.value))}
                      placeholder={t("employee.userPublicIdPlaceholder", "Enter user public ID")}
                      className={cn(
                        "flex-1 rounded-lg border bg-glass-bg px-3 py-2 font-mono text-[15px] text-text-primary outline-none transition-colors",
                        linkUserIdError !== null
                          ? "border-red focus:border-red"
                          : "border-cream-3 focus:border-coffee",
                      )}
                    />
                    <button
                      type="button"
                      onClick={handleLinkUser}
                      disabled={
                        !linkUserId.trim() || linkUserIdError !== null || updateEmployee.isPending
                      }
                      className="flex items-center gap-1.5 rounded-lg bg-coffee px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50"
                    >
                      <Link2 size={12} />
                      Link
                    </button>
                  </div>
                  {linkUserIdError !== null && (
                    <p className="mt-1 text-[13px] text-red">{linkUserIdError}</p>
                  )}
                </div>

                <div id="employee-qr" className="border-t border-cream-3/60 pt-4">
                  <p className="mb-3 text-sm text-text-secondary">
                    {t("employee.linkUserDescription", "Or share this QR code or employee ID with the staff member. They can scan it or enter it during onboarding to link their account.")}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 rounded-xl bg-white p-2 shadow-[0_2px_8px_rgba(107,66,38,0.06)]">
                      <QRCodeSVG
                        value={`dailybrew:emp:${employee.publicId}`}
                        size={64}
                        fgColor="#6B4226"
                        bgColor="#FFFFFF"
                        level="M"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-xs text-text-tertiary">Employee ID</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 select-all truncate rounded-lg border border-cream-3 bg-cream-2 px-3 py-2 font-mono text-sm text-text-primary">
                          {employee.publicId}
                        </code>
                        <button
                          type="button"
                          onClick={copyPublicId}
                          aria-label={t("employee.createdGuideCopyAction", "Copy employee ID")}
                          className="flex flex-shrink-0 items-center gap-1 rounded-lg border border-cream-3 bg-glass-bg px-2.5 py-2 text-sm text-text-secondary transition-colors hover:bg-cream-3"
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

        {isOwner && employee.role === "manager" && (
          <GlassCard hover={false}>
            <GlassCardHeader
              title={t("employee.managerPermissionsTitle", "Manager permissions")}
              action={<StatusBadge label={t("employee.roleManager", "Manager")} variant="amber" />}
            />
            <div className="space-y-4 p-5">
              <p className="text-[13.5px] leading-relaxed text-text-tertiary">
                {t("employee.managerPermissionsDesc", "Choose which areas this manager can administer. Workspace settings, billing, sub-QR codes and promoting other managers stay with the owner.")}
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
                        toast.success(t("employee.permSaved", "Permissions updated"));
                      } catch {
                        toast.error(t("employee.permSaveError", "Failed to update permissions"));
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </GlassCard>
        )}

        <GlassCard
          hover={false}
          className={cn(isOwner && employee.role === "manager" && "lg:col-span-2")}
        >
          <GlassCardHeader
            title={t("employee.attendanceHistory", "Attendance history")}
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
                <p className="text-[15px] text-text-tertiary">{t("employee.noAttendance", "No attendance records")}</p>
                <p className="mt-1 text-[13px] text-text-tertiary">
                  Records will appear here after the employee&apos;s first check-in.
                </p>
              </div>
            ) : (
              employee.attendance.slice(0, 30).map((a) => (
                <div
                  key={a.publicId}
                  className="flex items-center justify-between border-b border-cream-3/50 px-5 py-2.5 last:border-0"
                >
                  <div>
                    <div className="flex items-center gap-2 font-mono text-[14.5px] tabular-nums text-text-primary">
                      {fmtDate(a.date)}
                      {a.editedAt && (
                        <span
                          title={t("attendance.editedTooltip", "Edited by a manager")}
                          className="inline-flex items-center rounded bg-coffee/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-coffee"
                        >
                          {t("attendance.editedBadge", "Edited")}
                        </span>
                      )}
                    </div>
                    {/* Times arrive pre-formatted as workspace-local HH:MM. */}
                    <div className="text-[13px] text-text-tertiary">
                      {a.checkInAt || "--:--"} &rarr; {a.checkOutAt || "--:--"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {a.isLate && <StatusBadge label={t("attendance.late", "Late")} variant="amber" />}
                    {a.leftEarly && !a.isLate && <StatusBadge label={t("attendance.leftEarly", "Left early")} variant="amber" />}
                    {!a.isLate && !a.leftEarly && a.checkInAt && (
                      <StatusBadge label={t("attendance.onTime", "On time")} variant="green" />
                    )}
                    {canEditAttendance && a.checkInAt && (
                      <button
                        type="button"
                        onClick={() => setEditAttendance({ ...a, employeeName: fullName })}
                        aria-label={t("attendance.editAria", "Edit attendance")}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-cream-3/40 hover:text-coffee"
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

      <ConfirmModal
        open={showUnlinkConfirm}
        onOpenChange={setShowUnlinkConfirm}
        title={t("employee.unlinkTitle", "Unlink user account")}
        description={t("employee.unlinkConfirm", "Remove the link between this employee and their user account? They will no longer be able to see their own dashboard.")}
        confirmLabel={t("employee.unlink", "Unlink")}
        variant="danger"
        loading={updateEmployee.isPending}
        onConfirm={async () => {
          try {
            await updateEmployee.mutateAsync({ publicId, linkedUserPublicId: null });
            toast.success(t("employee.userUnlinked", "User account unlinked"));
            setShowUnlinkConfirm(false);
          } catch {
            toast.error(t("employee.userUnlinkError", "Failed to unlink user"));
          }
        }}
      />

      {/* Deactivation captures the last working day so past attendance stays
          intact and a delayed deactivation doesn't generate phantom absences. */}
      <ConfirmModal
        open={showDeactivateModal}
        onOpenChange={(open) => {
          if (!open) setShowDeactivateModal(false);
        }}
        title={t("employee.deactivateTitle", "Deactivate employee")}
        description={t("employee.deactivateDescription", "Pick the last day this employee worked. Attendance won't be tracked after this date, but their past history stays intact.")}
        confirmLabel={t("employee.deactivateConfirm", "Deactivate")}
        variant="danger"
        onConfirm={() => {
          setValue("active", false, { shouldDirty: true });
          setValue("leftAt", deactivateDate, { shouldDirty: true });
          setShowDeactivateModal(false);
        }}
      >
        <div className="mt-3">
          <p className="mb-1.5 text-sm font-medium text-text-secondary">{t("employee.lastDayWorked", "Last day worked")}</p>
          <CustomDatePicker
            value={deactivateDate}
            onChange={setDeactivateDate}
            todayOverride={wsTz.today()}
          />
        </div>
      </ConfirmModal>

      <AttendanceEditModal
        open={!!editAttendance}
        onOpenChange={(open) => {
          if (!open) setEditAttendance(null);
        }}
        workspaceId={workspaceId}
        tz={wsTz.timezone}
        record={editAttendance}
      />
    </div>
  );
}

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-text-tertiary">
        {children}
      </span>
      <div className="h-px flex-1 bg-cream-3/60" />
    </div>
  );
}

function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-text-secondary">
        {label}
        {required ? " *" : ""}
      </label>
      {children}
      {error && <p className="mt-1 text-[13px] text-red">{error}</p>}
      {hint && <p className="mt-1 text-[12.5px] leading-snug text-text-tertiary">{hint}</p>}
    </div>
  );
}

function ReadField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <span className="block text-[13px] text-text-tertiary">{label}</span>
      {children}
    </div>
  );
}

const PERMISSION_LABELS: Record<ManagerPermission, { title: string; desc: string }> = {
  manage_employees: {
    title: "Manage employees",
    desc: "Create, edit, and remove employees (cannot promote managers)",
  },
  manage_shifts: {
    title: "Manage shifts",
    desc: "Create, edit, and remove shifts and per-day overrides",
  },
  manage_closures: {
    title: "Manage closures",
    desc: "Create, edit, and remove restaurant closure dates",
  },
  manage_leave: {
    title: "Manage leave",
    desc: "Approve, reject, and cancel leave requests for any employee",
  },
  manage_attendance: {
    title: "Manage attendance",
    desc: "View all attendance and edit records when corrections are needed",
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
  const labels = PERMISSION_LABELS[perm];
  const id = `manager-perm-${perm}`;

  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="block cursor-pointer text-[15px] font-medium text-text-primary">
          {labels.title}
        </label>
        <p className="mt-0.5 text-[13px] text-text-tertiary">{labels.desc}</p>
      </div>
      <Toggle id={id} checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}
