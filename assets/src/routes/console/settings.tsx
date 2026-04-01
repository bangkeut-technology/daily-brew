import { createFileRoute } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { Crown, Check, MapPin, Navigation, Smartphone, Building2, Users, Calendar, Plus, X, Copy, Pencil } from 'lucide-react';
import { useDateFormat } from '@/hooks/useDateFormat';
import { usePaddle } from '@/hooks/usePaddle';
import { useDevTogglePlan } from '@/hooks/useDevTogglePlan';
import { QRCodeSVG } from 'qrcode.react';
import { UpgradeModal } from '@/components/shared/UpgradeModal';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import {
  useWorkspaces,
  useCreateWorkspace,
  useUpdateWorkspace,
  useWorkspaceSettings,
  useUpdateWorkspaceSettings,
} from '@/hooks/queries/useWorkspaces';
import { usePlan } from '@/hooks/queries/usePlan';
import { useEmployees } from '@/hooks/queries/useEmployees';
import { useShifts } from '@/hooks/queries/useShifts';
import { apiAxios } from '@/lib/apiAxios';
import { getWorkspacePublicId, setWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CustomSelect } from '@/components/shared/CustomSelect';
import { Toggle } from '@/components/shared/Toggle';

export const Route = createFileRoute('/console/settings')({
  component: SettingsPage,
});

function buildTimezoneOptions(): { value: string; label: string }[] {
  const now = new Date();
  const zones = typeof Intl.supportedValuesOf === 'function'
    ? Intl.supportedValuesOf('timeZone')
    : [
        'Pacific/Honolulu', 'America/Anchorage', 'America/Los_Angeles', 'America/Denver',
        'America/Chicago', 'America/New_York', 'America/Sao_Paulo', 'Atlantic/Reykjavik',
        'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Istanbul', 'Asia/Dubai',
        'Asia/Kolkata', 'Asia/Dhaka', 'Asia/Bangkok', 'Asia/Phnom_Penh', 'Asia/Ho_Chi_Minh',
        'Asia/Singapore', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Taipei', 'Asia/Seoul',
        'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland',
      ];

  return zones
    .map((tz) => {
      const formatted = now.toLocaleString('en-US', { timeZone: tz, timeZoneName: 'shortOffset' });
      const m = formatted.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?$/);
      const offsetMin = m
        ? (m[1] === '+' ? 1 : -1) * (parseInt(m[2]) * 60 + parseInt(m[3] || '0'))
        : 0;
      const sign = offsetMin >= 0 ? '+' : '-';
      const absH = Math.floor(Math.abs(offsetMin) / 60);
      const absM = Math.abs(offsetMin) % 60;
      const utc = absM ? `UTC${sign}${absH}:${String(absM).padStart(2, '0')}` : `UTC${sign}${absH}`;
      const city = tz.split('/').pop()!.replace(/_/g, ' ');
      return { value: tz, label: `${city} (${utc})`, _offsetMin: offsetMin };
    })
    .sort((a, b) => a._offsetMin - b._offsetMin || a.label.localeCompare(b.label))
    .map(({ value, label }) => ({ value, label }));
}

const TIMEZONE_OPTIONS = buildTimezoneOptions();

