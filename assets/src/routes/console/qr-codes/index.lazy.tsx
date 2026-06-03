import { createLazyFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { QRCodeSVG } from 'qrcode.react';
import { ChevronRight, Plus, QrCode, Trash2, Users, X } from 'lucide-react';
import {
  useCreateWorkspaceQrCode,
  useDeleteWorkspaceQrCode,
  useWorkspaceQrCodes,
} from '@/hooks/queries/useWorkspaceQrCodes';
import { usePlan } from '@/hooks/queries/usePlan';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import type { WorkspaceQrCode, WorkspaceQrCodeInput } from '@/types';

export const Route = createLazyFileRoute('/console/qr-codes/')({
  component: QrCodesPage,
});

function QrCodesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const workspaceId = getWorkspacePublicId() || '';
  const { data: plan } = usePlan(workspaceId);
  const { data: qrCodes, isLoading } = useWorkspaceQrCodes(workspaceId);
  const createMutation = useCreateWorkspaceQrCode(workspaceId);
  const deleteMutation = useDeleteWorkspaceQrCode(workspaceId);

  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceQrCode | null>(null);

  // Plan gate — redirect away if not Double Espresso
  useEffect(() => {
    if (plan && !plan.canUseSubQrCodes) {
      toast.error(t('qrCodes.planGate', 'Multiple QR codes require the Double Espresso plan'));
      navigate({ to: '/console/settings' });
    }
  }, [plan, navigate, t]);

  if (!plan?.canUseSubQrCodes) {
    return null;
  }

  const handleCreate = async (input: WorkspaceQrCodeInput) => {
    try {
      const created = await createMutation.mutateAsync(input);
      toast.success(t('qrCodes.createSuccess', 'QR code created'));
      setCreating(false);
      navigate({ to: '/console/qr-codes/$publicId', params: { publicId: created.publicId } });
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? t('qrCodes.createError', 'Failed to create QR code'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.publicId);
      toast.success(t('qrCodes.deleteSuccess', 'QR code deleted'));
    } catch {
      toast.error(t('qrCodes.deleteError', 'Failed to delete QR code'));
    }
    setDeleteTarget(null);
  };

  return (
    <div className="page-enter">
      <PageHeader
        title={t('nav.qrCodes', 'QR codes')}
        action={
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[15px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light"
          >
            <Plus size={16} />
            {t('qrCodes.new', 'New QR code')}
          </button>
        }
      />

      <p className="text-[15px] text-text-secondary mb-5 -mt-2 leading-relaxed">
        {t(
          'qrCodes.intro',
          'Create additional QR codes for different sections or floors. Only assigned employees can scan a sub-QR. Settings can be inherited from the workspace or overridden per QR.',
        )}
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-[15px] text-text-tertiary">{t('common.loading')}</p>
        </div>
      ) : qrCodes?.length === 0 ? (
        <div
          onClick={() => setCreating(true)}
          className="border-[1.5px] border-dashed border-cream-3 rounded-2xl bg-glass-bg backdrop-blur-md flex flex-col items-center justify-center min-h-[200px] cursor-pointer transition-colors hover:bg-cream-3/30"
        >
          <QrCode size={28} className="text-text-tertiary mb-2" />
          <span className="text-[15px] text-text-tertiary">{t('qrCodes.empty', 'No QR codes yet')}</span>
          <span className="text-[13px] text-text-tertiary mt-1">{t('qrCodes.emptyHint', 'Click to add one')}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {qrCodes?.map((qr) => (
            <QrCodeCard
              key={qr.publicId}
              qrCode={qr}
              onDelete={() => setDeleteTarget(qr)}
            />
          ))}
        </div>
      )}

      {creating && (
        <QrCodeCreateModal
          submitting={createMutation.isPending}
          onSubmit={handleCreate}
          onClose={() => setCreating(false)}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={t('qrCodes.deleteTitle', 'Delete QR code')}
        description={t('qrCodes.deleteConfirm', 'Delete {{name}}? Employees assigned to it will lose access. This cannot be undone.', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('common.delete', 'Delete')}
        cancelLabel={t('common.cancel', 'Cancel')}
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

// ── QR code card ──────────────────────────────────────────────

function QrCodeCard({
  qrCode,
  onDelete,
}: {
  qrCode: WorkspaceQrCode;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const qrPayload = `dailybrew:wqr:${qrCode.qrToken}`;
  const assignedCount = qrCode.assignedEmployees.length;

  return (
    <GlassCard>
      <Link
        to="/console/qr-codes/$publicId"
        params={{ publicId: qrCode.publicId }}
        className="block no-underline"
      >
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-coffee to-amber" />
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-[17px] font-semibold text-text-primary truncate">{qrCode.name}</h3>
                {qrCode.manager && (
                  <p className="text-[13px] text-text-secondary mt-1">
                    {t('qrCodes.managedBy', 'Managed by')} <span className="font-medium">{qrCode.manager.name}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
                  className="text-text-tertiary hover:text-red transition-colors bg-transparent border-none cursor-pointer p-1.5 rounded-lg hover:bg-red/8"
                  aria-label={t('common.delete', 'Delete')}
                >
                  <Trash2 size={14} />
                </button>
                <ChevronRight size={16} className="text-text-tertiary" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 flex items-center gap-4">
          <div className="bg-white p-2 rounded-lg border border-cream-3 flex-shrink-0">
            <QRCodeSVG value={qrPayload} size={88} level="M" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 text-[13.5px] text-text-secondary">
              <Users size={13} />
              <span>{t('qrCodes.assignedCount', '{{count}} assigned', { count: assignedCount })}</span>
            </div>
            <SettingSummary qrCode={qrCode} />
          </div>
        </div>
      </Link>
    </GlassCard>
  );
}

function SettingSummary({ qrCode }: { qrCode: WorkspaceQrCode }) {
  const { t } = useTranslation();
  const summary = (inherited: boolean, enabled: boolean) =>
    inherited
      ? t('qrCodes.summaryWorkspace', 'workspace')
      : enabled
      ? t('qrCodes.summaryCustomOn', 'custom · on')
      : t('qrCodes.summaryCustomOff', 'custom · off');

  const items: { label: string; value: string }[] = [
    {
      label: t('qrCodes.ip', 'IP'),
      value: summary(qrCode.inheritIpSettings, qrCode.ipRestrictionEnabled),
    },
    {
      label: t('qrCodes.geofence', 'Geofence'),
      value: summary(qrCode.inheritGeofencing, qrCode.geofencingEnabled),
    },
    {
      label: t('qrCodes.device', 'Device'),
      value: summary(qrCode.inheritDeviceVerification, qrCode.deviceVerificationEnabled),
    },
  ];

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item.label}
          className="text-[11.5px] px-2 py-0.5 rounded-full bg-cream-3/50 text-text-secondary"
        >
          {item.label}: <span className="font-medium">{item.value}</span>
        </span>
      ))}
    </div>
  );
}

// ── Create modal — name only; full configuration on the detail page ──

interface CreateModalProps {
  submitting: boolean;
  onSubmit: (input: WorkspaceQrCodeInput) => void;
  onClose: () => void;
}

function QrCodeCreateModal({ submitting, onSubmit, onClose }: CreateModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error(t('qrCodes.nameRequired', 'Name is required'));
      return;
    }
    onSubmit({ name: trimmed });
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg text-[15.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee transition-colors';

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-cream rounded-2xl border border-cream-3 shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
          <div className="px-6 py-4 border-b border-cream-3 flex items-center justify-between rounded-t-2xl">
            <Dialog.Title className="text-[18px] font-semibold text-text-primary">
              {t('qrCodes.new', 'New QR code')}
            </Dialog.Title>
            <Dialog.Close
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-transparent border-none text-text-tertiary hover:text-text-secondary hover:bg-cream-3/40 cursor-pointer transition-all"
              aria-label="Close"
            >
              <X size={15} />
            </Dialog.Close>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="qr-name" className="block text-[13px] font-medium text-text-secondary mb-1">
                {t('qrCodes.name', 'Name')}
              </label>
              <input
                id="qr-name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit();
                }}
                placeholder={t('qrCodes.namePlaceholder', 'e.g. Floor 1, Kitchen entrance')}
                className={inputClass}
                autoFocus
              />
            </div>
            <p className="text-[12.5px] text-text-tertiary">
              {t('qrCodes.afterCreateHint', 'You’ll be taken to the QR detail page to assign employees and adjust settings.')}
            </p>
          </div>

          <div className="px-6 py-4 border-t border-cream-3 flex items-center justify-end gap-2 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[15px] font-medium bg-glass-bg border border-cream-3 text-text-secondary cursor-pointer hover:bg-cream-3/40 transition-colors"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-[15px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50 transition-colors"
            >
              {submitting ? t('common.loading') : t('common.create', 'Create')}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
