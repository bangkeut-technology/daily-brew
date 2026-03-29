import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Crown, Check, MapPin, Navigation, Smartphone } from 'lucide-react';
import {
  useWorkspaces,
  useCreateWorkspace,
  useWorkspaceSettings,
  useUpdateWorkspaceSettings,
} from '@/hooks/queries/useWorkspaces';
import { usePlan } from '@/hooks/queries/usePlan';
import { getWorkspacePublicId, setWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { StatusBadge } from '@/components/shared/StatusBadge';

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
                      : 'border-cream-3 bg-white/30'
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
                      : 'border-cream-3 bg-white/30'
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
          <GlassCardHeader title="Workspace" />
          <div className="p-5 space-y-3">
            {workspaces?.map((ws) => (
              <button
                key={ws.publicId}
                onClick={() => {
                  setWorkspacePublicId(ws.publicId);
                  window.location.reload();
                }}
                className={`block w-full text-left px-3 py-2 rounded-lg text-[13.5px] border cursor-pointer transition-colors ${
                  ws.publicId === currentWsId
                    ? 'bg-coffee/10 border-coffee text-coffee font-medium'
                    : 'bg-glass-bg border-cream-3 text-text-primary hover:bg-cream-3'
                }`}
              >
                {ws.name}
              </button>
            ))}
            <form onSubmit={handleCreateWorkspace} className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="New workspace name"
                value={newWsName}
                onChange={(e) => setNewWsName(e.target.value)}
                required
                className="flex-1 px-3 py-2 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light"
              >
                Create
              </button>
            </form>
          </div>
        </GlassCard>

        {/* IP restriction + general settings */}
        {currentWsId && (
          <GlassCard hover={false}>
            <GlassCardHeader title="Workspace settings" />
            <div className="p-5 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ipEnabled}
                  onChange={(e) => setIpEnabled(e.target.checked)}
                  disabled={!plan?.canUseIpRestriction}
                  className="accent-[#6B4226]"
                />
                <span className="text-[13px] text-text-primary">
                  Enable IP restriction
                  {!plan?.canUseIpRestriction && (
                    <span className="ml-1.5 text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber">
                      Espresso
                    </span>
                  )}
                </span>
              </label>
              {ipEnabled && plan?.canUseIpRestriction && (
                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">
                    Allowed IPs (one per line)
                  </label>
                  <textarea
                    value={allowedIps}
                    onChange={(e) => setAllowedIps(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg text-[13px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee font-mono"
                  />
                </div>
              )}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-[13px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">
                    Locale
                  </label>
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-[13px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee"
                  >
                    <option value="en">English</option>
                    <option value="fr">Fran&#231;ais</option>
                    <option value="km">&#x1781;&#x17D2;&#x1798;&#x17C2;&#x179A;</option>
                  </select>
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
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deviceVerificationEnabled}
                  onChange={(e) => setDeviceVerificationEnabled(e.target.checked)}
                  disabled={!plan?.canUseDeviceVerification}
                  className="accent-[#6B4226]"
                />
                <span className="text-[13px] text-text-primary">
                  {t('settings.enableDeviceVerification')}
                  {!plan?.canUseDeviceVerification && (
                    <span className="ml-1.5 text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber">
                      Espresso
                    </span>
                  )}
                </span>
              </label>
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
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={geofencingEnabled}
                  onChange={(e) => setGeofencingEnabled(e.target.checked)}
                  disabled={!plan?.canUseGeofencing}
                  className="accent-[#6B4226]"
                />
                <span className="text-[13px] text-text-primary">
                  Enable geofencing for check-in
                  {!plan?.canUseGeofencing && (
                    <span className="ml-1.5 text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber">
                      Espresso
                    </span>
                  )}
                </span>
              </label>
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
                      <label className="block text-[11px] font-medium text-text-secondary mb-1">
                        Latitude
                      </label>
                      <input
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
                      <label className="block text-[11px] font-medium text-text-secondary mb-1">
                        Longitude
                      </label>
                      <input
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
                      <label className="block text-[11px] font-medium text-text-secondary mb-1">
                        Radius (meters)
                      </label>
                      <input
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
    </div>
  );
}