function SettingsPage() {
  const { t } = useTranslation();
  const currentWsId = getWorkspacePublicId() || '';
  const { data: workspaces } = useWorkspaces();
  const createWs = useCreateWorkspace();
  const updateWs = useUpdateWorkspace();
  const { data: settings } = useWorkspaceSettings(currentWsId);
  const updateSettings = useUpdateWorkspaceSettings(currentWsId);
  const { data: plan } = usePlan(currentWsId);
  const { data: employees } = useEmployees(currentWsId);
  const { data: shifts } = useShifts(currentWsId);
  const upgradeModal = useUpgradeModal();
  const fmtDate = useDateFormat();
  const { openCheckout } = usePaddle();
  const devToggle = useDevTogglePlan();
  const isDev = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
  const paddlePortalDomain = window.__DAILYBREW__?.paddleEnvironment === 'sandbox' ? 'sandbox-customer-portal.paddle.com' : 'customer-portal.paddle.com';
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  const [wsModalOpen, setWsModalOpen] = useState(false);
  const [editingWsId, setEditingWsId] = useState<string | null>(null);
  const [editWsName, setEditWsName] = useState('');

  const [ipEnabled, setIpEnabled] = useState(false);
  const [allowedIps, setAllowedIps] = useState('');
  const [timezone, setTimezone] = useState('Asia/Phnom_Penh');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
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
      setDateFormat(settings.dateFormat || 'DD/MM/YYYY');
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
        dateFormat,
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
                  label={plan.isTrialing ? `Trial · ${plan.trialDaysRemaining}d left` : plan.planLabel}
                  variant={plan.isTrialing ? 'amber' : plan.isEspresso ? 'green' : 'gray'}
                />
              }
            />
            <div className="p-5">
              {/* Dev mode toggle */}
              {isDev && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-amber/8 border border-amber/15">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-amber mr-2">Dev</span>
                  {(['free', 'espresso', 'double_espresso'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        devToggle.mutate(p, {
                          onSuccess: () => toast.success(`Switched to ${p === 'double_espresso' ? 'Double Espresso' : p.charAt(0).toUpperCase() + p.slice(1)}`),
                          onError: () => toast.error('Failed to toggle plan'),
                        });
                      }}
                      disabled={devToggle.isPending}
                      className={cn(
                        'px-3 py-1 rounded-md text-[13px] font-medium border-none cursor-pointer transition-colors',
                        plan.plan === p
                          ? 'bg-coffee text-white'
                          : 'bg-glass-bg text-text-secondary hover:bg-cream-3',
                      )}
                    >
                      {p === 'double_espresso' ? 'Double Espresso' : p === 'free' ? 'Free' : 'Espresso'}
                    </button>
                  ))}
                </div>
              )}

              {/* Trial alert */}
              {plan.isTrialing && (
                <div className="flex items-center gap-4 rounded-xl bg-amber/8 border border-amber/20 px-5 py-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber/15 flex items-center justify-center shrink-0">
                    <Crown size={20} className="text-amber" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[16px] font-semibold text-amber">
                      Espresso trial — {plan.trialDaysRemaining} day{plan.trialDaysRemaining !== 1 ? 's' : ''} remaining
                    </p>
                    <p className="text-[14px] text-text-secondary">
                      You have full access to all Espresso features. Your first payment will be charged after the trial ends.
                    </p>
                  </div>
                  {plan.currentPeriodEnd && (
                    <p className="text-[13px] text-amber font-medium shrink-0">
                      Ends {fmtDate(plan.currentPeriodEnd)}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Free plan */}
                <div
                  className={cn(
                    'rounded-xl border-2 p-5 transition-colors',
                    plan.plan === 'free' ? 'border-coffee bg-coffee/5' : 'border-cream-3 bg-glass-bg',
                  )}
                >
                  <h3 className="text-[17px] font-semibold text-text-primary mb-1">Free</h3>
                  <p className="text-[14px] text-text-tertiary mb-4">Get started</p>
                  <ul className="space-y-2">
                    {['Up to 10 employees', 'QR code check-in', 'Shift management', 'Closure management', 'Dashboard & attendance log'].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[14.5px] text-text-secondary">
                        <Check size={14} className="text-green shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {plan.plan === 'free' && plan.remainingEmployeeSlots !== null && (
                    <div className="mt-4 text-[13px] text-text-tertiary">
                      {plan.remainingEmployeeSlots} employee slot{plan.remainingEmployeeSlots !== 1 ? 's' : ''} remaining
                    </div>
                  )}
                </div>

                {/* Espresso plan */}
                <div
                  className={cn(
                    'rounded-xl border-2 p-5 relative overflow-hidden transition-colors',
                    plan.isEspresso ? 'border-amber bg-amber/5' : 'border-cream-3 bg-glass-bg',
                  )}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-amber to-amber-light" />
                  <div className="flex items-center gap-2 mb-1">
                    <Crown size={18} className="text-amber" />
                    <h3 className="text-[20px] font-semibold text-text-primary">Espresso</h3>
                    {plan.isEspresso && (
                      <span className="text-[13px] font-semibold px-2 py-0.5 rounded-full bg-green/10 text-green">
                        {plan.isTrialing ? 'Trial' : 'Current'}
                      </span>
                    )}
                  </div>
                  <p className="text-[16px] text-text-tertiary mb-4">For growing teams</p>
                  <ul className="space-y-2.5">
                    {['Up to 20 employees', 'IP restriction for check-in & out', 'Device verification for check-in & out', 'Geofencing for check-in & out', 'Per-day schedules', 'Leave requests', 'BasilBook linking'].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[16px] text-text-secondary">
                        <Check size={16} className="text-amber shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Subscribe button (free plan) */}
                  {plan.plan === 'free' && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center rounded-lg bg-cream-3/40 p-0.5">
                          <button
                            onClick={() => setBilling('monthly')}
                            className={cn(
                              'px-3 py-1 rounded-md text-[13px] font-medium border-none cursor-pointer transition-colors',
                              billing === 'monthly' ? 'bg-coffee text-white' : 'bg-transparent text-text-secondary',
                            )}
                          >
                            Monthly
                          </button>
                          <button
                            onClick={() => setBilling('annual')}
                            className={cn(
                              'px-3 py-1 rounded-md text-[13px] font-medium border-none cursor-pointer transition-colors',
                              billing === 'annual' ? 'bg-coffee text-white' : 'bg-transparent text-text-secondary',
                            )}
                          >
                            Annual
                          </button>
                        </div>
                        <span className="text-[15px] font-semibold text-text-primary">
                          {billing === 'annual' ? '$149/year' : '$14.99/month'}
                        </span>
                      </div>
                      {billing === 'annual' && (
                        <p className="text-[12.5px] text-green font-medium">Save 17% vs monthly</p>
                      )}
                      <button
                        onClick={() => openCheckout(billing)}
                        className="w-full px-4 py-2.5 rounded-lg text-[15px] font-semibold bg-linear-to-r from-amber to-coffee text-white border-none cursor-pointer transition-all hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(193,127,59,0.3)]"
                      >
                        Start 14-day free trial
                      </button>
                    </div>
                  )}

                  {/* Billing info + manage (subscribed) */}
                  {plan.isEspresso && (
                    <div className="mt-4 space-y-3">
                      <div className="text-[13px] text-text-tertiary space-y-1">
                        {plan.remainingEmployeeSlots !== null && (
                          <p>{plan.remainingEmployeeSlots} employee slot{plan.remainingEmployeeSlots !== 1 ? 's' : ''} remaining</p>
                        )}
                        {plan.currentPeriodEnd && (
                          <p>{plan.isTrialing ? 'Trial ends' : 'Renews'} {fmtDate(plan.currentPeriodEnd)}</p>
                        )}
                      </div>
                      {plan.paddleSubscriptionId && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              window.open(`https://${paddlePortalDomain}/subscriptions/${plan.paddleSubscriptionId}/update-payment-method`, '_blank');
                            }}
                            className="flex-1 px-3 py-2 rounded-lg text-[14px] font-medium bg-glass-bg text-text-primary border border-cream-3 cursor-pointer hover:bg-cream-3 transition-colors"
                          >
                            Manage billing
                          </button>
                          <button
                            onClick={() => {
                              window.open(`https://${paddlePortalDomain}/subscriptions/${plan.paddleSubscriptionId}/cancel`, '_blank');
                            }}
                            className="px-3 py-2 rounded-lg text-[14px] font-medium bg-transparent text-red border border-red/20 cursor-pointer hover:bg-red/5 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Double Espresso plan */}
                <div
                  className={cn(
                    'rounded-xl border-2 p-5 relative overflow-hidden transition-colors',
                    plan.plan === 'double_espresso' ? 'border-coffee bg-coffee/5' : 'border-cream-3 bg-glass-bg',
                  )}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-coffee to-amber" />
                  <div className="flex items-center gap-2 mb-1">
                    <Crown size={16} className="text-coffee" />
                    <h3 className="text-[17px] font-semibold text-text-primary">Double Espresso</h3>
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-coffee/10 text-coffee">
                      Coming soon
                    </span>
                  </div>
                  <p className="text-[14px] text-text-tertiary mb-1">$39.99/month</p>
                  <p className="text-[14px] text-text-tertiary mb-4">For large teams</p>
                  <ul className="space-y-2">
                    {[
                      { text: 'Unlimited employees' },
                      { text: 'Everything in Espresso' },
                      { text: 'Priority support' },
                      { text: 'Multiple QR stations', roadmap: true },
                      { text: 'Per-QR geofence & settings', roadmap: true },
                      { text: 'Employee assignment per QR', roadmap: true },
                      { text: 'Manager role', roadmap: true },
                      { text: 'White-label branding', roadmap: true },
                    ].map((f) => (
                      <li key={f.text} className={cn('flex items-center gap-2 text-[14.5px]', f.roadmap ? 'text-text-tertiary' : 'text-text-secondary')}>
                        <Check size={14} className={cn('shrink-0', f.roadmap ? 'text-text-tertiary' : 'text-coffee')} />
                        {f.text}
                        {f.roadmap && (
                          <span className="text-[11px] font-medium px-1.5 py-px rounded-full bg-cream-3/60 text-text-tertiary">
                            Roadmap
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {(plan.plan === 'free' || plan.plan === 'espresso') && (
                    <button
                      disabled
                      className="mt-4 w-full px-4 py-2.5 rounded-lg text-[15px] font-semibold bg-glass-bg text-text-secondary border border-cream-3 cursor-not-allowed opacity-70"
                    >
                      Coming soon
                    </button>
                  )}
                  {plan.plan === 'double_espresso' && plan.currentPeriodEnd && (
                    <div className="mt-4 text-[13px] text-text-tertiary">
                      Renews {fmtDate(plan.currentPeriodEnd)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Workspace QR code for check-in */}
        {currentWsId && (() => {
          const currentWs = workspaces?.find((ws) => ws.publicId === currentWsId);
          if (!currentWs?.qrToken) return null;
          const qrData = `dailybrew:ws:${currentWs.qrToken}`;
          return (
            <GlassCard hover={false}>
              <GlassCardHeader title="Check-in QR code" />
              <div className="px-5 py-2">
                <p className="text-[13.5px] text-text-tertiary leading-relaxed">
                  Display this QR code at your restaurant. Employees open the DailyBrew app, scan this code, and check in instantly.
                </p>
              </div>
              <div className="p-6 pt-2 flex flex-col items-center">
                <div className="p-4 bg-white rounded-2xl shadow-[0_2px_12px_rgba(107,66,38,0.08)]">
                  <QRCodeSVG
                    value={qrData}
                    size={180}
                    fgColor="#6B4226"
                    bgColor="#FFFFFF"
                    level="M"
                    imageSettings={{
                      src: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%236B4226" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>'),
                      height: 24,
                      width: 24,
                      excavate: true,
                    }}
                  />
                </div>
                <p className="mt-3 text-[13px] text-text-tertiary font-mono text-center">
                  {qrData}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(currentWs.qrToken);
                      toast.success('Token copied');
                    } catch {
                      toast.error('Failed to copy');
                    }
                  }}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[14px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 cursor-pointer transition-all duration-150 hover:bg-cream-3"
                >
                  <Copy size={12} />
                  Copy token
                </button>
              </div>
            </GlassCard>
          );
        })()}

        {/* Workspace selector */}
        <GlassCard hover={false}>
          <GlassCardHeader
            title={t('workspace.label')}
            action={
              <button
                onClick={() => setWsModalOpen(true)}
                className="flex items-center gap-1 text-[13.5px] font-medium text-coffee hover:text-coffee-light bg-transparent border-none cursor-pointer transition-colors"
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
              const isEditing = editingWsId === ws.publicId;

              return (
                <div
                  key={ws.publicId}
                  className={cn(
                    'w-full text-left rounded-xl border-2 p-4 transition-all',
                    isCurrent
                      ? 'border-coffee bg-coffee/5'
                      : 'border-cream-3 bg-glass-bg',
                  )}
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        id={`ws-name-${ws.publicId}`}
                        name="workspaceName"
                        type="text"
                        value={editWsName}
                        onChange={(e) => setEditWsName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-[15.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee transition-colors"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            if (!editWsName.trim()) return;
                            try {
                              await updateWs.mutateAsync({ publicId: ws.publicId, name: editWsName.trim() });
                              toast.success('Workspace updated');
                              setEditingWsId(null);
                            } catch {
                              toast.error('Failed to update workspace');
                            }
                          }}
                          disabled={updateWs.isPending || !editWsName.trim()}
                          className="px-3 py-1.5 rounded-lg text-[14px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50 transition-colors"
                        >
                          {t('common.save')}
                        </button>
                        <button
                          onClick={() => setEditingWsId(null)}
                          className="px-3 py-1.5 rounded-lg text-[14px] font-medium bg-glass-bg border border-cream-3 text-text-secondary cursor-pointer hover:bg-cream-3 transition-colors"
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => {
                            if (!isCurrent) {
                              setWorkspacePublicId(ws.publicId);
                              window.location.reload();
                            }
                          }}
                          className={cn('w-9 h-9 rounded-lg bg-coffee/10 flex items-center justify-center shrink-0', !isCurrent && 'cursor-pointer')}
                        >
                          <span className="text-[15px] font-semibold text-coffee">
                            {ws.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div
                          className={cn('flex-1 min-w-0', !isCurrent && 'cursor-pointer')}
                          onClick={() => {
                            if (!isCurrent) {
                              setWorkspacePublicId(ws.publicId);
                              window.location.reload();
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[15.5px] font-medium text-text-primary truncate">
                              {ws.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[12px] font-medium px-1.5 py-px rounded-full bg-coffee/10 text-coffee shrink-0">
                                Current
                              </span>
                            )}
                          </div>
                          {ws.createdAt && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Calendar size={10} className="text-text-tertiary" />
                              <span className="text-[12.5px] text-text-tertiary">
                                {fmtDate(ws.createdAt)}
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
                        <button
                          onClick={() => { setEditingWsId(ws.publicId); setEditWsName(ws.name); }}
                          className="text-text-tertiary hover:text-coffee bg-transparent border-none cursor-pointer p-1.5 rounded-lg hover:bg-coffee/8 transition-all"
                        >
                          <Pencil size={13} />
                        </button>
                      </div>

                      {isCurrent && (
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-cream-3/60">
                          <div className="flex items-center gap-1.5">
                            <Users size={12} className="text-text-tertiary" />
                            <span className="text-[13.5px] text-text-secondary">
                              {wsEmployeeCount} {t('nav.employees').toLowerCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Building2 size={12} className="text-text-tertiary" />
                            <span className="text-[13.5px] text-text-secondary">
                              {wsShiftCount} {t('nav.shifts').toLowerCase()}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Create workspace modal */}
        <Dialog.Root open={wsModalOpen} onOpenChange={(v) => { setWsModalOpen(v); if (!v) setNewWsName(''); }}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-100 bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-coffee/10 flex items-center justify-center">
                    <Building2 size={20} className="text-coffee" />
                  </div>
                  <div>
                    <Dialog.Title className="text-[18px] font-semibold text-text-primary font-serif">
                      {t('workspace.create')}
                    </Dialog.Title>
                    <Dialog.Description className="text-[14px] text-text-secondary">
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
                    className="w-full px-3 py-2.5 rounded-lg text-[15.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition-all mb-4"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setWsModalOpen(false); setNewWsName(''); }}
                      className="px-4 py-2 rounded-lg text-[15px] font-medium bg-transparent text-text-secondary border border-cream-3 cursor-pointer hover:bg-cream-3 transition-colors"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={createWs.isPending || !newWsName.trim()}
                      className="px-4 py-2 rounded-lg text-[15px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50 transition-colors"
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
          <GlassCard hover={false} className="lg:col-span-2">
            <GlassCardHeader title="Workspace settings" />
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Toggle
                  id="ip-restriction"
                  checked={ipEnabled && (plan?.canUseIpRestriction ?? false)}
                  onChange={(v) => {
                    if (!plan?.canUseIpRestriction) { upgradeModal.openFor('ipRestriction'); return; }
                    setIpEnabled(v);
                  }}
                />
                <label htmlFor="ip-restriction" className="text-[15px] text-text-primary cursor-pointer">
                  Enable IP restriction
                  {!plan?.canUseIpRestriction && (
                    <span className="ml-1.5 text-[12.5px] font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber">
                      Espresso
                    </span>
                  )}
                </label>
              </div>
              {ipEnabled && plan?.canUseIpRestriction && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="allowed-ips" className="text-[13px] font-medium text-text-secondary">
                      Allowed IPs (one per line)
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const { data } = await apiAxios.get(`/workspaces/${currentWsId}/settings/my-ip`);
                          const ip = data?.ip;
                          if (!ip) return;
                          const existing = allowedIps.split('\n').map((s: string) => s.trim()).filter(Boolean);
                          if (!existing.includes(ip)) {
                            setAllowedIps(existing.length ? `${allowedIps.trimEnd()}\n${ip}` : ip);
                          }
                        } catch {
                          // silently fail
                        }
                      }}
                      className="text-[12.5px] font-medium text-amber cursor-pointer bg-transparent border-none hover:text-coffee transition-colors"
                    >
                      + Use my current IP
                    </button>
                  </div>
                  <textarea
                    id="allowed-ips"
                    name="allowedIps"
                    value={allowedIps}
                    onChange={(e) => setAllowedIps(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg text-[15px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee font-mono"
                  />
                </div>
              )}
              <div>
                <label id="ws-timezone-label" className="block text-[13px] font-medium text-text-secondary mb-1">
                  Timezone
                </label>
                <CustomSelect
                  value={timezone}
                  onChange={setTimezone}
                  options={TIMEZONE_OPTIONS}
                  placeholder="Select timezone…"
                />
                <p className="text-[12.5px] text-text-tertiary mt-1">
                  Used to calculate late arrivals and early departures relative to shift times.
                </p>
              </div>
              <div>
                <label id="ws-dateformat-label" className="block text-[13px] font-medium text-text-secondary mb-1">
                  Date format
                </label>
                <CustomSelect
                  value={dateFormat}
                  onChange={setDateFormat}
                  options={[
                    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (30/03/2026)' },
                    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (03/30/2026)' },
                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-03-30)' },
                  ]}
                />
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={updateSettings.isPending}
                className="px-4 py-2 rounded-lg text-[15px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50"
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
                  checked={deviceVerificationEnabled && (plan?.canUseDeviceVerification ?? false)}
                  onChange={(v) => {
                    if (!plan?.canUseDeviceVerification) { upgradeModal.openFor('deviceVerification'); return; }
                    setDeviceVerificationEnabled(v);
                  }}
                />
                <label htmlFor="device-verification" className="text-[15px] text-text-primary cursor-pointer">
                  {t('settings.enableDeviceVerification')}
                  {!plan?.canUseDeviceVerification && (
                    <span className="ml-1.5 text-[12.5px] font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber">
                      Espresso
                    </span>
                  )}
                </label>
              </div>
              <p className="text-[14px] text-text-tertiary leading-relaxed">
                {t('settings.deviceVerificationDesc')}
              </p>

              {deviceVerificationEnabled && plan?.canUseDeviceVerification && (
                <button
                  onClick={handleSaveSettings}
                  disabled={updateSettings.isPending}
                  className="px-4 py-2 rounded-lg text-[15px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50"
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
                  checked={geofencingEnabled && (plan?.canUseGeofencing ?? false)}
                  onChange={(v) => {
                    if (!plan?.canUseGeofencing) { upgradeModal.openFor('geofencing'); return; }
                    setGeofencingEnabled(v);
                  }}
                />
                <label htmlFor="geofencing" className="text-[15px] text-text-primary cursor-pointer">
                  Enable geofencing for check-in
                  {!plan?.canUseGeofencing && (
                    <span className="ml-1.5 text-[12.5px] font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber">
                      Espresso
                    </span>
                  )}
                </label>
              </div>
              <p className="text-[14px] text-text-tertiary leading-relaxed">
                When enabled, staff can only check in when they are within a specified radius of your restaurant location.
              </p>

              {geofencingEnabled && plan?.canUseGeofencing && (
                <div className="space-y-4 pt-1">
                  {/* Use current location button */}
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={locatingPosition}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[15px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 cursor-pointer transition-all duration-150 hover:bg-cream-3 disabled:opacity-50"
                  >
                    <Navigation size={14} className={locatingPosition ? 'animate-pulse text-amber' : 'text-coffee'} />
                    {locatingPosition ? 'Detecting location...' : 'Use current location'}
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="geo-lat" className="block text-[13px] font-medium text-text-secondary mb-1">
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
                        className="w-full px-3 py-2 rounded-lg text-[15px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor="geo-lng" className="block text-[13px] font-medium text-text-secondary mb-1">
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
                        className="w-full px-3 py-2 rounded-lg text-[15px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor="geo-radius" className="block text-[13px] font-medium text-text-secondary mb-1">
                        Radius (meters)
                      </label>
                      <input
                        id="geo-radius"
                        name="radius"
                        type="number"
                        min={50}
                        max={5000}
                        value={geofencingRadius || ''}
                        onChange={(e) => setGeofencingRadius(e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
                        onBlur={() => {
                          if (geofencingRadius > 0 && geofencingRadius < 50) {
                            toast.error('Minimum radius is 50m due to GPS accuracy. Reset to 100m.');
                            setGeofencingRadius(100);
                          } else if (geofencingRadius === 0) {
                            setGeofencingRadius(100);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-lg text-[15px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee font-mono"
                      />
                      {geofencingRadius > 0 && geofencingRadius < 50 && (
                        <p className="text-[13px] text-red mt-1">Minimum 50m — GPS is not accurate below this</p>
                      )}
                    </div>
                  </div>

                  <p className="text-[14px] text-text-tertiary">
                    Staff must be within{' '}
                    <span className="font-medium text-text-secondary">{geofencingRadius || 100}m</span> of
                    this location to check in.
                  </p>

                  {geofencingLat !== null && geofencingLng !== null && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green/5 border border-green/15">
                      <MapPin size={14} className="text-green shrink-0" />
                      <span className="text-[14px] text-green font-mono">
                        {geofencingLat.toFixed(6)}, {geofencingLng.toFixed(6)}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={handleSaveSettings}
                    disabled={updateSettings.isPending}
                    className="px-4 py-2 rounded-lg text-[15px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50"
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
