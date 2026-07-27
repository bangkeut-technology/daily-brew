"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  Copy,
  Eye,
  EyeOff,
  Link2,
  Mail,
  Monitor,
  Moon,
  Send,
  Sun,
  Unlink,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { publicIdFormatError } from "@/lib/publicId";
import { useAuth } from "@/providers/auth-provider";
import { useApplication } from "@/providers/application-provider";
import { useLinkEmployee, useRoleContext } from "@/hooks/useRoleContext";
import {
  useChangePassword,
  useDeleteAccount,
  useDisconnectOAuth,
  useDisconnectTelegram,
  useOAuthConnections,
  useOAuthLinkToken,
  useRemoveUserAvatar,
  useTelegramConnectionStatus,
  useTelegramLinkToken,
  useUnlinkEmployee,
  useUpdateProfile,
  useUploadUserAvatar,
} from "@/hooks/useProfile";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard, GlassCardHeader } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { AvatarUploader } from "@/components/shared/AvatarUploader";

const inputClass =
  "w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2.5 text-[15.5px] text-text-primary outline-none transition-all focus:border-coffee focus:ring-1 focus:ring-coffee/20";

const LOCALE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "km", label: "ភាសាខ្មែរ" },
];

const THEME_OPTIONS = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
] as const;

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { telegramBotUsername } = useApplication();
  const { theme, setTheme } = useTheme();
  const { data: roleContext } = useRoleContext();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [locale, setLocale] = useState(user?.locale ?? "en");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const [employeeId, setEmployeeId] = useState("");
  const [employeeIdError, setEmployeeIdError] = useState<string | null>(null);
  const [idCopied, setIdCopied] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<{
    publicId: string;
    name: string;
    workspace: string;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const uploadAvatar = useUploadUserAvatar();
  const removeAvatar = useRemoveUserAvatar();
  const disconnectOAuth = useDisconnectOAuth();
  const oauthLinkToken = useOAuthLinkToken();
  const linkEmployee = useLinkEmployee();
  const unlinkEmployee = useUnlinkEmployee();
  const deleteAccount = useDeleteAccount();
  const { data: oauthData, isLoading: oauthLoading } = useOAuthConnections();

  // While waiting for the user to tap Start in Telegram, poll so the
  // connection flips without a reload.
  //
  // `waiting` is derived rather than stored: once the backend reports
  // connected, it falls to false on its own and polling stops. That keeps the
  // success path free of a setState-inside-an-effect, which the lint rule
  // rightly rejects — the only effect left just fires a toast, which is
  // exactly the "sync with an external system" case effects are for.
  const [waitStartedAt, setWaitStartedAt] = useState<number | null>(null);
  const telegramTimeoutEndsAtRef = useRef(0);
  const { data: telegramStatus } = useTelegramConnectionStatus({
    refetchInterval: waitStartedAt !== null ? 2000 : false,
  });
  const telegramLinkToken = useTelegramLinkToken();
  const disconnectTelegram = useDisconnectTelegram();

  const telegramConnected = telegramStatus?.connected ?? false;
  const waitingForTelegram = waitStartedAt !== null && !telegramConnected;

  useEffect(() => {
    if (waitStartedAt !== null && telegramConnected) {
      toast.success("Telegram connected");
    }
  }, [waitStartedAt, telegramConnected]);

  useEffect(() => {
    if (!waitingForTelegram) return;
    const remaining = Math.max(0, telegramTimeoutEndsAtRef.current - Date.now());
    const timeout = window.setTimeout(() => {
      // setState from a timer callback, not the effect body.
      setWaitStartedAt(null);
      toast.error("Timed out waiting for Telegram. Try again.");
    }, remaining);
    return () => window.clearTimeout(timeout);
  }, [waitingForTelegram]);

  // Seed the form once the user record arrives.
  const [seededFor, setSeededFor] = useState<string | undefined>(undefined);
  if (user && seededFor !== user.publicId) {
    setSeededFor(user.publicId);
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setLocale(user.locale ?? "en");
  }

  const displayName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "User";

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(
      {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        locale,
      },
      {
        onSuccess: () => toast.success("Profile updated"),
        onError: () => toast.error("Failed to update profile"),
      },
    );
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    if (newPassword.length < 8) errors.push("Password must be at least 8 characters");
    if (newPassword !== confirmPassword) errors.push("Passwords do not match");
    if (oauthData?.hasPassword && !currentPassword) errors.push("Current password is required");
    setPasswordErrors(errors);
    if (errors.length > 0) return;

    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast.success("Password changed");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setPasswordErrors([]);
        },
        onError: () => toast.error("Failed to change password"),
      },
    );
  };

  const handleDisconnect = (provider: "google" | "apple") => {
    if (!oauthData) return;
    const other = provider === "google" ? "apple" : "google";
    // Refuse client-side rather than let the server lock them out of their
    // own account.
    if (!oauthData.hasPassword && !oauthData[other]) {
      toast.error("You need at least one login method.");
      return;
    }
    disconnectOAuth.mutate(provider, {
      onSuccess: () =>
        toast.success(`${provider.charAt(0).toUpperCase()}${provider.slice(1)} disconnected`),
      onError: () => toast.error("Failed to disconnect"),
    });
  };

  const handleLinkEmployee = (e: FormEvent) => {
    e.preventDefault();
    const id = employeeId.trim();
    if (!id) return;
    const formatError = publicIdFormatError(id);
    if (formatError !== null) {
      setEmployeeIdError(formatError);
      return;
    }
    linkEmployee.mutate(id, {
      onSuccess: () => {
        toast.success("Employee linked successfully");
        setEmployeeId("");
        setEmployeeIdError(null);
      },
      onError: () => toast.error("Failed to link employee. Check the ID."),
    });
  };

  const handleConnectTelegram = async () => {
    try {
      const { deepLink, expiresInSeconds } = await telegramLinkToken.mutateAsync();
      telegramTimeoutEndsAtRef.current = Date.now() + Math.min(expiresInSeconds, 30) * 1000;
      setWaitStartedAt(Date.now());
      window.open(deepLink, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not generate Telegram link");
    }
  };

  return (
    <div className="page-enter">
      <PageHeader title={t("nav.profile", "Profile")} />

      <div className="space-y-6">
        <GlassCard hover={false}>
          <div className="p-6">
            <div className="flex items-start gap-5">
              <AvatarUploader
                name={displayName}
                imageUrl={user?.avatarUrl}
                size={64}
                radius="20px"
                uploading={uploadAvatar.isPending || removeAvatar.isPending}
                onUpload={(file) =>
                  uploadAvatar.mutate(file, {
                    onSuccess: () => toast.success("Photo updated"),
                    onError: () => toast.error("Could not upload photo"),
                  })
                }
                onRemove={() =>
                  removeAvatar.mutate(undefined, {
                    onSuccess: () => toast.success("Photo removed"),
                    onError: () => toast.error("Could not remove photo"),
                  })
                }
              />
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-[22px] font-semibold leading-tight text-text-primary">
                  {displayName}
                </h2>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Mail size={12} className="text-text-tertiary" />
                  <span className="text-[14.5px] text-text-secondary">{user?.email}</span>
                </div>
                {roleContext && (
                  <div className="mt-2.5 flex items-center gap-2">
                    {roleContext.isOwner && <StatusBadge label="Owner" variant="amber" />}
                    {roleContext.isEmployee && <StatusBadge label="Employee" variant="blue" />}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 border-t border-cream-3/60 pt-5">
              <p className="mb-3 text-[13px] font-medium uppercase tracking-[1px] text-text-tertiary">
                Your public ID
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 rounded-xl bg-white p-2 shadow-[0_2px_8px_rgba(107,66,38,0.06)]">
                  <QRCodeSVG
                    value={`dailybrew:user:${user?.publicId ?? ""}`}
                    size={64}
                    fgColor="#6B4226"
                    bgColor="#FFFFFF"
                    level="M"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 select-all truncate rounded-lg border border-cream-3 bg-cream-2 px-3 py-2 font-mono text-sm text-text-primary">
                      {user?.publicId}
                    </code>
                    <button
                      type="button"
                      aria-label="Copy public ID"
                      onClick={() => {
                        if (!user?.publicId) return;
                        navigator.clipboard.writeText(user.publicId);
                        setIdCopied(true);
                        setTimeout(() => setIdCopied(false), 2000);
                      }}
                      className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-cream-3 bg-glass-bg px-2.5 py-2 text-[13.5px] font-medium text-text-secondary transition-all hover:bg-cream-3"
                    >
                      {idCopied ? <Check size={13} className="text-green" /> : <Copy size={13} />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-[12.5px] text-text-tertiary">
                    Share this with your employer so they can link you as an employee.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {roleContext && (
          <GlassCard hover={false}>
            <GlassCardHeader
              title="Link to employee"
              action={
                <div className="flex flex-wrap items-center gap-1.5">
                  <Link2 size={13} className="text-amber" />
                  <span className="text-[13px] font-medium text-amber">Optional</span>
                </div>
              }
            />
            <form onSubmit={handleLinkEmployee} className="p-6">
              <p className="mb-4 text-[14.5px] leading-relaxed text-text-secondary">
                Enter an employee public ID to link your account to a workspace. You can link to
                multiple workspaces if you work at different restaurants.
              </p>
              <div className="flex gap-3">
                <label htmlFor="profile-employee-id" className="sr-only">
                  Employee public ID
                </label>
                <input
                  id="profile-employee-id"
                  name="employeeId"
                  type="text"
                  value={employeeId}
                  onChange={(e) => {
                    setEmployeeId(e.target.value);
                    if (employeeIdError !== null) setEmployeeIdError(null);
                  }}
                  onBlur={(e) => setEmployeeIdError(publicIdFormatError(e.target.value))}
                  placeholder="Employee public ID"
                  className={cn(
                    inputClass,
                    "flex-1 font-mono",
                    employeeIdError !== null && "border-red focus:border-red",
                  )}
                />
                <button
                  type="submit"
                  disabled={linkEmployee.isPending || !employeeId.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-all hover:bg-coffee-light disabled:opacity-50"
                >
                  <UserCheck size={14} />
                  Link
                </button>
              </div>
              {employeeIdError !== null && (
                <p className="mt-1 text-[13px] text-red">{employeeIdError}</p>
              )}
            </form>
          </GlassCard>
        )}

        {roleContext?.linkedWorkspaces && roleContext.linkedWorkspaces.length > 0 && (
          <GlassCard hover={false}>
            <GlassCardHeader
              title="Linked workspaces"
              action={
                <span className="text-[13px] text-text-tertiary">
                  {roleContext.linkedWorkspaces.length} workspace
                  {roleContext.linkedWorkspaces.length === 1 ? "" : "s"}
                </span>
              }
            />
            <div className="space-y-3 p-5">
              <p className="text-[13.5px] leading-relaxed text-text-tertiary">
                You are linked as an employee in these workspaces. You can check in, view your
                attendance, and submit leave requests.
              </p>
              {roleContext.linkedWorkspaces.map((lw) => (
                <div
                  key={lw.employeePublicId}
                  className="flex items-center gap-3 rounded-xl border border-green/15 bg-green/5 px-4 py-3"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green/10">
                    <UserCheck size={16} className="text-green" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-text-primary">
                      {lw.employeeName}
                    </p>
                    <p className="text-[13px] text-text-tertiary">{lw.workspaceName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setUnlinkTarget({
                        publicId: lw.employeePublicId,
                        name: lw.employeeName,
                        workspace: lw.workspaceName ?? "",
                      })
                    }
                    className="flex items-center gap-1.5 rounded-lg bg-red/8 px-3 py-1.5 text-[13px] font-medium text-red transition-colors hover:bg-red/15"
                  >
                    <Unlink size={11} />
                    Unlink
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        <GlassCard hover={false}>
          <GlassCardHeader title="Profile information" />
          <form onSubmit={handleProfileSubmit} className="space-y-4 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="profile-firstName"
                  className="mb-1.5 block text-sm font-medium text-text-secondary"
                >
                  First name
                </label>
                <input
                  id="profile-firstName"
                  name="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="profile-lastName"
                  className="mb-1.5 block text-sm font-medium text-text-secondary"
                >
                  Last name
                </label>
                <input
                  id="profile-lastName"
                  name="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="profile-locale"
                className="mb-1.5 block text-sm font-medium text-text-secondary"
              >
                Language
              </label>
              <CustomSelect
                id="profile-locale"
                value={locale}
                onChange={setLocale}
                options={LOCALE_OPTIONS}
              />
            </div>
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="flex items-center gap-1.5 rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-all hover:bg-coffee-light disabled:opacity-50"
            >
              <Check size={14} />
              {updateProfile.isPending ? "Saving…" : "Save changes"}
            </button>
          </form>
        </GlassCard>

        <GlassCard hover={false}>
          <GlassCardHeader title="Change password" />
          <form onSubmit={handlePasswordSubmit} className="space-y-4 p-6">
            {oauthData?.hasPassword && (
              <PasswordField
                id="current-password"
                label="Current password"
                value={currentPassword}
                onChange={setCurrentPassword}
              />
            )}
            <PasswordField
              id="new-password"
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              hint="At least 8 characters."
            />
            <PasswordField
              id="confirm-password"
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
            {passwordErrors.length > 0 && (
              <div className="rounded-lg border border-red/15 bg-red/8 px-4 py-3">
                {passwordErrors.map((err) => (
                  <p key={err} className="text-sm text-red">
                    {err}
                  </p>
                ))}
              </div>
            )}
            <button
              type="submit"
              disabled={changePassword.isPending || !newPassword}
              className="flex items-center gap-1.5 rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-all hover:bg-coffee-light disabled:opacity-50"
            >
              <Check size={14} />
              {changePassword.isPending ? "Saving…" : "Change password"}
            </button>
          </form>
        </GlassCard>

        <GlassCard hover={false}>
          <GlassCardHeader title="Connected accounts" />
          <div className="space-y-3 p-6">
            {oauthLoading ? (
              <p className="py-4 text-center text-[15px] text-text-tertiary">Loading…</p>
            ) : (
              <>
                <OAuthRow
                  label="Google"
                  icon={<GoogleIcon />}
                  connected={!!oauthData?.google}
                  isPending={disconnectOAuth.isPending || oauthLinkToken.isPending}
                  onConnect={async () => {
                    await oauthLinkToken.mutateAsync();
                    window.location.href = "/oauth/connect/google";
                  }}
                  onDisconnect={() => handleDisconnect("google")}
                />
                <OAuthRow
                  label="Apple"
                  icon={<AppleIcon />}
                  connected={!!oauthData?.apple}
                  isPending={disconnectOAuth.isPending || oauthLinkToken.isPending}
                  onConnect={async () => {
                    await oauthLinkToken.mutateAsync();
                    window.location.href = "/oauth/connect/apple";
                  }}
                  onDisconnect={() => handleDisconnect("apple")}
                />
                {oauthData &&
                  !oauthData.hasPassword &&
                  [oauthData.google, oauthData.apple].filter(Boolean).length <= 1 && (
                    <div className="mt-2 rounded-lg border border-amber/15 bg-amber/8 px-4 py-3">
                      <p className="text-sm leading-relaxed text-amber">
                        You have only one login method. Set a password or connect another provider
                        before disconnecting.
                      </p>
                    </div>
                  )}
              </>
            )}
          </div>
        </GlassCard>

        {/* Personal Telegram — per-user, across every workspace the user
            touches. Distinct from the workspace group chat in Settings. */}
        <GlassCard hover={false}>
          <GlassCardHeader title="Telegram notifications" />
          <div className="space-y-3 p-6">
            <p className="text-[14.5px] leading-relaxed text-text-secondary">
              Get leave decisions, shift assignments, and daily summaries delivered to your personal
              Telegram chat. This is separate from any workspace group chat your owner sets up.
            </p>

            <div className="flex items-center justify-between rounded-xl border border-cream-3/60 bg-glass-bg px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cream-3 bg-glass-bg">
                  <TelegramIcon />
                </div>
                <div>
                  <p className="text-[15.5px] font-medium text-text-primary">Telegram</p>
                  <p className="mt-0.5 text-[13px] text-text-tertiary">
                    {telegramStatus?.connected
                      ? "Receiving personal notifications"
                      : telegramBotUsername
                        ? `Connect via @${telegramBotUsername}`
                        : "Bot is not configured on the server"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                {telegramStatus?.connected && <StatusBadge label="Connected" variant="green" />}
                {telegramStatus?.connected ? (
                  <button
                    type="button"
                    onClick={() =>
                      disconnectTelegram.mutate(undefined, {
                        onSuccess: () => {
                          setWaitStartedAt(null);
                          toast.success("Telegram disconnected");
                        },
                        onError: () => toast.error("Failed to disconnect Telegram"),
                      })
                    }
                    disabled={disconnectTelegram.isPending}
                    className="rounded-md bg-red/10 px-3 py-1 text-[13.5px] font-medium text-red transition-colors hover:bg-red/18 disabled:opacity-50"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectTelegram}
                    disabled={
                      !telegramBotUsername || telegramLinkToken.isPending || waitingForTelegram
                    }
                    className="inline-flex items-center gap-1.5 rounded-md bg-coffee px-3 py-1.5 text-[13.5px] font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50"
                  >
                    <Send size={12} />
                    {waitingForTelegram
                      ? "Waiting for Telegram…"
                      : telegramLinkToken.isPending
                        ? "Generating link…"
                        : "Connect personal Telegram"}
                  </button>
                )}
              </div>
            </div>

            {!telegramBotUsername && (
              <p className="text-[12.5px] text-red">
                Ask your administrator to set TELEGRAM_BOT_USERNAME.
              </p>
            )}
            {waitingForTelegram && (
              <p className="text-[12.5px] text-amber">
                After you tap Start in Telegram, we&apos;ll detect the connection automatically.
              </p>
            )}
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <GlassCardHeader title="Theme preference" />
          <div className="p-6">
            <div className="grid grid-cols-3 gap-3">
              {THEME_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      "relative flex cursor-pointer flex-col items-center gap-2 rounded-xl border px-3 py-4 transition-all duration-200",
                      isActive
                        ? "border-coffee/40 bg-coffee/8 shadow-[0_2px_8px_rgba(107,66,38,0.10)]"
                        : "border-cream-3 bg-glass-bg hover:bg-cream-3/40",
                    )}
                  >
                    <Icon size={20} className={isActive ? "text-coffee" : "text-text-secondary"} />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isActive ? "text-coffee" : "text-text-secondary",
                      )}
                    >
                      {opt.label}
                    </span>
                    {isActive && (
                      <span className="absolute right-2 top-2">
                        <Check size={14} className="text-coffee" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <GlassCardHeader
            title="Delete account"
            action={
              <div className="flex flex-wrap items-center gap-1.5">
                <AlertTriangle size={13} className="text-red" />
                <span className="text-[13px] font-medium text-red">Danger</span>
              </div>
            }
          />
          <div className="p-6">
            <p className="mb-4 text-[14.5px] leading-relaxed text-text-secondary">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmText("");
                setShowDeleteConfirm(true);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-red/20 bg-red/10 px-4 py-2 text-[15px] font-medium text-red transition-all hover:bg-red/18"
            >
              <AlertTriangle size={14} />
              Delete my account
            </button>
          </div>
        </GlassCard>
      </div>

      <ConfirmModal
        open={!!unlinkTarget}
        onOpenChange={(open) => {
          if (!open) setUnlinkTarget(null);
        }}
        title="Unlink from workspace"
        description={`Unlink your account from ${unlinkTarget?.name ?? ""} at ${unlinkTarget?.workspace ?? ""}? You will no longer be able to check in or view your attendance there.`}
        confirmLabel="Unlink"
        variant="danger"
        loading={unlinkEmployee.isPending}
        onConfirm={async () => {
          if (!unlinkTarget) return;
          try {
            await unlinkEmployee.mutateAsync(unlinkTarget.publicId);
            toast.success("Unlinked successfully");
          } catch {
            toast.error("Failed to unlink");
          }
          setUnlinkTarget(null);
        }}
      />

      {/* Typing DELETE is deliberate friction — this cascades to every
          workspace the user owns. */}
      <ConfirmModal
        open={showDeleteConfirm}
        onOpenChange={(open) => {
          if (!open) setShowDeleteConfirm(false);
        }}
        title="Delete account"
        description="This permanently deletes your account, the workspaces you own, and their attendance history. This cannot be undone."
        confirmLabel="Delete permanently"
        variant="danger"
        loading={deleteAccount.isPending}
        onConfirm={() => {
          if (deleteConfirmText !== "DELETE") {
            toast.error('Type DELETE to confirm');
            return;
          }
          deleteAccount.mutate(undefined, {
            onSuccess: () => {
              window.location.href = "/sign-in";
            },
            onError: () => toast.error("Failed to delete account"),
          });
        }}
      >
        <div className="mt-3">
          <label
            htmlFor="delete-confirm"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            Type <span className="font-mono font-semibold">DELETE</span> to confirm
          </label>
          <input
            id="delete-confirm"
            name="deleteConfirm"
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            className={cn(inputClass, "font-mono")}
          />
        </div>
      </ConfirmModal>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text-secondary">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={id === "current-password" ? "current-password" : "new-password"}
          className={cn(inputClass, "pr-11")}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-cream-3 hover:text-text-primary"
        >
          {visible ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {hint && <p className="mt-1 text-[12.5px] text-text-tertiary">{hint}</p>}
    </div>
  );
}

function OAuthRow({
  label,
  icon,
  connected,
  isPending,
  onConnect,
  onDisconnect,
}: {
  label: string;
  icon: ReactNode;
  connected: boolean;
  isPending: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-cream-3/60 bg-glass-bg px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cream-3 bg-glass-bg">
          {icon}
        </div>
        <div>
          <p className="text-[15.5px] font-medium text-text-primary">{label}</p>
          <p className="mt-0.5 text-[13px] text-text-tertiary">
            {connected ? "Connected" : "Not connected"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        {connected && <StatusBadge label="Connected" variant="green" />}
        <button
          type="button"
          onClick={connected ? onDisconnect : onConnect}
          disabled={isPending}
          className={cn(
            "rounded-md px-3 py-1 text-[13.5px] font-medium transition-colors disabled:opacity-50",
            connected
              ? "bg-red/10 text-red hover:bg-red/18"
              : "bg-coffee text-white hover:bg-coffee-light",
          )}
        >
          {connected ? "Disconnect" : "Connect"}
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 12.54c-.02-2.2 1.8-3.26 1.88-3.31-1.02-1.5-2.61-1.7-3.18-1.72-1.35-.14-2.64.8-3.33.8-.69 0-1.75-.78-2.87-.76-1.48.02-2.84.86-3.6 2.18-1.54 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.25 2.74 2.2 1.1-.04 1.52-.71 2.85-.71 1.33 0 1.7.71 2.87.69 1.19-.02 1.94-1.08 2.66-2.14.84-1.23 1.19-2.42 1.21-2.48-.03-.01-2.32-.89-2.34-3.51zM14.9 5.4c.6-.74 1.01-1.75.9-2.77-.87.04-1.93.58-2.56 1.31-.56.65-1.06 1.7-.93 2.7.97.08 1.97-.5 2.59-1.24z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#229ED9" aria-hidden>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.18 1.896-.96 6.504-1.356 8.628-.168.9-.492 1.2-.816 1.236-.696.06-1.224-.456-1.896-.9-1.056-.696-1.656-1.128-2.676-1.8-1.188-.78-.42-1.212.264-1.908.18-.18 3.24-2.964 3.3-3.216.012-.036.012-.156-.06-.216s-.18-.036-.264-.024c-.12.024-1.836 1.164-5.16 3.432-.48.336-.924.492-1.32.48-.432-.012-1.26-.24-1.884-.444-.756-.24-1.356-.372-1.308-.792.024-.216.324-.432.888-.66 3.492-1.512 5.82-2.508 6.984-2.988 3.324-1.392 4.008-1.632 4.464-1.632.096 0 .324.024.468.144.12.096.156.228.168.324-.012.072.012.288 0 .336z" />
    </svg>
  );
}
