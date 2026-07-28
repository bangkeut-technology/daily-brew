"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Copy,
  KeyRound,
  MapPin,
  Navigation,
  Nfc,
  QrCode,
  Send,
  Smartphone,
  Trash2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { apiAxios, clearWorkspacePublicId, getWorkspacePublicId } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useUpdateWorkspaceSettings, useWorkspaceSettings } from "@/hooks/useWorkspaceSettings";
import { useRemoveWorkspaceLogo, useUploadWorkspaceLogo } from "@/hooks/useWorkspaceLogo";
import {
  useApiTokens,
  useCreateApiToken,
  useDeleteWorkspace,
  useRegenerateWorkspaceToken,
  useRevokeApiToken,
  useTelegramTest,
  useUpdateWorkspace,
  useWorkspace,
  useWorkspaceTelegramLinkToken,
} from "@/hooks/useWorkspaces";
import { usePlan } from "@/hooks/usePlan";
import { useDateFormat } from "@/hooks/useDateFormat";
import type { ApiTokenCreated, WorkspaceSetting } from "@/types/workspace";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard, GlassCardHeader } from "@/components/shared/GlassCard";
import { Toggle } from "@/components/shared/Toggle";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { AvatarUploader } from "@/components/shared/AvatarUploader";
import { CheckinUrlRow } from "@/components/console/CheckinUrlRow";
import { PlanCard } from "@/components/console/PlanCard";
import { Skeleton } from "@/components/admin/AdminDataStates";

const MIN_GEOFENCE_RADIUS = 50;
const DEFAULT_GEOFENCE_RADIUS = 100;

const DATE_FORMATS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (30/03/2026)" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (03/30/2026)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2026-03-30)" },
];

