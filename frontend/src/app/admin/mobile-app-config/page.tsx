"use client";

import { useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminMobileAppConfig, useUpdateAdminMobileAppConfig } from "@/hooks/useAdmin";
import type { AdminMobileAppConfig } from "@/types/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard, GlassCardHeader } from "@/components/shared/GlassCard";
import { Skeleton } from "@/components/admin/AdminDataStates";

const inputClass =
  "w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[15px] text-text-primary outline-none transition-colors focus:border-coffee focus:ring-1 focus:ring-coffee/20";

export default function AdminMobileAppConfigPage() {
  const { data } = useAdminMobileAppConfig();

  return (
    <div className="page-enter max-w-4xl">
      <PageHeader title="Mobile app config" />
      <p className="-mt-2 mb-5 text-sm leading-relaxed text-text-secondary">
        Identifiers used to serve the iOS Universal Links and Android App Links manifests at
        <Code>/.well-known/apple-app-site-association</Code> and <Code>/.well-known/assetlinks.json</Code>.
        With these set, tapping a <Code>https://dailybrew.work/checkin/&lt;token&gt;</Code> link from
        an NFC tag, email, or message opens the mobile app directly.
      </p>
      {!data ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-10" />
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-10" />
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-10" />
        </div>
      ) : (
        <ConfigForm config={data} />
      )}
    </div>
  );
}

// Mounted only once config is loaded, so state can seed from it lazily — no effect.
function ConfigForm({ config }: { config: AdminMobileAppConfig }) {
  const update = useUpdateAdminMobileAppConfig();
  const [iosTeamId, setIosTeamId] = useState(config.iosTeamId ?? "");
  const [iosBundleId, setIosBundleId] = useState(config.iosBundleId ?? "");
  const [androidPackage, setAndroidPackage] = useState(config.androidPackage ?? "");
  const [fingerprints, setFingerprints] = useState(config.androidSha256Fingerprints.join("\n"));

  const save = () => {
    update.mutate(
      {
        iosTeamId: iosTeamId.trim() || null,
        iosBundleId: iosBundleId.trim() || null,
        androidPackage: androidPackage.trim() || null,
        androidSha256Fingerprints: fingerprints
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
      },
      {
        onSuccess: () => toast.success("Mobile app config saved"),
        onError: () => toast.error("Could not save config"),
      },
    );
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <GlassCard hover={false}>
        <GlassCardHeader
          title="iOS — Universal Links"
          action={<StatusPill ok={config.iosConfigured} />}
        />
        <div className="space-y-3 p-5">
          <div>
            <label htmlFor="iosTeamId" className="mb-1 block text-[13px] font-medium text-text-secondary">
              Apple Team ID
            </label>
            <input id="iosTeamId" className={inputClass} placeholder="ABCDE12345" value={iosTeamId} onChange={(e) => setIosTeamId(e.target.value)} />
          </div>
          <div>
            <label htmlFor="iosBundleId" className="mb-1 block text-[13px] font-medium text-text-secondary">
              Bundle ID
            </label>
            <input id="iosBundleId" className={inputClass} placeholder="work.dailybrew.mobile" value={iosBundleId} onChange={(e) => setIosBundleId(e.target.value)} />
          </div>
        </div>
      </GlassCard>

      <GlassCard hover={false}>
        <GlassCardHeader
          title="Android — App Links"
          action={<StatusPill ok={config.androidConfigured} />}
        />
        <div className="space-y-3 p-5">
          <div>
            <label htmlFor="androidPackage" className="mb-1 block text-[13px] font-medium text-text-secondary">
              Package name
            </label>
            <input id="androidPackage" className={inputClass} placeholder="work.dailybrew.mobile" value={androidPackage} onChange={(e) => setAndroidPackage(e.target.value)} />
          </div>
          <div>
            <label htmlFor="fingerprints" className="mb-1 block text-[13px] font-medium text-text-secondary">
              SHA-256 fingerprints (one per line)
            </label>
            <textarea
              id="fingerprints"
              rows={4}
              placeholder="AB:CD:EF:01:23:45:…"
              className={`${inputClass} font-mono text-[13px]`}
              value={fingerprints}
              onChange={(e) => setFingerprints(e.target.value)}
            />
          </div>
        </div>
      </GlassCard>

      <div className="lg:col-span-2">
        <button
          type="button"
          onClick={save}
          disabled={update.isPending}
          className="rounded-lg bg-coffee px-5 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {update.isPending ? "Saving…" : "Save config"}
        </button>
      </div>
    </div>
  );
}

function StatusPill({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-green">
      <CheckCircle2 size={13} />
      Active
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-text-tertiary">
      <AlertCircle size={13} />
      Not configured
    </span>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="mx-1 rounded bg-cream-3/60 px-1.5 py-0.5 font-mono text-[12.5px]">
      {children}
    </code>
  );
}
