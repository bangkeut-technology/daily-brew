"use client";

import { use, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { ArrowLeft, Copy, Search, Trash2 } from "lucide-react";
import { getWorkspacePublicId } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  useDeleteWorkspaceQrCode,
  useUpdateWorkspaceQrCode,
  useWorkspaceQrCode,
  type WorkspaceQrCode,
  type WorkspaceQrCodeInput,
} from "@/hooks/useWorkspaceQr";
import { useEmployees } from "@/hooks/useEmployees";
import { usePlan } from "@/hooks/usePlan";
import { useWorkspaceSettings } from "@/hooks/useWorkspaceSettings";
import { useFeatureEnabled } from "@/hooks/useFeatures";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard, GlassCardHeader } from "@/components/shared/GlassCard";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { Toggle } from "@/components/shared/Toggle";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { CheckinUrlRow } from "@/components/console/CheckinUrlRow";
import { DetailSkeleton } from "@/components/admin/AdminDataStates";

const inputClass =
  "w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[15.5px] text-text-primary outline-none transition-colors focus:border-coffee";

/** Everything the form edits, derived from the server record. */
interface FormState {
  name: string;
  managerPublicId: string;
  assignedIds: Set<string>;
  inheritIp: boolean;
  ipEnabled: boolean;
  allowedIps: string;
  inheritGeo: boolean;
  geoEnabled: boolean;
  geoLat: string;
  geoLng: string;
  geoRadius: string;
  inheritDevice: boolean;
  deviceEnabled: boolean;
}

function stateFrom(qr: WorkspaceQrCode): FormState {
  return {
    name: qr.name,
    managerPublicId: qr.manager?.publicId ?? "",
    assignedIds: new Set(qr.assignedEmployees.map((e) => e.publicId)),
    inheritIp: qr.inheritIpSettings,
    ipEnabled: qr.ipRestrictionEnabled,
    allowedIps: (qr.allowedIps ?? []).join("\n"),
    inheritGeo: qr.inheritGeofencing,
    geoEnabled: qr.geofencingEnabled,
    geoLat: qr.geofencingLatitude?.toString() ?? "",
    geoLng: qr.geofencingLongitude?.toString() ?? "",
    geoRadius: qr.geofencingRadiusMeters?.toString() ?? "100",
    inheritDevice: qr.inheritDeviceVerification,
    deviceEnabled: qr.deviceVerificationEnabled,
  };
}

function isDirty(form: FormState, qr: WorkspaceQrCode): boolean {
  const base = stateFrom(qr);
  if (form.name.trim() !== base.name) return true;
  if (form.managerPublicId !== base.managerPublicId) return true;
  if (form.assignedIds.size !== base.assignedIds.size) return true;
  for (const id of form.assignedIds) if (!base.assignedIds.has(id)) return true;
  return (
    form.inheritIp !== base.inheritIp ||
    form.ipEnabled !== base.ipEnabled ||
    form.allowedIps !== base.allowedIps ||
    form.inheritGeo !== base.inheritGeo ||
    form.geoEnabled !== base.geoEnabled ||
    form.geoLat !== base.geoLat ||
    form.geoLng !== base.geoLng ||
    form.geoRadius !== base.geoRadius ||
    form.inheritDevice !== base.inheritDevice ||
    form.deviceEnabled !== base.deviceEnabled
  );
}

