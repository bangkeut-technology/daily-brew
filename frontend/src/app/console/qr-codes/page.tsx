"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronRight, Plus, QrCode, RefreshCw, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { getWorkspacePublicId } from "@/lib/api";
import {
  useCreateWorkspaceQrCode,
  useDeleteWorkspaceQrCode,
  useRegenerateWorkspaceToken,
  useWorkspaceDetail,
  useWorkspaceQrCodes,
  type WorkspaceQrCode,
} from "@/hooks/useWorkspaceQr";
import { usePlan } from "@/hooks/usePlan";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { Skeleton } from "@/components/admin/AdminDataStates";

const inputClass =
  "w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[15.5px] text-text-primary outline-none transition-colors focus:border-coffee";

export default function QrCodesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [workspaceId] = useState<string | null>(() => getWorkspacePublicId());
  const wsId = workspaceId ?? "";

  const { data: workspace, isLoading } = useWorkspaceDetail(wsId);
  const { data: plan } = usePlan(wsId);
  const { data: subQrs } = useWorkspaceQrCodes(wsId);
  const regenerate = useRegenerateWorkspaceToken();
  const createQr = useCreateWorkspaceQrCode(wsId);
  const deleteQr = useDeleteWorkspaceQrCode(wsId);

  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceQrCode | null>(null);

  const canUseSubQrs = plan?.canUseSubQrCodes ?? false;

  const handleCreate = (name: string) => {
    createQr.mutate(
      { name },
      {
        onSuccess: (created) => {
          toast.success(t("qrCodes.createSuccess", "QR code created"));
          setCreating(false);
          // Straight to the detail page — assignment and the per-QR rules
          // live there, and a QR with nobody assigned does nothing.
          router.push(`/console/qr-codes/${created.publicId}`);
        },
        onError: (err) =>
          toast.error(
            (err instanceof AxiosError ? err.response?.data?.message : undefined) ??
              t("qrCodes.createError", "Failed to create QR code"),
          ),
      },
    );
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteQr.mutate(deleteTarget.publicId, {
      onSuccess: () => {
        toast.success(t("qrCodes.deleteSuccess", "QR code deleted"));
        setDeleteTarget(null);
      },
      onError: () => toast.error(t("qrCodes.deleteError", "Failed to delete QR code")),
    });
  };

  return (
    <div className="page-enter max-w-3xl">
      <PageHeader title={t("nav.qrCodes", "QR codes")} />

      {isLoading || !workspace ? (
        <div className="space-y-5" aria-busy="true">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-5">
          <GlassCard hover={false} className="p-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="rounded-xl border border-cream-3 bg-white p-3">
                <QRCodeSVG value={`dailybrew:ws:${workspace.qrToken}`} size={128} level="M" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-lg font-semibold text-text-primary">
                  {t("qrCodes.workspaceQr", "Workspace QR")}
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {t("qrCodes.workspaceQrDesc", "Print this and display it at {{name}}.", {
                    name: workspace.name,
                  })}{" "}
                  {t(
                    "qrCodes.workspaceQrDesc2",
                    "Staff scan it in the DailyBrew app to check in and out.",
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmRegenerate(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-cream-3 bg-glass-bg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-cream-3"
                >
                  <RefreshCw size={15} />
                  {t("settings.regenerateToken", "Regenerate token")}
                </button>
              </div>
            </div>
          </GlassCard>

          {canUseSubQrs && (
            <div>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-lg font-semibold text-text-primary">
                    {t("qrCodes.subQrTitle", "Sub QR codes")}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                    {t(
                      "qrCodes.intro",
                      "Create additional QR codes for different sections or floors. Only assigned employees can scan a sub-QR. Settings can be inherited from the workspace or overridden per QR.",
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-all duration-150 hover:bg-coffee-light"
                >
                  <Plus size={16} />
                  {t("qrCodes.new", "New QR code")}
                </button>
              </div>

              {subQrs?.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="flex min-h-[200px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-[1.5px] border-dashed border-cream-3 bg-glass-bg backdrop-blur-md transition-colors hover:bg-cream-3/30"
                >
                  <QrCode size={28} className="mb-2 text-text-tertiary" />
                  <span className="text-[15px] text-text-tertiary">
                    {t("qrCodes.empty", "No QR codes yet")}
                  </span>
                  <span className="mt-1 text-[13px] text-text-tertiary">
                    {t("qrCodes.emptyHint", "Click to add one")}
                  </span>
                </button>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {subQrs?.map((qr) => (
                    <QrCodeCard key={qr.publicId} qrCode={qr} onDelete={() => setDeleteTarget(qr)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {creating && (
        <QrCodeCreateModal
          submitting={createQr.isPending}
          onSubmit={handleCreate}
          onClose={() => setCreating(false)}
        />
      )}

      <ConfirmModal
        open={confirmRegenerate}
        onOpenChange={setConfirmRegenerate}
        title={t("settings.regenerateTokenTitle", "Regenerate workspace token")}
        description={t(
          "qrCodes.regenerateDesc",
          "The current QR stops working immediately. Any printed copies must be replaced. Sub QR codes are unaffected.",
        )}
        confirmLabel={t("settings.regenerateToken", "Regenerate token")}
        cancelLabel={t("common.cancel", "Cancel")}
        variant="danger"
        loading={regenerate.isPending}
        onConfirm={() =>
          regenerate.mutate(wsId, {
            onSuccess: () => {
              toast.success(t("settings.tokenRegenerated", "New QR token generated"));
              setConfirmRegenerate(false);
            },
            onError: () => toast.error(t("settings.saveError", "Failed to save settings")),
          })
        }
      />

      <ConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("qrCodes.deleteTitle", "Delete QR code")}
        description={t(
          "qrCodes.deleteConfirm",
          "Delete {{name}}? Employees assigned to it will lose access. This cannot be undone.",
          { name: deleteTarget?.name ?? "" },
        )}
        confirmLabel={t("common.delete", "Delete")}
        cancelLabel={t("common.cancel", "Cancel")}
        variant="danger"
        loading={deleteQr.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function QrCodeCard({ qrCode, onDelete }: { qrCode: WorkspaceQrCode; onDelete: () => void }) {
  const { t } = useTranslation();

  return (
    <GlassCard>
      <Link href={`/console/qr-codes/${qrCode.publicId}`} className="block no-underline">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-linear-to-r from-coffee to-amber" />
          <div className="px-5 pb-3 pt-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[17px] font-semibold text-text-primary">
                  {qrCode.name}
                </h3>
                {qrCode.manager && (
                  <p className="mt-1 text-[13px] text-text-secondary">
                    {t("qrCodes.managedBy", "Managed by")}{" "}
                    <span className="font-medium">{qrCode.manager.name}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={t("common.delete", "Delete")}
                  onClick={(e) => {
                    // The whole card is a link to the detail page; deleting
                    // must not navigate there on the way out.
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-red/8 hover:text-red"
                >
                  <Trash2 size={14} />
                </button>
                <ChevronRight size={16} className="text-text-tertiary" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 px-5 py-4">
          <div className="flex-shrink-0 rounded-lg border border-cream-3 bg-white p-2">
            <QRCodeSVG value={`dailybrew:wqr:${qrCode.qrToken}`} size={88} level="M" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2 text-[13.5px] text-text-secondary">
              <Users size={13} />
              <span>
                {t("qrCodes.assignedCount", "{{count}} assigned", {
                  count: qrCode.assignedEmployees.length,
                })}
              </span>
            </div>
            <SettingSummary qrCode={qrCode} />
          </div>
        </div>
      </Link>
    </GlassCard>
  );
}

/**
 * At-a-glance answer to "does this QR follow the workspace rules or its own?".
 * Wording deliberately avoids "inherit"/"override" per the style guide.
 */
function SettingSummary({ qrCode }: { qrCode: WorkspaceQrCode }) {
  const { t } = useTranslation();

  const summary = (sameAsWorkspace: boolean, enabled: boolean) =>
    sameAsWorkspace
      ? t("qrCodes.summaryWorkspace", "workspace")
      : enabled
        ? t("qrCodes.summaryCustomOn", "custom · on")
        : t("qrCodes.summaryCustomOff", "custom · off");

  const items = [
    {
      label: t("qrCodes.ip", "IP"),
      value: summary(qrCode.inheritIpSettings, qrCode.ipRestrictionEnabled),
    },
    {
      label: t("qrCodes.geofence", "Geofence"),
      value: summary(qrCode.inheritGeofencing, qrCode.geofencingEnabled),
    },
    {
      label: t("qrCodes.device", "Device"),
      value: summary(qrCode.inheritDeviceVerification, qrCode.deviceVerificationEnabled),
    },
  ];

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item.label}
          className="rounded-full bg-cream-3/50 px-2 py-0.5 text-[11.5px] text-text-secondary"
        >
          {item.label}: <span className="font-medium">{item.value}</span>
        </span>
      ))}
    </div>
  );
}

/** Name only — the full configuration lives on the detail page. */
function QrCodeCreateModal({
  submitting,
  onSubmit,
  onClose,
}: {
  submitting: boolean;
  onSubmit: (name: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error(t("qrCodes.nameRequired", "Name is required"));
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-cream-3 bg-cream shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none">
          <div className="flex items-center justify-between rounded-t-2xl border-b border-cream-3 px-6 py-4">
            <Dialog.Title className="text-[18px] font-semibold text-text-primary">
              {t("qrCodes.new", "New QR code")}
            </Dialog.Title>
            <Dialog.Close
              aria-label={t("common.close", "Close")}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-cream-3/40 hover:text-text-secondary"
            >
              <X size={15} />
            </Dialog.Close>
          </div>

          <div className="space-y-4 p-6">
            <div>
              <label
                htmlFor="qr-name"
                className="mb-1 block text-[13px] font-medium text-text-secondary"
              >
                {t("qrCodes.name", "Name")}
              </label>
              <input
                id="qr-name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
                placeholder={t("qrCodes.namePlaceholder", "e.g. Floor 1, Kitchen entrance")}
                className={inputClass}
                autoFocus
              />
            </div>
            <p className="text-[12.5px] text-text-tertiary">
              {t(
                "qrCodes.afterCreateHint",
                "You'll be taken to the QR detail page to assign employees and adjust settings.",
              )}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 rounded-b-2xl border-t border-cream-3 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-cream-3 bg-glass-bg px-4 py-2 text-[15px] font-medium text-text-secondary transition-colors hover:bg-cream-3/40"
            >
              {t("common.cancel", "Cancel")}
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50"
            >
              {submitting ? t("common.loading", "Loading...") : t("common.create", "Create")}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
