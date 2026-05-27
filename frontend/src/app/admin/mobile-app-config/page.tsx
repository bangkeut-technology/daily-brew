"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAdminMobileAppConfig, useUpdateAdminMobileAppConfig } from "@/hooks/useAdmin";
import type { AdminMobileAppConfig } from "@/types/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard, GlassCardHeader } from "@/components/shared/GlassCard";

const inputClass =
  "w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[15px] text-text-primary outline-none transition-colors focus:border-coffee focus:ring-1 focus:ring-coffee/20";

export default function AdminMobileAppConfigPage() {
  const { data } = useAdminMobileAppConfig();

  return (
    <div className="page-enter max-w-2xl">
      <PageHeader title="Mobile app config" />
      {!data ? <p className="text-text-secondary">Loading…</p> : <ConfigForm config={data} />}
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
    <div className="space-y-5">
      <GlassCard hover={false}>
        <GlassCardHeader title="iOS (Universal Links)" />
        <div className="space-y-3 p-5">
          <div>
            <label htmlFor="iosTeamId" className="mb-1 block text-[13px] font-medium text-text-secondary">
              Apple Team ID
            </label>
            <input id="iosTeamId" className={inputClass} value={iosTeamId} onChange={(e) => setIosTeamId(e.target.value)} />
          </div>
          <div>
            <label htmlFor="iosBundleId" className="mb-1 block text-[13px] font-medium text-text-secondary">
              Bundle ID
            </label>
            <input id="iosBundleId" className={inputClass} value={iosBundleId} onChange={(e) => setIosBundleId(e.target.value)} />
          </div>
        </div>
      </GlassCard>

      <GlassCard hover={false}>
        <GlassCardHeader title="Android (App Links)" />
        <div className="space-y-3 p-5">
          <div>
            <label htmlFor="androidPackage" className="mb-1 block text-[13px] font-medium text-text-secondary">
              Package name
            </label>
            <input id="androidPackage" className={inputClass} value={androidPackage} onChange={(e) => setAndroidPackage(e.target.value)} />
          </div>
          <div>
            <label htmlFor="fingerprints" className="mb-1 block text-[13px] font-medium text-text-secondary">
              SHA-256 fingerprints (one per line)
            </label>
            <textarea
              id="fingerprints"
              rows={4}
              className={`${inputClass} font-mono text-[13px]`}
              value={fingerprints}
              onChange={(e) => setFingerprints(e.target.value)}
            />
          </div>
        </div>
      </GlassCard>

      <button
        type="button"
        onClick={save}
        disabled={update.isPending}
        className="rounded-lg bg-coffee px-5 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {update.isPending ? "Saving…" : "Save config"}
      </button>
    </div>
  );
}