export default function QrCodeDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = use(params);
  const router = useRouter();
  const workspaceId = getWorkspacePublicId() || "";

  const { data: plan } = usePlan(workspaceId);
  const { data: qrCode, isLoading } = useWorkspaceQrCode(workspaceId, publicId);
  const { data: employees } = useEmployees(workspaceId);
  const { data: settings } = useWorkspaceSettings(workspaceId);
  const updateMutation = useUpdateWorkspaceQrCode(workspaceId);
  const deleteMutation = useDeleteWorkspaceQrCode(workspaceId);
  const nfcEnabled = useFeatureEnabled("nfc_checkin");

  const [form, setForm] = useState<FormState | null>(null);
  const [assignedSearch, setAssignedSearch] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  // Seed the form from the server record on first load, and re-seed whenever
  // a different QR is opened. Adjusting during render rather than in an
  // effect keeps this clear of react-hooks/set-state-in-effect.
  const [seededFor, setSeededFor] = useState<string | null>(null);
  if (qrCode && seededFor !== qrCode.publicId) {
    setSeededFor(qrCode.publicId);
    setForm(stateFrom(qrCode));
  }

  const activeEmployees = useMemo(
    () => (employees ?? []).filter((e) => e.active),
    [employees],
  );
  const filteredEmployees = useMemo(() => {
    const q = assignedSearch.trim().toLowerCase();
    if (!q) return activeEmployees;
    return activeEmployees.filter((e) => e.name.toLowerCase().includes(q));
  }, [activeEmployees, assignedSearch]);

  // A per-QR manager needs a linked user account — without one there's nobody
  // to authenticate as the manager.
  const managerOptions = useMemo(
    () => [
      { value: "", label: "No manager" },
      ...activeEmployees
        .filter((e) => e.role === "manager" && e.linkedUserPublicId)
        .map((e) => ({ value: e.publicId, label: e.name })),
    ],
    [activeEmployees],
  );

  if (plan && !plan.canUseSubQrCodes) {
    return (
      <div className="page-enter">
        <PageHeader title="QR code" />
        <GlassCard hover={false} className="p-8 text-center">
          <p className="text-text-secondary">
            Sub QR codes are a Double Espresso feature.
          </p>
          <Link
            href="/console/settings"
            className="mt-4 inline-block rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white no-underline transition-colors hover:bg-coffee-light"
          >
            See plans
          </Link>
        </GlassCard>
      </div>
    );
  }

  if (isLoading || !qrCode || !form) return <DetailSkeleton cards={3} />;

  const patch = (next: Partial<FormState>) => setForm((f) => (f ? { ...f, ...next } : f));

  const toggleAssigned = (id: string) => {
    setForm((f) => {
      if (!f) return f;
      const next = new Set(f.assignedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...f, assignedIds: next };
    });
  };

  const dirty = isDirty(form, qrCode);
  const qrPayload = `dailybrew:wqr:${qrCode.qrToken}`;

  const handleSave = async () => {
    const trimmed = form.name.trim();
    if (!trimmed) {
      toast.error("Name is required");
      return;
    }
    const input: WorkspaceQrCodeInput = {
      name: trimmed,
      managerPublicId: form.managerPublicId || null,
      assignedEmployeePublicIds: Array.from(form.assignedIds),
      inheritIpSettings: form.inheritIp,
      ipRestrictionEnabled: form.ipEnabled,
      allowedIps: form.allowedIps
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0),
      inheritGeofencing: form.inheritGeo,
      geofencingEnabled: form.geoEnabled,
      geofencingLatitude: form.geoLat ? Number.parseFloat(form.geoLat) : null,
      geofencingLongitude: form.geoLng ? Number.parseFloat(form.geoLng) : null,
      geofencingRadiusMeters: form.geoRadius ? Number.parseInt(form.geoRadius, 10) : null,
      inheritDeviceVerification: form.inheritDevice,
      deviceVerificationEnabled: form.deviceEnabled,
    };
    try {
      const updated = await updateMutation.mutateAsync({ publicId, ...input });
      setForm(stateFrom(updated));
      toast.success("QR code updated");
    } catch {
      toast.error("Failed to update QR code");
    }
  };

  return (
    <div className="page-enter">
      <Link
        href="/console/qr-codes"
        className="mb-3 inline-flex items-center gap-1.5 text-[13.5px] text-text-secondary no-underline hover:text-coffee"
      >
        <ArrowLeft size={14} />
        Back to QR codes
      </Link>

      <PageHeader
        title={qrCode.name}
        action={
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[14.5px] font-medium text-red transition-colors hover:bg-red/8"
          >
            <Trash2 size={14} />
            Delete
          </button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard hover={false} className="lg:col-span-1">
          <GlassCardHeader title="QR preview" />
          <div className="flex flex-col items-center gap-4 p-5">
            <div className="rounded-xl border border-cream-3 bg-white p-4">
              <QRCodeSVG value={qrPayload} size={180} level="M" />
            </div>
            <div className="w-full text-center">
              <p className="mb-1.5 text-xs text-text-tertiary">Encoded payload</p>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(qrPayload);
                  toast.success("Copied to clipboard");
                }}
                className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-cream-3/40 px-2.5 py-1.5 font-mono text-[12.5px] text-text-secondary transition-colors hover:bg-cream-3/70"
              >
                <span className="truncate">{qrPayload}</span>
                <Copy size={12} className="flex-shrink-0" />
              </button>
            </div>
            {nfcEnabled && (
              <div className="w-full border-t border-cream-3/60 pt-3">
                <CheckinUrlRow qrToken={qrCode.qrToken} kind="wqr" />
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard hover={false} className="lg:col-span-2">
          <GlassCardHeader title="Identity" />
          <div className="space-y-4 p-5">
            <div>
              <label
                htmlFor="qr-detail-name"
                className="mb-1 block text-[13px] font-medium text-text-secondary"
              >
                Name
              </label>
              <input
                id="qr-detail-name"
                name="name"
                type="text"
                value={form.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="e.g. Floor 1, Kitchen entrance"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="qr-detail-manager"
                className="mb-1 block text-[13px] font-medium text-text-secondary"
              >
                Manager (optional)
              </label>
              <CustomSelect
                id="qr-detail-manager"
                value={form.managerPublicId}
                onChange={(v) => patch({ managerPublicId: v })}
                options={managerOptions}
                placeholder="Select a manager…"
              />
              <p className="mt-1.5 text-[12.5px] text-text-tertiary">
                Manager must have a linked user account. They can approve/reject leave for
                assigned employees.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard hover={false} className="mb-4">
        <GlassCardHeader
          title="Assigned employees"
          action={
            <span className="rounded-full bg-coffee/10 px-2 py-0.5 text-[12.5px] font-medium tabular-nums text-coffee">
              {form.assignedIds.size} assigned
            </span>
          }
        />
        <div className="space-y-3 p-5">
          {activeEmployees.length === 0 ? (
            <p className="text-[13.5px] text-text-tertiary">
              No employees in this workspace yet.
            </p>
          ) : (
            <>
              <div className="relative">
                <label htmlFor="qr-detail-search" className="sr-only">
                  Search employees
                </label>
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                />
                <input
                  id="qr-detail-search"
                  name="search"
                  type="search"
                  value={assignedSearch}
                  onChange={(e) => setAssignedSearch(e.target.value)}
                  placeholder="Search employees…"
                  className={cn(inputClass, "pl-9")}
                />
              </div>
              <div className="-mx-1 max-h-[420px] space-y-1 overflow-y-auto px-1">
                {filteredEmployees.length === 0 ? (
                  <p className="px-3 py-2 text-[13px] text-text-tertiary">
                    No employees match your search.
                  </p>
                ) : (
                  filteredEmployees.map((e) => (
                    <div
                      key={e.publicId}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-cream-3/40"
                    >
                      <span className="flex-1 truncate text-[14.5px] text-text-primary">
                        {e.name}
                      </span>
                      {e.shiftName && (
                        <span className="text-xs text-text-tertiary">{e.shiftName}</span>
                      )}
                      <Toggle
                        checked={form.assignedIds.has(e.publicId)}
                        onChange={() => toggleAssigned(e.publicId)}
                      />
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </GlassCard>

      <div className="mb-4 space-y-4">
        <SettingSection
          title="IP restriction"
          description="Only allow check-in via this QR from listed network addresses (e.g. your restaurant Wi-Fi)."
          inherited={form.inheritIp}
          onInheritChange={(v) => patch({ inheritIp: v })}
          workspaceEnabled={!!settings?.ipRestrictionEnabled}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-primary">Enable</span>
            <Toggle checked={form.ipEnabled} onChange={(v) => patch({ ipEnabled: v })} />
          </div>
          <div>
            <label
              htmlFor="qr-detail-ips"
              className="mb-1 block text-[13px] font-medium text-text-secondary"
            >
              Allowed IPs (one per line)
            </label>
            <textarea
              id="qr-detail-ips"
              name="allowedIps"
              value={form.allowedIps}
              onChange={(e) => patch({ allowedIps: e.target.value })}
              rows={3}
              placeholder="192.168.1.1"
              className={cn(inputClass, "font-mono")}
            />
          </div>
        </SettingSection>

        <SettingSection
          title="Geofencing"
          description="Require employees to be physically near a coordinate to check in via this QR. Useful for sectioning floors or outdoor areas. Radius minimum is 50 meters."
          inherited={form.inheritGeo}
          onInheritChange={(v) => patch({ inheritGeo: v })}
          workspaceEnabled={!!settings?.geofencingEnabled}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-primary">Enable</span>
            <Toggle checked={form.geoEnabled} onChange={(v) => patch({ geoEnabled: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="qr-detail-lat"
                className="mb-1 block text-[13px] font-medium text-text-secondary"
              >
                Latitude
              </label>
              <input
                id="qr-detail-lat"
                name="latitude"
                type="number"
                step="any"
                value={form.geoLat}
                onChange={(e) => patch({ geoLat: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="qr-detail-lng"
                className="mb-1 block text-[13px] font-medium text-text-secondary"
              >
                Longitude
              </label>
              <input
                id="qr-detail-lng"
                name="longitude"
                type="number"
                step="any"
                value={form.geoLng}
                onChange={(e) => patch({ geoLng: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="qr-detail-radius"
              className="mb-1 block text-[13px] font-medium text-text-secondary"
            >
              Radius (meters, min 50)
            </label>
            <input
              id="qr-detail-radius"
              name="radius"
              type="number"
              min={50}
              value={form.geoRadius}
              onChange={(e) => patch({ geoRadius: e.target.value })}
              className={inputClass}
            />
          </div>
        </SettingSection>

        <SettingSection
          title="Device verification"
          description="Bind check-in/out to a single device per employee per day. Prevents one phone from punching in multiple employees and forces check-out from the same device used for check-in."
          inherited={form.inheritDevice}
          onInheritChange={(v) => patch({ inheritDevice: v })}
          workspaceEnabled={!!settings?.deviceVerificationEnabled}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-primary">Enable</span>
            <Toggle checked={form.deviceEnabled} onChange={(v) => patch({ deviceEnabled: v })} />
          </div>
        </SettingSection>
      </div>

      {dirty && (
        <div className="sticky bottom-4 z-10 flex items-center justify-between rounded-2xl border border-glass-border bg-glass-bg px-4 py-3 shadow-[0_8px_30px_rgba(107,66,38,0.10)] backdrop-blur-md">
          <span className="text-[13.5px] text-text-secondary">You have unsaved changes</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setForm(stateFrom(qrCode))}
              className="rounded-lg border border-cream-3 px-4 py-2 text-[14.5px] font-medium text-text-secondary transition-colors hover:bg-cream-3/40"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="rounded-lg bg-coffee px-4 py-2 text-[14.5px] font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50"
            >
              {updateMutation.isPending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete QR code"
        description={`Delete ${qrCode.name}? Employees assigned to it will lose access. This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          try {
            await deleteMutation.mutateAsync(publicId);
            toast.success("QR code deleted");
            router.push("/console/qr-codes");
          } catch {
            toast.error("Failed to delete QR code");
          }
        }}
      />
    </div>
  );
}

/**
 * A per-QR override block. "Same as workspace" on means the workspace value
 * applies and the override fields are hidden entirely — the wording is
 * deliberately not "inherit"/"override".
 */
function SettingSection({
  title,
  description,
  inherited,
  onInheritChange,
  workspaceEnabled,
  children,
}: {
  title: string;
  description: string;
  inherited: boolean;
  onInheritChange: (v: boolean) => void;
  workspaceEnabled: boolean;
  children: ReactNode;
}) {
  return (
    <GlassCard hover={false}>
      <GlassCardHeader
        title={title}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12.5px] text-text-secondary">Same as workspace</span>
            <Toggle checked={inherited} onChange={onInheritChange} />
          </div>
        }
      />
      <p className="px-5 pb-2 pt-3 text-[13px] leading-relaxed text-text-secondary">
        {description}
      </p>
      {inherited ? (
        <div className="px-5 pb-4">
          <div className="flex items-center gap-1.5 text-[12.5px] text-text-tertiary">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                workspaceEnabled ? "bg-green" : "bg-text-tertiary/60",
              )}
            />
            {workspaceEnabled
              ? "Currently turned on at the workspace level"
              : "Currently turned off at the workspace level"}
          </div>
        </div>
      ) : (
        <div className="space-y-3 p-5 pt-2">
          <p className="text-[12.5px] text-text-tertiary">
            Custom rules for this QR — workspace settings are ignored.
          </p>
          {children}
        </div>
      )}
    </GlassCard>
  );
}