function timezoneOptions() {
  const list =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : ["UTC", "Asia/Phnom_Penh"];
  return list.map((tz) => ({ value: tz, label: tz }));
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const [workspaceId] = useState<string | null>(() => getWorkspacePublicId());
  const wsId = workspaceId ?? "";

  const { data: workspace } = useWorkspace(wsId);
  const { data: settings, isLoading } = useWorkspaceSettings(wsId);
  const { data: plan } = usePlan(wsId);
  const update = useUpdateWorkspaceSettings(wsId);
  const updateWorkspace = useUpdateWorkspace();
  const regenerateToken = useRegenerateWorkspaceToken();
  const deleteWorkspace = useDeleteWorkspace();
  const uploadLogo = useUploadWorkspaceLogo(wsId);
  const removeLogo = useRemoveWorkspaceLogo(wsId);
  const fmtDate = useDateFormat();

  const tzOptions = useMemo(() => timezoneOptions(), []);

  // Free-text fields stay drafts until saved; every other setting commits on
  // change, because a toggle that needs a Save button reads as broken.
  //
  // Both re-seed from the server during render rather than in an effect — the
  // "adjust state when the source changes" pattern, which avoids the extra
  // render pass an effect would cost on every refetch.
  const [name, setName] = useState(workspace?.name ?? "");
  const [nameSource, setNameSource] = useState(workspace?.name ?? "");
  if (workspace?.name !== undefined && workspace.name !== nameSource) {
    setNameSource(workspace.name);
    setName(workspace.name);
  }

  const serverIps = (settings?.allowedIps ?? []).join("\n");
  const [allowedIps, setAllowedIps] = useState(serverIps);
  const [allowedIpsSource, setAllowedIpsSource] = useState(serverIps);
  if (serverIps !== allowedIpsSource) {
    setAllowedIpsSource(serverIps);
    setAllowedIps(serverIps);
  }

  const [locating, setLocating] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = (patch: Partial<WorkspaceSetting>) => {
    update.mutate(patch, {
      onSuccess: () => toast.success(t("settings.saved", "Settings saved")),
      onError: () => toast.error(t("settings.saveError", "Failed to save settings")),
    });
  };

  const useMyIp = async () => {
    try {
      const { data } = await apiAxios.get<{ ip?: string }>(`/workspaces/${wsId}/settings/my-ip`);
      if (!data?.ip) return;
      const existing = allowedIps
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      if (existing.includes(data.ip)) return;
      setAllowedIps([...existing, data.ip].join("\n"));
    } catch {
      toast.error(t("settings.myIpError", "Could not detect your IP address"));
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t("settings.geolocationUnsupported", "This browser can't share a location"));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        save({
          geofencingLatitude: position.coords.latitude,
          geofencingLongitude: position.coords.longitude,
          geofencingRadiusMeters: settings?.geofencingRadiusMeters || DEFAULT_GEOFENCE_RADIUS,
        });
      },
      () => {
        setLocating(false);
        toast.error(t("settings.locationDenied", "Location permission denied"));
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  if (isLoading || !settings) {
    return (
      <div className="page-enter max-w-3xl" aria-busy="true">
        <Skeleton className="mb-6 h-8 w-40" />
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const qrToken = workspace?.qrToken ?? "";
  const canUseIp = plan?.canUseIpRestriction ?? false;
  const canUseDevice = plan?.canUseDeviceVerification ?? false;
  const canUseGeo = plan?.canUseGeofencing ?? false;
  const canUseTap = plan?.canUseTapCheckin ?? false;
  const canUseNfc = plan?.canUseNfcCheckin ?? false;
  const canUseTelegram = plan?.canUseTelegramNotifications ?? false;

  return (
    <div className="page-enter max-w-3xl">
      <PageHeader
        title={t("nav.settings", "Settings")}
      />

      <div className="space-y-5">
        {plan && <PlanCard plan={plan} formatDate={fmtDate} />}

        {qrToken && (
          <GlassCard hover={false}>
            <GlassCardHeader title={t("settings.qrCardTitle", "Check-in QR code")} />
            <div className="flex flex-col items-center gap-5 p-5 md:flex-row">
              <div className="shrink-0 rounded-xl bg-white p-3 shadow-[0_2px_8px_rgba(107,66,38,0.06)]">
                <QRCodeSVG
                  value={`dailybrew:ws:${qrToken}`}
                  size={104}
                  fgColor="#6B4226"
                  bgColor="#FFFFFF"
                  level="M"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-3 text-sm leading-relaxed text-text-secondary">
                  {t(
                    "settings.qrCardDesc",
                    "Print and display this at your restaurant. Regenerating invalidates every printed copy.",
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded bg-cream-3/30 px-2 py-1 font-mono text-[13px] text-text-tertiary">
                    dailybrew:ws:{qrToken}
                  </code>
                  <CopyButton value={qrToken} />
                </div>
                <CheckinUrlRow qrToken={qrToken} />
                <button
                  type="button"
                  onClick={() => setConfirmRegenerate(true)}
                  className="mt-3 flex items-center gap-1.5 rounded-lg border border-cream-3 bg-glass-bg px-3 py-1.5 text-[13.5px] font-medium text-text-secondary transition-colors hover:bg-cream-3"
                >
                  <QrCode size={13} />
                  {t("settings.regenerateToken", "Regenerate token")}
                </button>
              </div>
            </div>
          </GlassCard>
        )}

        {workspace && (
          <GlassCard hover={false}>
            <GlassCardHeader title={t("avatar.logoTitle", "Workspace logo")} />
            <div className="flex items-center gap-5 p-6">
              <AvatarUploader
                name={workspace.name}
                imageUrl={workspace.logoUrl}
                size={96}
                radius="20px"
                uploading={uploadLogo.isPending || removeLogo.isPending}
                onUpload={(file) =>
                  uploadLogo.mutate(file, {
                    onSuccess: () => toast.success(t("avatar.uploaded", "Photo updated")),
                    onError: () => toast.error(t("avatar.uploadError", "Could not upload photo")),
                  })
                }
                onRemove={() =>
                  removeLogo.mutate(undefined, {
                    onSuccess: () => toast.success(t("avatar.removed", "Photo removed")),
                    onError: () => toast.error(t("avatar.removeError", "Could not remove photo")),
                  })
                }
              />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium text-text-primary">{workspace.name}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-text-tertiary">
                  {t(
                    "avatar.logoDesc",
                    "Square JPEG, PNG, or WebP up to 5 MB. Shown on your dashboard header and workspace switcher.",
                  )}
                </p>
              </div>
            </div>
          </GlassCard>
        )}

        <GlassCard hover={false}>
          <GlassCardHeader title={t("settings.workspaceSettings", "Workspace settings")} />
          <div className="space-y-4 p-5">
            <div>
              <label
                htmlFor="workspace-name"
                className="mb-1 block text-[13px] font-medium text-text-secondary"
              >
                {t("workspace.label", "Workspace name")}
              </label>
              <div className="flex gap-2">
                <input
                  id="workspace-name"
                  name="workspaceName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[15.5px] text-text-primary outline-none focus:border-coffee"
                />
                <button
                  type="button"
                  disabled={
                    updateWorkspace.isPending || !name.trim() || name.trim() === workspace?.name
                  }
                  onClick={() =>
                    updateWorkspace.mutate(
                      { publicId: wsId, name: name.trim() },
                      {
                        onSuccess: () => toast.success(t("settings.saved", "Settings saved")),
                        onError: () => toast.error(t("settings.saveError", "Failed to save settings")),
                      },
                    )
                  }
                  className="rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50"
                >
                  {t("common.save", "Save")}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="timezone"
                className="mb-1 block text-[13px] font-medium text-text-secondary"
              >
                {t("settings.timezone", "Timezone")}
              </label>
              <CustomSelect
                id="timezone"
                value={settings.timezone}
                onChange={(tz) => save({ timezone: tz })}
                options={tzOptions}
                searchable
              />
              <p className="mt-1 text-[12.5px] text-text-tertiary">
                {t(
                  "settings.timezoneHint",
                  "Used to calculate late arrivals and early departures relative to shift times.",
                )}
              </p>
            </div>

            <div>
              <label
                htmlFor="date-format"
                className="mb-1 block text-[13px] font-medium text-text-secondary"
              >
                {t("settings.dateFormat", "Date format")}
              </label>
              <CustomSelect
                id="date-format"
                value={settings.dateFormat}
                onChange={(v) => save({ dateFormat: v })}
                options={DATE_FORMATS}
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <GlassCardHeader title={t("settings.checkinVerification", "Check-in verification")} />
          <div className="divide-y divide-cream-3/70">
            <SettingRow
              title={t("settings.enableIpRestriction", "IP restriction")}
              description={t(
                "settings.ipRestrictionDesc",
                "Only allow check-ins from your restaurant's network.",
              )}
              locked={!canUseIp}
            >
              <Toggle
                checked={canUseIp && settings.ipRestrictionEnabled}
                disabled={!canUseIp || update.isPending}
                onChange={(v) => save({ ipRestrictionEnabled: v })}
              />
            </SettingRow>

            {canUseIp && settings.ipRestrictionEnabled && (
              <div className="p-5">
                <div className="mb-1 flex items-center justify-between">
                  <label
                    htmlFor="allowed-ips"
                    className="text-[13px] font-medium text-text-secondary"
                  >
                    {t("settings.allowedIps", "Allowed IPs (one per line)")}
                  </label>
                  <button
                    type="button"
                    onClick={useMyIp}
                    className="text-[12.5px] font-medium text-amber transition-colors hover:text-coffee"
                  >
                    {t("settings.useMyCurrentIp", "+ Use my current IP")}
                  </button>
                </div>
                <textarea
                  id="allowed-ips"
                  name="allowedIps"
                  value={allowedIps}
                  onChange={(e) => setAllowedIps(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 font-mono text-[15px] text-text-primary outline-none focus:border-coffee"
                />
                <button
                  type="button"
                  disabled={update.isPending}
                  onClick={() =>
                    save({
                      allowedIps: allowedIps
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="mt-2 rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50"
                >
                  {t("common.save", "Save")}
                </button>
              </div>
            )}

            <SettingRow
              title={t("settings.deviceVerification", "Device verification")}
              description={t(
                "settings.deviceVerificationDesc",
                "Bind each check-in to the employee's own device.",
              )}
              locked={!canUseDevice}
              icon={<Smartphone size={14} className="text-amber" />}
            >
              <Toggle
                checked={canUseDevice && settings.deviceVerificationEnabled}
                disabled={!canUseDevice || update.isPending}
                onChange={(v) => save({ deviceVerificationEnabled: v })}
              />
            </SettingRow>

            <SettingRow
              title={t("settings.geofencing", "Geofencing")}
              description={t(
                "settings.geofencingDescFull",
                "When enabled, staff can only check in when they are within a specified radius of your restaurant location.",
              )}
              locked={!canUseGeo}
              icon={<MapPin size={14} className="text-amber" />}
            >
              <Toggle
                checked={canUseGeo && settings.geofencingEnabled}
                disabled={!canUseGeo || update.isPending}
                onChange={(v) => save({ geofencingEnabled: v })}
              />
            </SettingRow>

            {canUseGeo && settings.geofencingEnabled && (
              <GeofenceFields
                key={`${settings.geofencingLatitude}:${settings.geofencingLongitude}:${settings.geofencingRadiusMeters}`}
                settings={settings}
                locating={locating}
                onUseCurrentLocation={useCurrentLocation}
                onSave={save}
                saving={update.isPending}
              />
            )}
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <GlassCardHeader title={t("settings.tapCheckin", "Tap check-in")} />
          <div className="divide-y divide-cream-3/70">
            <SettingRow
              title={t("settings.tapCheckin", "Tap check-in")}
              description={t(
                "settings.tapCheckinDesc",
                "Let staff check in by tapping the workspace link instead of scanning.",
              )}
              locked={!canUseTap}
            >
              <Toggle
                checked={canUseTap && settings.tapCheckinEnabled}
                disabled={!canUseTap || update.isPending}
                onChange={(v) => save({ tapCheckinEnabled: v })}
              />
            </SettingRow>
            <SettingRow
              title={t("settings.nfcCheckin", "NFC check-in")}
              description={t(
                "settings.nfcCheckinDesc",
                "Accept taps from an NFC tag written with your check-in link.",
              )}
              locked={!canUseNfc}
              icon={<Nfc size={14} className="text-amber" />}
            >
              <Toggle
                checked={canUseNfc && settings.nfcCheckinEnabled}
                disabled={!canUseNfc || update.isPending}
                onChange={(v) => save({ nfcCheckinEnabled: v })}
              />
            </SettingRow>
          </div>
        </GlassCard>

        <TelegramCard
          workspaceId={wsId}
          settings={settings}
          canUse={canUseTelegram}
          onSave={save}
          saving={update.isPending}
        />

        <ApiTokensCard workspaceId={wsId} formatDate={fmtDate} />

        <GlassCard hover={false} className="border-red/20">
          <GlassCardHeader title={t("settings.dangerZone", "Danger zone")} />
          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <p className="text-[15px] font-medium text-text-primary">
                {t("settings.deleteWorkspace", "Delete workspace")}
              </p>
              <p className="mt-0.5 text-[13.5px] text-text-tertiary">
                {t(
                  "settings.deleteWorkspaceDesc",
                  "Removes the workspace, its employees, and all attendance history.",
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 rounded-lg bg-red/10 px-4 py-2 text-[15px] font-medium text-red transition-colors hover:bg-red/18"
            >
              <Trash2 size={14} />
              {t("common.delete", "Delete")}
            </button>
          </div>
        </GlassCard>
      </div>

      <ConfirmModal
        open={confirmRegenerate}
        onOpenChange={setConfirmRegenerate}
        title={t("settings.regenerateTokenTitle", "Regenerate workspace token")}
        description={t(
          "settings.regenerateTokenDesc",
          "Every printed QR code stops working immediately. You'll need to print and display the new one.",
        )}
        confirmLabel={t("settings.regenerateToken", "Regenerate token")}
        cancelLabel={t("common.cancel", "Cancel")}
        variant="danger"
        loading={regenerateToken.isPending}
        onConfirm={() =>
          regenerateToken.mutate(wsId, {
            onSuccess: () => {
              toast.success(t("settings.tokenRegenerated", "New QR token generated"));
              setConfirmRegenerate(false);
            },
            onError: () => toast.error(t("settings.saveError", "Failed to save settings")),
          })
        }
      />

      <ConfirmModal
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t("settings.deleteWorkspace", "Delete workspace")}
        description={t(
          "settings.deleteWorkspaceConfirm",
          "Delete {{name}}? Employees, shifts, and attendance history go with it. This cannot be undone.",
          { name: workspace?.name ?? "" },
        )}
        confirmLabel={t("common.delete", "Delete")}
        cancelLabel={t("common.cancel", "Cancel")}
        variant="danger"
        loading={deleteWorkspace.isPending}
        onConfirm={() =>
          deleteWorkspace.mutate(wsId, {
            onSuccess: () => {
              clearWorkspacePublicId();
              // Full reload so every workspace-scoped query starts from a
              // clean slate rather than replaying the deleted workspace.
              window.location.href = "/console/dashboard";
            },
            onError: () => toast.error(t("settings.deleteError", "Failed to delete workspace")),
          })
        }
      />
    </div>
  );
}

function GeofenceFields({
  settings,
  locating,
  onUseCurrentLocation,
  onSave,
  saving,
}: {
  settings: WorkspaceSetting;
  locating: boolean;
  onUseCurrentLocation: () => void;
  onSave: (patch: Partial<WorkspaceSetting>) => void;
  saving: boolean;
}) {
  const { t } = useTranslation();
  // Seeded once per mount; the parent keys this component on the server values
  // so "use current location" remounts it with the fresh coordinates.
  const [lat, setLat] = useState<string>(settings.geofencingLatitude?.toString() ?? "");
  const [lng, setLng] = useState<string>(settings.geofencingLongitude?.toString() ?? "");
  const [radius, setRadius] = useState<string>(
    (settings.geofencingRadiusMeters ?? DEFAULT_GEOFENCE_RADIUS).toString(),
  );

  const radiusNumber = Number(radius) || 0;
  const radiusTooSmall = radiusNumber > 0 && radiusNumber < MIN_GEOFENCE_RADIUS;

  return (
    <div className="space-y-4 p-5">
      <button
        type="button"
        onClick={onUseCurrentLocation}
        disabled={locating}
        className="flex items-center gap-2 rounded-lg border border-cream-3 bg-glass-bg px-4 py-2.5 text-[15px] font-medium text-text-primary transition-all duration-150 hover:bg-cream-3 disabled:opacity-50"
      >
        <Navigation
          size={14}
          className={locating ? "animate-pulse text-amber" : "text-coffee"}
        />
        {locating
          ? t("settings.detectingLocation", "Detecting location...")
          : t("settings.useCurrentLocation", "Use current location")}
      </button>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="geo-lat" className="mb-1 block text-[13px] font-medium text-text-secondary">
            {t("settings.latitude", "Latitude")}
          </label>
          <input
            id="geo-lat"
            name="latitude"
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="11.5564"
            className="w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 font-mono text-[15px] text-text-primary outline-none focus:border-coffee"
          />
        </div>
        <div>
          <label htmlFor="geo-lng" className="mb-1 block text-[13px] font-medium text-text-secondary">
            {t("settings.longitude", "Longitude")}
          </label>
          <input
            id="geo-lng"
            name="longitude"
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="104.9282"
            className="w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 font-mono text-[15px] text-text-primary outline-none focus:border-coffee"
          />
        </div>
        <div>
          <label
            htmlFor="geo-radius"
            className="mb-1 block text-[13px] font-medium text-text-secondary"
          >
            {t("settings.radius", "Radius (meters)")}
          </label>
          <input
            id="geo-radius"
            name="radius"
            type="number"
            min={MIN_GEOFENCE_RADIUS}
            max={5000}
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 font-mono text-[15px] text-text-primary outline-none focus:border-coffee"
          />
          {radiusTooSmall && (
            <p className="mt-1 text-[13px] text-red">
              {t("settings.minRadiusHint", "Minimum 50m — GPS is not accurate below this")}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={saving || radiusTooSmall}
        onClick={() =>
          onSave({
            geofencingLatitude: lat === "" ? null : Number(lat),
            geofencingLongitude: lng === "" ? null : Number(lng),
            geofencingRadiusMeters: radiusNumber || DEFAULT_GEOFENCE_RADIUS,
          })
        }
        className="rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50"
      >
        {t("common.save", "Save")}
      </button>
    </div>
  );
}

function TelegramCard({
  workspaceId,
  settings,
  canUse,
  onSave,
  saving,
}: {
  workspaceId: string;
  settings: WorkspaceSetting;
  canUse: boolean;
  onSave: (patch: Partial<WorkspaceSetting>) => void;
  saving: boolean;
}) {
  const { t } = useTranslation();
  const linkToken = useWorkspaceTelegramLinkToken(workspaceId);
  const testMessage = useTelegramTest(workspaceId);
  const linked = !!settings.telegramChatId;

  return (
    <GlassCard hover={false}>
      <GlassCardHeader
        title={t("settings.telegramTitle", "Telegram notifications")}
        action={
          linked ? <StatusBadge label={t("settings.linkedBadge", "Linked")} variant="green" /> : undefined
        }
      />
      <div className="divide-y divide-cream-3/70">
        <SettingRow
          title={t("settings.telegramEnable", "Send notifications to Telegram")}
          description={t(
            "settings.telegramDesc",
            "Daily summaries and alerts land in a Telegram chat you control.",
          )}
          locked={!canUse}
          icon={<Send size={14} className="text-amber" />}
        >
          <Toggle
            checked={canUse && settings.telegramNotificationsEnabled}
            disabled={!canUse || saving}
            onChange={(v) => onSave({ telegramNotificationsEnabled: v })}
          />
        </SettingRow>

        {canUse && settings.telegramNotificationsEnabled && (
          <>
            <SettingRow
              title={t("settings.telegramCheckinAlerts", "New-device check-in alerts")}
              description={t(
                "settings.telegramCheckinAlertsDesc",
                "Ping the chat when someone checks in from a device they've never used.",
              )}
              locked={false}
            >
              <Toggle
                checked={settings.telegramCheckinAlertsEnabled}
                disabled={saving}
                onChange={(v) => onSave({ telegramCheckinAlertsEnabled: v })}
              />
            </SettingRow>

            <div className="flex flex-wrap items-center gap-2 p-5">
              <button
                type="button"
                disabled={linkToken.isPending}
                onClick={() =>
                  linkToken.mutate(undefined, {
                    onSuccess: (data) => window.open(data.deepLink, "_blank", "noopener"),
                    onError: () =>
                      toast.error(t("settings.telegramLinkError", "Could not start Telegram linking")),
                  })
                }
                className="rounded-lg border border-cream-3 bg-glass-bg px-4 py-2 text-[15px] font-medium text-text-primary transition-colors hover:bg-cream-3 disabled:opacity-50"
              >
                {linked
                  ? t("settings.telegramRelink", "Link a different chat")
                  : t("settings.telegramLink", "Link Telegram chat")}
              </button>
              {linked && (
                <button
                  type="button"
                  disabled={testMessage.isPending}
                  onClick={() =>
                    testMessage.mutate(undefined, {
                      onSuccess: () => toast.success(t("settings.telegramTestSent", "Test message sent")),
                      onError: () =>
                        toast.error(t("settings.telegramTestError", "Could not send the test message")),
                    })
                  }
                  className="rounded-lg border border-cream-3 bg-glass-bg px-4 py-2 text-[15px] font-medium text-text-secondary transition-colors hover:bg-cream-3 disabled:opacity-50"
                >
                  {t("settings.telegramTest", "Send test message")}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </GlassCard>
  );
}

function ApiTokensCard({
  workspaceId,
  formatDate,
}: {
  workspaceId: string;
  formatDate: (iso: string) => string;
}) {
  const { t } = useTranslation();
  const { data: tokens } = useApiTokens(workspaceId);
  const createToken = useCreateApiToken(workspaceId);
  const revokeToken = useRevokeApiToken(workspaceId);
  const [name, setName] = useState("");
  // Held in state because the server never returns the plaintext key again.
  const [created, setCreated] = useState<ApiTokenCreated | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  return (
    <GlassCard hover={false}>
      <GlassCardHeader title={t("settings.apiKeysTitle", "API keys")} />
      <div className="space-y-4 p-5">
        <p className="text-[13.5px] leading-relaxed text-text-tertiary">
          {t(
            "settings.apiKeysDesc",
            "Workspace-scoped keys for BasilBook and other integrations. The key is shown once — store it somewhere safe.",
          )}
        </p>

        <div className="flex gap-2">
          <label htmlFor="api-token-name" className="sr-only">
            {t("settings.apiKeyName", "Key name")}
          </label>
          <input
            id="api-token-name"
            name="apiTokenName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("settings.apiKeyNamePlaceholder", "e.g. BasilBook")}
            className="flex-1 rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[15px] text-text-primary outline-none focus:border-coffee"
          />
          <button
            type="button"
            disabled={createToken.isPending || !name.trim()}
            onClick={() =>
              createToken.mutate(name.trim(), {
                onSuccess: (data) => {
                  setCreated(data);
                  setName("");
                },
                onError: () => toast.error(t("settings.apiKeyCreateError", "Could not create the key")),
              })
            }
            className="flex items-center gap-1.5 rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50"
          >
            <KeyRound size={14} />
            {t("common.create", "Create")}
          </button>
        </div>

        {created && (
          <div className="rounded-xl border border-green/20 bg-green/5 p-4">
            <p className="mb-2 text-[13.5px] font-medium text-green">
              {t("settings.apiKeyCreated", "Copy this key now — it won't be shown again.")}
            </p>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded bg-glass-bg px-2 py-1 font-mono text-[13px] text-text-primary">
                {created.token}
              </code>
              <CopyButton value={created.token} />
            </div>
          </div>
        )}

        {tokens && tokens.length > 0 && (
          <div className="divide-y divide-cream-3/60">
            {tokens.map((token) => (
              <div key={token.publicId} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-text-primary">{token.name}</p>
                  <p className="font-mono text-[12.5px] text-text-tertiary">
                    {token.prefix}…
                    {token.lastUsedAt
                      ? ` · ${t("settings.apiKeyLastUsed", "last used")} ${formatDate(token.lastUsedAt)}`
                      : ` · ${t("settings.apiKeyNeverUsed", "never used")}`}
                  </p>
                </div>
                {token.active ? (
                  <button
                    type="button"
                    onClick={() => setRevokeTarget(token.publicId)}
                    className="rounded-lg px-2.5 py-1 text-[13px] font-medium text-text-tertiary transition-colors hover:bg-red/10 hover:text-red"
                  >
                    {t("settings.apiKeyRevoke", "Revoke")}
                  </button>
                ) : (
                  <StatusBadge label={t("settings.apiKeyRevoked", "Revoked")} variant="gray" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={revokeTarget !== null}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title={t("settings.apiKeysRevokeTitle", "Revoke API key")}
        description={t(
          "settings.apiKeysRevokeDesc",
          "Any integration using this key stops working immediately.",
        )}
        confirmLabel={t("settings.apiKeyRevoke", "Revoke")}
        cancelLabel={t("common.cancel", "Cancel")}
        variant="danger"
        loading={revokeToken.isPending}
        onConfirm={() => {
          if (!revokeTarget) return;
          revokeToken.mutate(revokeTarget, {
            onSuccess: () => setRevokeTarget(null),
            onError: () => toast.error(t("settings.apiKeyRevokeError", "Could not revoke the key")),
          });
        }}
      />
    </GlassCard>
  );
}

function SettingRow({
  title,
  description,
  locked,
  icon,
  children,
}: {
  title: string;
  description: string;
  /** Renders the Espresso pill and greys the control. */
  locked: boolean;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div>
        <p className="flex items-center gap-2 font-medium text-text-primary">
          {icon}
          {title}
          {locked && (
            <span className="rounded-full bg-amber/10 px-2 py-0.5 text-[11px] font-medium text-amber">
              Espresso
            </span>
          )}
        </p>
        <p className={cn("mt-0.5 text-sm text-text-secondary", locked && "opacity-70")}>
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      aria-label={t("common.copy", "Copy")}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          toast.success(t("common.copied", "Copied"));
        } catch {
          toast.error(t("common.copyFailed", "Failed to copy"));
        }
      }}
      className="rounded p-1 text-text-tertiary transition-colors hover:text-coffee"
    >
      <Copy size={13} />
    </button>
  );
}
