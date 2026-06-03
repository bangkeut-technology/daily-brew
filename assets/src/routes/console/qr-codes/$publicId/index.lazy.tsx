import { createLazyFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Copy, Search, Trash2 } from 'lucide-react';
import {
  useDeleteWorkspaceQrCode,
  useUpdateWorkspaceQrCode,
  useWorkspaceQrCode,
} from '@/hooks/queries/useWorkspaceQrCodes';
import { useEmployees } from '@/hooks/queries/useEmployees';
import { usePlan } from '@/hooks/queries/usePlan';
import { useWorkspaceSettings } from '@/hooks/queries/useWorkspaces';
import { getWorkspacePublicId } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { Toggle } from '@/components/shared/Toggle';
import { CustomSelect } from '@/components/shared/CustomSelect';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { CheckinUrlRow } from '@/components/shared/CheckinUrlRow';
import { useFeatureEnabled } from '@/hooks/queries/useFeatures';
import type { WorkspaceQrCode, WorkspaceQrCodeInput } from '@/types';

export const Route = createLazyFileRoute('/console/qr-codes/$publicId/')({
  component: QrCodeDetailPage,
});

function QrCodeDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { publicId } = Route.useParams();
  const workspaceId = getWorkspacePublicId() || '';

  const { data: plan } = usePlan(workspaceId);
  const { data: qrCode, isLoading } = useWorkspaceQrCode(workspaceId, publicId);
  const { data: employees } = useEmployees(workspaceId);
  const { data: settings } = useWorkspaceSettings(workspaceId);
  const updateMutation = useUpdateWorkspaceQrCode(workspaceId);
  const deleteMutation = useDeleteWorkspaceQrCode(workspaceId);
  const nfcEnabled = useFeatureEnabled('nfc_checkin');

  // Plan gate
  useEffect(() => {
    if (plan && !plan.canUseSubQrCodes) {
      toast.error(t('qrCodes.planGate', 'Multiple QR codes require the Double Espresso plan'));
      navigate({ to: '/console/settings' });
    }
  }, [plan, navigate, t]);

  // Form state
  const [name, setName] = useState('');
  const [managerPublicId, setManagerPublicId] = useState<string>('');
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set());
  const [inheritIp, setInheritIp] = useState(true);
  const [ipEnabled, setIpEnabled] = useState(false);
  const [allowedIps, setAllowedIps] = useState('');
  const [inheritGeo, setInheritGeo] = useState(true);
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [geoLat, setGeoLat] = useState('');
  const [geoLng, setGeoLng] = useState('');
  const [geoRadius, setGeoRadius] = useState('100');
  const [inheritDevice, setInheritDevice] = useState(true);
  const [deviceEnabled, setDeviceEnabled] = useState(false);
  const [assignedSearch, setAssignedSearch] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  // Hydrate state from server data
  useEffect(() => {
    if (!qrCode) return;
    setName(qrCode.name);
    setManagerPublicId(qrCode.manager?.publicId ?? '');
    setAssignedIds(new Set(qrCode.assignedEmployees.map((e) => e.publicId)));
    setInheritIp(qrCode.inheritIpSettings);
    setIpEnabled(qrCode.ipRestrictionEnabled);
    setAllowedIps((qrCode.allowedIps ?? []).join('\n'));
    setInheritGeo(qrCode.inheritGeofencing);
    setGeoEnabled(qrCode.geofencingEnabled);
    setGeoLat(qrCode.geofencingLatitude?.toString() ?? '');
    setGeoLng(qrCode.geofencingLongitude?.toString() ?? '');
    setGeoRadius(qrCode.geofencingRadiusMeters?.toString() ?? '100');
    setInheritDevice(qrCode.inheritDeviceVerification);
    setDeviceEnabled(qrCode.deviceVerificationEnabled);
  }, [qrCode]);

  const activeEmployees = useMemo(
    () => (employees ?? []).filter((e) => e.active),
    [employees],
  );

  const filteredEmployees = useMemo(() => {
    const q = assignedSearch.trim().toLowerCase();
    if (!q) return activeEmployees;
    return activeEmployees.filter((e) => e.name.toLowerCase().includes(q));
  }, [activeEmployees, assignedSearch]);

  const eligibleManagers = useMemo(
    () => (employees ?? []).filter((e) => e.linkedUserPublicId !== null && e.active),
    [employees],
  );

  const managerOptions = useMemo(
    () => [
      { value: '', label: t('qrCodes.noManager', 'No manager') },
      ...eligibleManagers.map((e) => ({ value: e.publicId, label: e.name })),
    ],
    [eligibleManagers, t],
  );

  if (!plan?.canUseSubQrCodes) return null;

  if (isLoading || !qrCode) {
    return (
      <div className="page-enter">
        <PageHeader title={t('qrCodes.detail', 'QR code')} />
        <div className="flex items-center justify-center py-12">
          <p className="text-[15px] text-text-tertiary">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const toggleAssigned = (id: string) => {
    setAssignedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isDirty = (() => {
    if (name.trim() !== qrCode.name) return true;
    if ((managerPublicId || null) !== (qrCode.manager?.publicId ?? null)) return true;
    const currentAssigned = new Set(qrCode.assignedEmployees.map((e) => e.publicId));
    if (currentAssigned.size !== assignedIds.size) return true;
    for (const id of assignedIds) if (!currentAssigned.has(id)) return true;
    if (inheritIp !== qrCode.inheritIpSettings) return true;
    if (ipEnabled !== qrCode.ipRestrictionEnabled) return true;
    const currentIps = (qrCode.allowedIps ?? []).join('\n');
    if (allowedIps !== currentIps) return true;
    if (inheritGeo !== qrCode.inheritGeofencing) return true;
    if (geoEnabled !== qrCode.geofencingEnabled) return true;
    if ((geoLat || '') !== (qrCode.geofencingLatitude?.toString() ?? '')) return true;
    if ((geoLng || '') !== (qrCode.geofencingLongitude?.toString() ?? '')) return true;
    if ((geoRadius || '100') !== (qrCode.geofencingRadiusMeters?.toString() ?? '100')) return true;
    if (inheritDevice !== qrCode.inheritDeviceVerification) return true;
    if (deviceEnabled !== qrCode.deviceVerificationEnabled) return true;
    return false;
  })();

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error(t('qrCodes.nameRequired', 'Name is required'));
      return;
    }
    const input: WorkspaceQrCodeInput = {
      name: trimmed,
      managerPublicId: managerPublicId || null,
      assignedEmployeePublicIds: Array.from(assignedIds),
      inheritIpSettings: inheritIp,
      ipRestrictionEnabled: ipEnabled,
      allowedIps: allowedIps.split('\n').map((l) => l.trim()).filter((l) => l.length > 0),
      inheritGeofencing: inheritGeo,
      geofencingEnabled: geoEnabled,
      geofencingLatitude: geoLat ? Number.parseFloat(geoLat) : null,
      geofencingLongitude: geoLng ? Number.parseFloat(geoLng) : null,
      geofencingRadiusMeters: geoRadius ? Number.parseInt(geoRadius, 10) : null,
      inheritDeviceVerification: inheritDevice,
      deviceVerificationEnabled: deviceEnabled,
    };
    try {
      await updateMutation.mutateAsync({ publicId, ...input });
      toast.success(t('qrCodes.updateSuccess', 'QR code updated'));
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? t('qrCodes.updateError', 'Failed to update QR code'));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(publicId);
      toast.success(t('qrCodes.deleteSuccess', 'QR code deleted'));
      navigate({ to: '/console/qr-codes' });
    } catch {
      toast.error(t('qrCodes.deleteError', 'Failed to delete QR code'));
    }
  };

  const qrPayload = `dailybrew:wqr:${qrCode.qrToken}`;
  const inputClass = 'w-full px-3 py-2 rounded-lg text-[15.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee transition-colors';

  return (
    <div className="page-enter">
      <Link
        to="/console/qr-codes"
        className="inline-flex items-center gap-1.5 text-[13.5px] text-text-secondary hover:text-coffee mb-3 no-underline"
      >
        <ArrowLeft size={14} />
        {t('qrCodes.backToList', 'Back to QR codes')}
      </Link>

      <PageHeader
        title={qrCode.name}
        action={
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[14.5px] font-medium bg-glass-bg border border-cream-3 text-red cursor-pointer hover:bg-red/8 transition-colors"
          >
            <Trash2 size={14} />
            {t('common.delete', 'Delete')}
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* QR preview */}
        <GlassCard hover={false} className="lg:col-span-1">
          <GlassCardHeader title={t('qrCodes.qrPreview', 'QR preview')} />
          <div className="p-5 flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-xl border border-cream-3">
              <QRCodeSVG value={qrPayload} size={180} level="M" />
            </div>
            <div className="text-center w-full">
              <p className="text-[12px] text-text-tertiary mb-1.5">
                {t('qrCodes.payload', 'Encoded payload')}
              </p>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(qrPayload);
                  toast.success(t('qrCodes.payloadCopied', 'Copied to clipboard'));
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cream-3/40 text-[12.5px] font-mono text-text-secondary border-none cursor-pointer hover:bg-cream-3/70 transition-colors"
              >
                <span className="truncate max-w-[200px]">{qrPayload}</span>
                <Copy size={12} className="flex-shrink-0" />
              </button>
            </div>
            {nfcEnabled && (
              <div className="w-full pt-3 border-t border-cream-3/60">
                <CheckinUrlRow qrToken={qrCode.qrToken} kind="wqr" />
              </div>
            )}
          </div>
        </GlassCard>

        {/* Identity */}
        <GlassCard hover={false} className="lg:col-span-2">
          <GlassCardHeader title={t('qrCodes.identity', 'Identity')} />
          <div className="p-5 space-y-4">
            <div>
              <label htmlFor="qr-detail-name" className="block text-[13px] font-medium text-text-secondary mb-1">
                {t('qrCodes.name', 'Name')}
              </label>
              <input
                id="qr-detail-name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('qrCodes.namePlaceholder', 'e.g. Floor 1, Kitchen entrance')}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="qr-detail-manager" className="block text-[13px] font-medium text-text-secondary mb-1">
                {t('qrCodes.manager', 'Manager (optional)')}
              </label>
              <CustomSelect
                value={managerPublicId}
                onChange={setManagerPublicId}
                options={managerOptions}
                placeholder={t('qrCodes.selectManager', 'Select a manager…')}
              />
              <p className="text-[12.5px] text-text-tertiary mt-1.5">
                {t('qrCodes.managerHint', 'Manager must have a linked user account. They can approve/reject leave for assigned employees.')}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Assigned employees */}
      <GlassCard hover={false} className="mb-4">
        <GlassCardHeader
          title={t('qrCodes.assignedEmployees', 'Assigned employees')}
          action={
            <span className="text-[12.5px] px-2 py-0.5 rounded-full bg-coffee/10 text-coffee font-medium tabular-nums">
              {t('qrCodes.assignedCount', '{{count}} assigned', { count: assignedIds.size })}
            </span>
          }
        />
        <div className="p-5 space-y-3">
          {activeEmployees.length === 0 ? (
            <p className="text-[13.5px] text-text-tertiary">
              {t('qrCodes.noEmployees', 'No employees in this workspace yet.')}
            </p>
          ) : (
            <>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                <input
                  id="qr-detail-search"
                  name="search"
                  type="text"
                  value={assignedSearch}
                  onChange={(e) => setAssignedSearch(e.target.value)}
                  placeholder={t('qrCodes.searchEmployees', 'Search employees…')}
                  className={cn(inputClass, 'pl-9')}
                />
              </div>
              <div className="space-y-1 max-h-[420px] overflow-y-auto -mx-1 px-1">
                {filteredEmployees.length === 0 ? (
                  <p className="text-[13px] text-text-tertiary px-3 py-2">
                    {t('qrCodes.noSearchResults', 'No employees match your search.')}
                  </p>
                ) : (
                  filteredEmployees.map((e) => (
                    <div
                      key={e.publicId}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-cream-3/40 transition-colors"
                    >
                      <span className="text-[14.5px] text-text-primary flex-1 truncate">{e.name}</span>
                      {e.shiftName && (
                        <span className="text-[12px] text-text-tertiary">{e.shiftName}</span>
                      )}
                      <Toggle
                        checked={assignedIds.has(e.publicId)}
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

      {/* Settings */}
      <div className="space-y-4 mb-4">
        <SettingSection
          title={t('qrCodes.ipRestriction', 'IP restriction')}
          description={t(
            'qrCodes.ipRestrictionDesc',
            'Only allow check-in via this QR from listed network addresses (e.g. your restaurant Wi-Fi).',
          )}
          inherited={inheritIp}
          onInheritChange={setInheritIp}
          workspaceEnabled={!!settings?.ipRestrictionEnabled}
        >
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-text-primary">{t('qrCodes.enable', 'Enable')}</span>
            <Toggle checked={ipEnabled} onChange={setIpEnabled} />
          </div>
          <div>
            <label htmlFor="qr-detail-ips" className="block text-[13px] font-medium text-text-secondary mb-1">
              {t('qrCodes.allowedIps', 'Allowed IPs (one per line)')}
            </label>
            <textarea
              id="qr-detail-ips"
              name="allowedIps"
              value={allowedIps}
              onChange={(e) => setAllowedIps(e.target.value)}
              rows={3}
              className={cn(inputClass, 'font-mono')}
              placeholder="192.168.1.1"
            />
          </div>
        </SettingSection>

        <SettingSection
          title={t('qrCodes.geofencing', 'Geofencing')}
          description={t(
            'qrCodes.geofencingDesc',
            'Require employees to be physically near a coordinate to check in via this QR. Useful for sectioning floors or outdoor areas. Radius minimum is 50 meters.',
          )}
          inherited={inheritGeo}
          onInheritChange={setInheritGeo}
          workspaceEnabled={!!settings?.geofencingEnabled}
        >
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-text-primary">{t('qrCodes.enable', 'Enable')}</span>
            <Toggle checked={geoEnabled} onChange={setGeoEnabled} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="qr-detail-lat" className="block text-[13px] font-medium text-text-secondary mb-1">
                {t('qrCodes.latitude', 'Latitude')}
              </label>
              <input
                id="qr-detail-lat"
                name="latitude"
                type="number"
                step="any"
                value={geoLat}
                onChange={(e) => setGeoLat(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="qr-detail-lng" className="block text-[13px] font-medium text-text-secondary mb-1">
                {t('qrCodes.longitude', 'Longitude')}
              </label>
              <input
                id="qr-detail-lng"
                name="longitude"
                type="number"
                step="any"
                value={geoLng}
                onChange={(e) => setGeoLng(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="qr-detail-radius" className="block text-[13px] font-medium text-text-secondary mb-1">
              {t('qrCodes.radiusMeters', 'Radius (meters, min 50)')}
            </label>
            <input
              id="qr-detail-radius"
              name="radius"
              type="number"
              min={50}
              value={geoRadius}
              onChange={(e) => setGeoRadius(e.target.value)}
              className={inputClass}
            />
          </div>
        </SettingSection>

        <SettingSection
          title={t('qrCodes.deviceVerification', 'Device verification')}
          description={t(
            'qrCodes.deviceVerificationDesc',
            'Bind check-in/out to a single device per employee per day. Prevents one phone from punching in multiple employees and forces check-out from the same device used for check-in.',
          )}
          inherited={inheritDevice}
          onInheritChange={setInheritDevice}
          workspaceEnabled={!!settings?.deviceVerificationEnabled}
        >
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-text-primary">{t('qrCodes.enable', 'Enable')}</span>
            <Toggle checked={deviceEnabled} onChange={setDeviceEnabled} />
          </div>
        </SettingSection>
      </div>

      {/* Sticky save bar */}
      {isDirty && (
        <div className="sticky bottom-4 z-10 bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl shadow-[0_8px_30px_rgba(107,66,38,0.10)] px-4 py-3 flex items-center justify-between">
          <span className="text-[13.5px] text-text-secondary">
            {t('qrCodes.unsavedChanges', 'You have unsaved changes')}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (qrCode) {
                  setName(qrCode.name);
                  setManagerPublicId(qrCode.manager?.publicId ?? '');
                  setAssignedIds(new Set(qrCode.assignedEmployees.map((e) => e.publicId)));
                  setInheritIp(qrCode.inheritIpSettings);
                  setIpEnabled(qrCode.ipRestrictionEnabled);
                  setAllowedIps((qrCode.allowedIps ?? []).join('\n'));
                  setInheritGeo(qrCode.inheritGeofencing);
                  setGeoEnabled(qrCode.geofencingEnabled);
                  setGeoLat(qrCode.geofencingLatitude?.toString() ?? '');
                  setGeoLng(qrCode.geofencingLongitude?.toString() ?? '');
                  setGeoRadius(qrCode.geofencingRadiusMeters?.toString() ?? '100');
                  setInheritDevice(qrCode.inheritDeviceVerification);
                  setDeviceEnabled(qrCode.deviceVerificationEnabled);
                }
              }}
              className="px-4 py-2 rounded-lg text-[14.5px] font-medium bg-transparent border border-cream-3 text-text-secondary cursor-pointer hover:bg-cream-3/40 transition-colors"
            >
              {t('common.discard', 'Discard')}
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="px-4 py-2 rounded-lg text-[14.5px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50 transition-colors"
            >
              {updateMutation.isPending ? t('common.loading') : t('common.save', 'Save changes')}
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={showDelete}
        onOpenChange={setShowDelete}
        title={t('qrCodes.deleteTitle', 'Delete QR code')}
        description={t('qrCodes.deleteConfirm', 'Delete {{name}}? Employees assigned to it will lose access. This cannot be undone.', { name: qrCode.name })}
        confirmLabel={t('common.delete', 'Delete')}
        cancelLabel={t('common.cancel', 'Cancel')}
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

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
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <GlassCard hover={false}>
      <GlassCardHeader
        title={title}
        action={
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-text-secondary">
              {t('qrCodes.sameAsWorkspace', 'Same as workspace')}
            </span>
            <Toggle checked={inherited} onChange={onInheritChange} />
          </div>
        }
      />
      <p className="px-5 pt-3 pb-2 text-[13px] text-text-secondary leading-relaxed">
        {description}
      </p>
      {inherited ? (
        <div className="px-5 pb-4">
          <div className="text-[12.5px] text-text-tertiary flex items-center gap-1.5">
            <span className={cn('w-1.5 h-1.5 rounded-full', workspaceEnabled ? 'bg-green' : 'bg-text-tertiary/60')} />
            {workspaceEnabled
              ? t('qrCodes.workspaceOn', 'Currently turned on at the workspace level')
              : t('qrCodes.workspaceOff', 'Currently turned off at the workspace level')}
          </div>
        </div>
      ) : (
        <div className="p-5 pt-2 space-y-3">
          <p className="text-[12.5px] text-text-tertiary">
            {t('qrCodes.customForThisQr', 'Custom rules for this QR — workspace settings are ignored.')}
          </p>
          {children}
        </div>
      )}
    </GlassCard>
  );
}
