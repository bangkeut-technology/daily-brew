import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { EmployeeCard } from '@/types';

interface CardRevokeModalProps {
  card: EmployeeCard | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}

/**
 * Revoking is the only way to take a card back — the signature stays valid
 * until the card expires, so the door has to be told. A reason is required for
 * the same reason attendance voids require one: someone will ask later why a
 * card stopped working.
 */
export function CardRevokeModal({ card, onOpenChange, onConfirm, loading }: CardRevokeModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (card) setReason('');
  }, [card]);

  return (
    <Dialog.Root open={!!card} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-[420px] bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="p-6 space-y-4">
            <Dialog.Title className="text-[18px] font-semibold text-text-primary font-serif">
              {t('settings.revokeCardTitle', 'Revoke this card?')}
            </Dialog.Title>
            <Dialog.Description className="text-[14.5px] text-text-secondary leading-relaxed -mt-2">
              {card ? `${card.employeeName ?? ''} · ${card.label}` : ''}
            </Dialog.Description>

            <p className="text-[13.5px] text-text-tertiary leading-relaxed">
              {t(
                'settings.revokeCardDesc',
                'The kiosk stops accepting it the next time it syncs. This cannot be undone — a replacement is a new card.',
              )}
            </p>

            <div>
              <label htmlFor="card-revoke-reason" className="block text-[13px] font-medium text-text-secondary mb-1">
                {t('attendance.editReason', 'Reason')} <span className="text-red">*</span>
              </label>
              <textarea
                id="card-revoke-reason"
                name="cardRevokeReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={255}
                placeholder={t('settings.revokeCardReason', 'e.g. Lost — left in a taxi')}
                className="w-full px-3 py-2 rounded-lg text-[15px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee font-sans resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 rounded-lg text-[15px] font-medium bg-transparent text-text-secondary border border-cream-3 cursor-pointer hover:bg-cream-3 transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => onConfirm(reason.trim())}
                disabled={!reason.trim() || loading}
                className="px-4 py-2 rounded-lg text-[15px] font-medium text-white bg-red border-none cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? t('common.loading', 'Loading...') : t('settings.revokeCard', 'Revoke card')}
              </button>
            </div>
          </div>
          <Dialog.Close className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center bg-transparent border-none text-text-tertiary hover:text-text-secondary hover:bg-cream-3/40 cursor-pointer transition-all">
            <X size={15} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
