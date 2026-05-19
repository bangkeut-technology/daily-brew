import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Apple, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminMobileAppConfig, useUpdateAdminMobileAppConfig } from '@/hooks/queries/useAdmin';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/admin/mobile-app-config/')({
  component: AdminMobileAppConfigPage,
});

function AdminMobileAppConfigPage() {
  const { data, isLoading } = useAdminMobileAppConfig();
  const update = useUpdateAdminMobileAppConfig();

  const [iosTeamId, setIosTeamId] = useState('');
  const [iosBundleId, setIosBundleId] = useState('');
  const [androidPackage, setAndroidPackage] = useState('');
  const [androidShaText, setAndroidShaText] = useState('');

  useEffect(() => {
    if (!data) return;
    setIosTeamId(data.iosTeamId ?? '');
    setIosBundleId(data.iosBundleId ?? '');
    setAndroidPackage(data.androidPackage ?? '');
    setAndroidShaText((data.androidSha256Fingerprints ?? []).join('\n'));
  }, [data]);

  const handleSave = async () => {
    try {
      const fingerprints = androidShaText
        .split(/[\s,]+/)
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
      await update.mutateAsync({
        iosTeamId: iosTeamId.trim() || null,
        iosBundleId: iosBundleId.trim() || null,
        androidPackage: androidPackage.trim() || null,
        androidSha256Fingerprints: fingerprints,
      });
      toast.success('Mobile app config saved');
    } catch {
      toast.error('Failed to save config');
    }
  };

  return (
    <div>
      <PageHeader title="Mobile app config" />
      <p className="text-[14px] text-text-secondary mb-5 -mt-2 leading-relaxed">
        Identifiers used to serve the iOS Universal Links and Android App Links manifests at
        <code className="mx-1 px-1.5 py-0.5 rounded bg-cream-3/60 font-mono text-[12.5px]">/.well-known/apple-app-site-association</code>
        and
        <code className="mx-1 px-1.5 py-0.5 rounded bg-cream-3/60 font-mono text-[12.5px]">/.well-known/assetlinks.json</code>.
        With these set, tapping a <code className="font-mono text-[12.5px]">https://dailybrew.work/checkin/&lt;token&gt;</code> link from an NFC tag, email, or message opens the mobile app directly.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* iOS */}
        <GlassCard hover={false}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-cream-3/60">
            <div className="flex items-center gap-2">
              <Apple size={16} className="text-text-secondary" />
              <span className="text-[15.5px] font-medium text-text-primary font-serif">iOS — Universal Links</span>
            </div>
            <StatusPill ok={!!data?.iosConfigured} />
          </div>
          <div className="p-5 space-y-3">
            <Field
              id="ios-team-id"
              label="Apple Team ID"
              value={iosTeamId}
              onChange={setIosTeamId}
              placeholder="ABCDE12345"
              hint="10-character team ID from developer.apple.com → Membership."
              monospace
            />
            <Field
              id="ios-bundle-id"
              label="Bundle identifier"
              value={iosBundleId}
              onChange={setIosBundleId}
              placeholder="work.dailybrew.mobile"
              hint="Must match the iOS app's bundle ID exactly."
              monospace
            />
          </div>
        </GlassCard>

        {/* Android */}
        <GlassCard hover={false}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-cream-3/60">
            <div className="flex items-center gap-2">
              <Smartphone size={16} className="text-text-secondary" />
              <span className="text-[15.5px] font-medium text-text-primary font-serif">Android — App Links</span>
            </div>
            <StatusPill ok={!!data?.androidConfigured} />
          </div>
          <div className="p-5 space-y-3">
            <Field
              id="android-package"
              label="Application id"
              value={androidPackage}
              onChange={setAndroidPackage}
              placeholder="work.dailybrew.mobile"
              hint="Must match the Android app's applicationId exactly."
              monospace
            />
            <div>
              <label htmlFor="android-sha" className="block text-[13px] font-medium text-text-secondary mb-1">
                Signing-cert SHA-256 fingerprints
              </label>
              <textarea
                id="android-sha"
                name="androidSha256Fingerprints"
                value={androidShaText}
                onChange={(e) => setAndroidShaText(e.target.value)}
                placeholder="AB:CD:EF:01:23:45:…"
                rows={4}
                className="w-full px-3 py-2 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee font-mono"
              />
              <p className="text-[12.5px] text-text-tertiary mt-1 leading-relaxed">
                One per line. Use Google Play Console → Setup → App integrity → "App signing key certificate" → SHA-256. Add upload and release keys if they differ.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={update.isPending || isLoading}
          className="px-5 py-2 rounded-lg text-[15px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50"
        >
          {update.isPending ? 'Saving…' : 'Save'}
        </button>
        <span className="text-[12.5px] text-text-tertiary">
          iOS caches the manifest aggressively after install — changes here can take a fresh install or up to a few days to propagate.
        </span>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  monospace,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  monospace?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-medium text-text-secondary mb-1">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full px-3 py-2 rounded-lg text-[14px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee',
          monospace && 'font-mono text-[13.5px]',
        )}
      />
      {hint && <p className="text-[12.5px] text-text-tertiary mt-1 leading-relaxed">{hint}</p>}
    </div>
  );
}

function StatusPill({ ok }: { ok: boolean }) {
  if (ok) {
    return (
      <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-green">
        <CheckCircle2 size={13} />
        Active
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-text-tertiary">
      <AlertCircle size={13} />
      Not configured
    </span>
  );
}
