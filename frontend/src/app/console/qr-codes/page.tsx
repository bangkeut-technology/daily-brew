"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getWorkspacePublicId } from "@/lib/api";
import {
  useWorkspaceDetail,
  useRegenerateWorkspaceToken,
  useWorkspaceQrCodes,
} from "@/hooks/useWorkspaceQr";
import { usePlan } from "@/hooks/usePlan";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

export default function QrCodesPage() {
  const { t } = useTranslation();
  const [workspaceId] = useState<string | null>(() => getWorkspacePublicId());
  const wsId = workspaceId ?? "";

  const { data: workspace, isLoading } = useWorkspaceDetail(wsId);
  const { data: plan } = usePlan(wsId);
  const { data: subQrs } = useWorkspaceQrCodes(wsId);
  const regenerate = useRegenerateWorkspaceToken();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleRegenerate = () => {
    regenerate.mutate(wsId, {
      onSuccess: () => toast.success("QR code regenerated"),
      onError: () => toast.error("Could not regenerate QR code"),
    });
  };

  return (
    <div className="page-enter max-w-3xl">
      <PageHeader title={t("nav.qrCodes", "QR codes")} />

      {isLoading || !workspace ? (
        <p className="text-text-secondary">Loading…</p>
      ) : (
        <div className="space-y-5">
          <GlassCard hover={false} className="p-6">
            <div className="flex items-center gap-6">
              <div className="rounded-xl border border-cream-3 bg-white p-3">
                <QRCodeSVG value={`dailybrew:ws:${workspace.qrToken}`} size={128} level="M" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-lg font-semibold text-text-primary">
                  Workspace QR
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Print this and display it at {workspace.name}. Staff scan it in the DailyBrew
                  app to check in and out.
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-cream-3 bg-glass-bg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-cream-3"
                >
                  <RefreshCw size={15} />
                  Regenerate
                </button>
              </div>
            </div>
          </GlassCard>

          {plan?.isDoubleEspresso && (
            <GlassCard hover={false} className="p-6">
              <h2 className="font-serif text-lg font-semibold text-text-primary">Sub QR codes</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Per-cluster QR codes with their own check-in rules.
              </p>

              {subQrs && subQrs.length > 0 ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {subQrs.map((qr) => (
                    <div key={qr.publicId} className="flex items-center gap-4 rounded-xl border border-cream-3 p-4">
                      <div className="rounded-lg border border-cream-3 bg-white p-2">
                        <QRCodeSVG value={`dailybrew:wqr:${qr.qrToken}`} size={72} level="M" />
                      </div>
                      <p className="font-medium text-text-primary">{qr.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-text-tertiary">No sub QR codes yet.</p>
              )}
            </GlassCard>
          )}
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Regenerate QR code"
        description="The current QR stops working immediately. Any printed copies must be replaced. Sub QR codes are unaffected."
        confirmLabel="Regenerate"
        variant="danger"
        loading={regenerate.isPending}
        onConfirm={handleRegenerate}
      />
    </div>
  );
}
