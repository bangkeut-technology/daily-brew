import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { Crown, Check, MapPin, Navigation, Smartphone, Building2, Users, Calendar, Plus, X } from 'lucide-react';
import { UpgradeModal } from '@/components/shared/UpgradeModal';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import {
  useWorkspaces,
  useCreateWorkspace,
  useWorkspaceSettings,
  useUpdateWorkspaceSettings,
} from '@/hooks/queries/useWorkspaces';
import { usePlan } from '@/hooks/queries/usePlan';
import { useEmployees } from '@/hooks/queries/useEmployees';
import { useShifts } from '@/hooks/queries/useShifts';
import { getWorkspacePublicId, setWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CustomSelect } from '@/components/shared/CustomSelect';
import { Toggle } from '@/components/shared/Toggle';

export const Route = createFileRoute('/console/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useTranslation();
  const currentWsId = getWorkspacePublicId() || '';
  const { data: workspaces } = useWorkspaces();
  const createWs = useCreateWorkspace();
  const { data: settings } = useWorkspaceSettings(currentWsId);
  const updateSettings = useUpdateWorkspaceSettings(currentWsId);
  const { data: plan } = usePlan(currentWsId);
  const { data: employees } = useEmployees(currentWsId);
  const { data: shifts } = useShifts(currentWsId);
  const upgradeModal = useUpgradeModal();
  const [wsModalOpen, setWsModalOpen] = useState(false);

  const [ipEnabled, setIpEnabled] = useState(false);
  const [allowedIps, setAllowedIps] = useState('');
  const [timezone, setTimezone] = useState('Asia/Phnom_Penh');
  const [locale, setLocale] = useState('en');
  const [newWsName, setNewWsName] = useState('');

  // Device verification state
  const [deviceVerificationEnabled, setDeviceVerificationEnabled] = useState(false);

  // Geofencing state
  const [geofencingEnabled, setGeofencingEnabled] = useState(false);
  const [geofencingLat, setGeofencingLat] = useState<number | null>(null);
  const [geofencingLng, setGeofencingLng] = useState<number | null>(null);
  const [geofencingRadius, setGeofencingRadius] = useState<number>(100);
  const [locatingPosition, setLocatingPosition] = useState(false);

  useEffect(() => {
    if (settings) {
      setIpEnabled(settings.ipRestrictionEnabled);
      setAllowedIps(settings.allowedIps?.join('\n') || '');
      setTimezone(settings.timezone);
      setLocale(settings.locale);
      setDeviceVerificationEnabled(settings.deviceVerificationEnabled);
      setGeofencingEnabled(settings.geofencingEnabled);
      setGeofencingLat(settings.geofencingLatitude);
      setGeofencingLng(settings.geofencingLongitude);
      setGeofencingRadius(settings.geofencingRadiusMeters ?? 100);
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    try {
      await updateSettings.mutateAsync({
        ipRestrictionEnabled: ipEnabled,
        allowedIps: allowedIps
          .split('\n')
          .map((ip) => ip.trim())
          .filter(Boolean),
        deviceVerificationEnabled,
        timezone,
        locale,
        geofencingEnabled,
        geofencingLatitude: geofencingEnabled ? geofencingLat : null,
        geofencingLongitude: geofencingEnabled ? geofencingLng : null,
        geofencingRadiusMeters: geofencingEnabled ? geofencingRadius : null,
      });
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ws = await createWs.mutateAsync(newWsName);
      setWorkspacePublicId(ws.publicId);
      setNewWsName('');
      toast.success('Workspace created');
      window.location.reload();
    } catch {
      toast.error('Failed to create workspace');
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setLocatingPosition(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeofencingLat(parseFloat(position.coords.latitude.toFixed(6)));
        setGeofencingLng(parseFloat(position.coords.longitude.toFixed(6)));
        setLocatingPosition(false);
        toast.success('Location detected');
      },
      (error) => {
        setLocatingPosition(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location permission denied');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information unavailable');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out');
            break;
          default:
            toast.error('Failed to get location');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="page-enter">
      <PageHeader title={t('nav.settings')} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan card */}
        {currentWsId && plan && (
          <GlassCard hover={false} className="lg:col-span-2">
            <GlassCardHeader
              title="Plan"
              action={
                <StatusBadge
                  label={plan.planLabel}
                  variant={plan.isEspresso ? 'green' : 'gray'}
                />
              }
            />
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Free plan */}
                <div
                  className={`rounded-xl border-2 p-5 transition-colors ${
                    !plan.isEspresso
                      ? 'border-coffee bg-coffee/5'
                      : 'border-cream-3 bg-glass-bg'
                  }`}
                >
                  <h3 className="text-[15px] font-semibold text-text-primary mb-1">Free</h3>
                  <p className="text-[12px] text-text-tertiary mb-4">Get started</p>
                  <ul className="space-y-2">
                    {[
                      'Up to 5 employees',
                      'QR code check-in',
                      'Shift management',
                      'Closure management',
                      'Dashboard & attendance log',
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[12.5px] text-text-secondary">
                        <Check size={14} className="text-green flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {!plan.isEspresso && (
                    <div className="mt-4 text-[11px] text-text-tertiary">
                      {plan.remainingEmployeeSlots !== null &&
                        `${plan.remainingEmployeeSlots} employee slot${plan.remainingEmployeeSlots !== 1 ? 's' : ''} remaining`}
                    </div>
                  )}
                </div>

                {/* Espresso plan */}
                <div
                  className={`rounded-xl border-2 p-5 relative overflow-hidden transition-colors ${
                    plan.isEspresso
                      ? 'border-amber bg-amber/5'
                      : 'border-cream-3 bg-glass-bg'
                  }`}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber to-amber-light" />
                  <div className="flex items-center gap-2 mb-1">
                    <Crown size={16} className="text-amber" />
                    <h3 className="text-[15px] font-semibold text-text-primary">Espresso</h3>
                  </div>
                  <p className="text-[12px] text-text-tertiary mb-4">Everything you need</p>
                  <ul className="space-y-2">
                    {[
                      'Unlimited employees',
                      'IP restriction for check-in',
                      'Device verification for check-in',
                      'Geofencing for check-in',
                      'Per-day shift schedules',
                      'Leave request management',
                      'Everything in Free',
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[12.5px] text-text-secondary">
                        <Check size={14} className="text-amber flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {!plan.isEspresso && (
                    <button className="mt-4 w-full px-4 py-2.5 rounded-lg text-[13px] font-semibold bg-gradient-to-r from-amber to-coffee text-white border-none cursor-pointer transition-all hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(193,127,59,0.3)]">
                      Upgrade to Espresso
                    </button>
                  )}
                  {plan.isEspresso && plan.currentPeriodEnd && (
                    <div className="mt-4 text-[11px] text-text-tertiary">
                      Renews {new Date(plan.currentPeriodEnd).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Workspace selector */}
        <GlassCard hover={false}>
          <GlassCardHeader
            title={t('workspace.label')}
            action={
              <button
                onClick={() => setWsModalOpen(true)}
                className="flex items-center gap-1 text-[11.5px] font-medium text-coffee hover:text-coffee-light bg-transparent border-none cursor-pointer transition-colors"
              >
                <Plus size={12} />
                {t('workspace.create')}
              </button>
            }
          />
          <div className="p-5 space-y-3">
            {workspaces?.map((ws) => {
              const isCurrent = ws.publicId === currentWsId;
              const wsEmployeeCount = isCurrent ? (employees?.length ?? 0) : 0;
              const wsShiftCount = isCurrent ? (shifts?.length ?? 0) : 0;
              return (
                <button
                  key={ws.publicId}
                  onClick={() => {
                    if (!isCurrent) {
                      setWorkspacePublicId(ws.publicId);
                      window.location.reload();
                    }
                  }}
                  className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                    isCurrent
                      ? 'border-coffee bg-coffee/5 cursor-default'
                      : 'border-cream-3 bg-glass-bg cursor-pointer hover:border-coffee/40 hover:-translate-y-px'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-coffee/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[13px] font-semibold text-coffee">
                        {ws.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13.5px] font-medium text-text-primary truncate">
                          {ws.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-medium px-1.5 py-px rounded-full bg-coffee/10 text-coffee flex-shrink-0">
                            {t('common.current', 'Current')}
                          </span>
                        )}
                      </div>
                      {ws.createdAt && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Calendar size={10} className="text-text-tertiary" />
                          <span className="text-[10.5px] text-text-tertiary">
                            {new Date(ws.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    {isCurrent && plan && (
                      <StatusBadge
                        label={plan.planLabel}
                        variant={plan.isEspresso ? 'green' : 'gray'}
                      />
                    )}
                  </div>

                  {isCurrent && (
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-cream-3/60">
                      <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-text-tertiary" />
                        <span className="text-[11.5px] text-text-secondary">
                          {wsEmployeeCount} {t('nav.employees').toLowerCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 size={12} className="text-text-tertiary" />
                        <span className="text-[11.5px] text-text-secondary">
                          {wsShiftCount} {t('nav.shifts').toLowerCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* Create workspace modal */}
        <Dialog.Root open={wsModalOpen} onOpenChange={(v) => { setWsModalOpen(v); if (!v) setNewWsName(''); }}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-[400px] bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-coffee/10 flex items-center justify-center">
                    <Building2 size={20} className="text-coffee" />
                  </div>
                  <div>
                    <Dialog.Title className="text-[16px] font-semibold text-text-primary font-serif">
                      {t('workspace.create')}
                    </Dialog.Title>
                    <Dialog.Description className="text-[12px] text-text-secondary">
                      {t('workspace.newPlaceholder')}
                    </Dialog.Description>
                  </div>
                </div>
                <form onSubmit={handleCreateWorkspace}>
                  <input
                    type="text"
                    value={newWsName}
                    onChange={(e) => setNewWsName(e.target.value)}
                    placeholder={t('workspace.newPlaceholder')}
                    autoFocus
                    required
                    className="w-full px-3 py-2.5 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition-all mb-4"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setWsModalOpen(false); setNewWsName(''); }}
                      className="px-4 py-2 rounded-lg text-[13px] font-medium bg-transparent text-text-secondary border border-cream-3 cursor-pointer hover:bg-cream-3 transition-colors"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={createWs.isPending || !newWsName.trim()}
                      className="px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50 transition-colors"
                    >
                      {createWs.isPending ? t('common.loading') : t('common.create')}
                    </button>
                  </div>
                </form>
              </div>
              <Dialog.Close className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center bg-transparent border-none text-text-tertiary hover:text-text-secondary hover:bg-cream-3/40 cursor-pointer transition-all">
                <X size={15} />
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* IP restriction + general settings */}
        {currentWsId && (
          <GlassCard hover={false}>
            <GlassCardHeader title="Workspace settings" />
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Toggle
                  id="ip-restriction"
                  checked={ipEnabled}
                  onChange={(v) => {
                    if (!plan?.canUseIpRestriction) { upgradeModal.openFor('ipRestriction'); return; }
                    setIpEnabled(v);
                  }}
                />
                <label htmlFor="ip-restriction" className="text-[13px] text-text-primary cursor-pointer">
                  Enable IP restriction
                  {!plan?.canUseIpRestriction && (
                    <span className="ml-1.5 text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber">
                      Espresso
                    </span>
                  )}
                </label>
              </div>
              {ipEnabled && plan?.canUseIpRestriction && (
                <div>
                  <label htmlFor="allowed-ips" className="block text-[11px] font-medium text-text-secondary mb-1">
                    Allowed IPs (one per line)
                  </label>
                  <textarea
                    id="allowed-ips"
                    name="allowedIps"
                    value={allowedIps}
                    onChange={(e) => setAllowedIps(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg text-[13px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee font-mono"
                  />
                </div>
              )}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label htmlFor="ws-timezone" className="block text-[11px] font-medium text-text-secondary mb-1">
                    Timezone
                  </label>
                  <input
                    id="ws-timezone"
                    name="timezone"
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-[13px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee"
                  />
                </div>
                <div className="flex-1">
                  <label id="ws-locale-label" className="block text-[11px] font-medium text-text-secondary mb-1">
                    Locale
                  </label>
                  <CustomSelect
                    value={locale}
                    onChange={setLocale}
                    options={[
                      { value: 'en', label: 'English' },
                      { value: 'fr', label: 'Français' },
                      { value: 'km', label: 'ខ្មែរ' },
                    ]}
                  />
                </div>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={updateSettings.isPending}
                className="px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50"
              >
                {updateSettings.isPending ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </GlassCard>
        )}

        {/* Device verification settings */}
        {currentWsId && (
          <GlassCard hover={false} className="lg:col-span-2">
            <GlassCardHeader
              title={t('settings.deviceVerification')}
              action={
                <div className="flex items-center gap-2">
                  <Smartphone size={14} className="text-amber" />
                  {deviceVerificationEnabled && plan?.canUseDeviceVerification && (
                    <StatusBadge label="Active" variant="green" />
                  )}
                </div>
              }
            />
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Toggle
                  id="device-verification"
                  checked={deviceVerificationEnabled}
                  onChange={(v) => {
                    if (!plan?.canUseDeviceVerification) { upgradeModal.openFor('deviceVerification'); return; }
                    setDeviceVerificationEnabled(v);
                  }}
                />
                <label htmlFor="device-verification" className="text-[13px] text-text-primary cursor-pointer">
                  {t('settings.enableDeviceVerification')}
                  {!plan?.canUseDeviceVerification && (
                    <span className="ml-1.5 text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber">
                      Espresso
                    </span>
                  )}
                </label>
              </div>
              <p className="text-[12px] text-text-tertiary leading-relaxed">
                {t('settings.deviceVerificationDesc')}
              </p>

              {deviceVerificationEnabled && plan?.canUseDeviceVerification && (
                <button
                  onClick={handleSaveSettings}
                  disabled={updateSettings.isPending}
                  className="px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50"
                >
                  {updateSettings.isPending ? t('common.loading') : t('common.save')}
                </button>
              )}
            </div>
          </GlassCard>
        )}

        {/* Geofencing settings */}
        {currentWsId && (
          <GlassCard hover={false} className="lg:col-span-2">
            <GlassCardHeader
              title="Geofencing"
              action={
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-amber" />
                  {geofencingEnabled && plan?.canUseGeofencing && (
                    <StatusBadge label="Active" variant="green" />
                  )}
                </div>
              }
            />
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Toggle
                  id="geofencing"
                  checked={geofencingEnabled}
                  onChange={(v) => {
                    if (!plan?.canUseGeofencing) { upgradeModal.openFor('geofencing'); return; }
                    setGeofencingEnabled(v);
                  }}
                />
                <label htmlFor="geofencing" className="text-[13px] text-text-primary cursor-pointer">
                  Enable geofencing for check-in
                  {!plan?.canUseGeofencing && (
                    <span className="ml-1.5 text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber">
                      Espresso
                    </span>
                  )}
                </label>
              </div>
              <p className="text-[12px] text-text-tertiary leading-relaxed">
                When enabled, staff can only check in when they are within a specified radius of your restaurant location.
              </p>

              {geofencingEnabled && plan?.canUseGeofencing && (
                <div className="space-y-4 pt-1">
                  {/* Use current location button */}
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={locatingPosition}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 cursor-pointer transition-all duration-150 hover:bg-cream-3 disabled:opacity-50"
                  >
                    <Navigation size={14} className={locatingPosition ? 'animate-pulse text-amber' : 'text-coffee'} />
                    {locatingPosition ? 'Detecting location...' : 'Use current location'}
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="geo-lat" className="block text-[11px] font-medium text-text-secondary mb-1">
                        Latitude
                      </label>
                      <input
                        id="geo-lat"
                        name="latitude"
                        type="number"
                        step="any"
                        value={geofencingLat ?? ''}
                        onChange={(e) =>
                          setGeofencingLat(e.target.value === '' ? null : parseFloat(e.target.value))
                        }
                        placeholder="11.5564"
                        className="w-full px-3 py-2 rounded-lg text-[13px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor="geo-lng" className="block text-[11px] font-medium text-text-secondary mb-1">
                        Longitude
                      </label>
                      <input
                        id="geo-lng"
                        name="longitude"
                        type="number"
                        step="any"
                        value={geofencingLng ?? ''}
                        onChange={(e) =>
                          setGeofencingLng(e.target.value === '' ? null : parseFloat(e.target.value))
                        }
                        placeholder="104.9282"
                        className="w-full px-3 py-2 rounded-lg text-[13px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor="geo-radius" className="block text-[11px] font-medium text-text-secondary mb-1">
                        Radius (meters)
                      </label>
                      <input
                        id="geo-radius"
                        name="radius"
                        type="number"
                        min={10}
                        max={5000}
                        value={geofencingRadius}
                        onChange={(e) => setGeofencingRadius(parseInt(e.target.value, 10) || 100)}
                        className="w-full px-3 py-2 rounded-lg text-[13px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee font-mono"
                      />
                    </div>
                  </div>

                  <p className="text-[12px] text-text-tertiary">
                    Staff must be within{' '}
                    <span className="font-medium text-text-secondary">{geofencingRadius}m</span> of
                    this location to check in.
                  </p>

                  {geofencingLat !== null && geofencingLng !== null && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green/5 border border-green/15">
                      <MapPin size={14} className="text-green flex-shrink-0" />
                      <span className="text-[12px] text-green font-mono">
                        {geofencingLat.toFixed(6)}, {geofencingLng.toFixed(6)}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={handleSaveSettings}
                    disabled={updateSettings.isPending}
                    className="px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50"
                  >
                    {updateSettings.isPending ? t('common.loading') : t('common.save')}
                  </button>
                </div>
              )}
            </div>
          </GlassCard>
        )}
      </div>

      {upgradeModal.feature && (
        <UpgradeModal
          open={upgradeModal.isOpen}
          onOpenChange={(open) => { if (!open) upgradeModal.close(); }}
          feature={upgradeModal.feature}
        />
      )}
    </div>
  );
}
