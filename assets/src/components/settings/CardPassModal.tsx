import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Dialog from '@radix-ui/react-dialog';
import { Check, Copy, X } from 'lucide-react';
import type { EmployeeCardIssueResult } from '@/types';

interface CardPassModalProps {
  issued: EmployeeCardIssueResult | null;
  onClose: () => void;
}

/**
 * The one and only time the pass is visible.
 *
 * The server derives these bytes from the card row plus the workspace signing
 * key and never stores them, so there is no "show again" — a card that was
 * never written to a tag is re-issued, not recovered. The copy says so plainly
 * rather than leaving the operator to discover it.
 */
export function CardPassModal({ issued, onClose }: CardPassModalProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!issued) return;
    await navigator.clipboard.writeText(issued.pass.base64Url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog.Root open={!!issued} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-[460px] bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="p-6 space-y-4">
            <Dialog.Title className="text-[18px] font-semibold text-text-primary font-serif">
              {t('settings.cardIssuedTitle', 'Card issued')}
            </Dialog.Title>
            <Dialog.Description className="text-[14.5px] text-text-secondary leading-relaxed -mt-2">
              {issued
                ? t('settings.cardIssuedDesc', '{{name}} · {{label}}', {
                    name: issued.card.employeeName ?? '',
                    label: issued.card.label,
                  })
                : ''}
            </Dialog.Description>

            <p className="text-[13.5px] text-amber leading-relaxed bg-amber/10 rounded-lg px-3 py-2.5">
              {t(
                'settings.cardIssuedOnce',
                'Write this to the card now. It is shown once and cannot be retrieved later — if you lose it, revoke the card and issue a new one.',
              )}
            </p>

            <div>
              <label htmlFor="card-pass" className="block text-[13px] font-medium text-text-secondary mb-1">
                {t('settings.cardPass', 'Card data')}
              </label>
              <div className="flex gap-2">
                <input
                  id="card-pass"
                  name="cardPass"
                  readOnly
                  value={issued?.pass.base64Url ?? ''}
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg text-[13px] font-mono bg-cream-3/40 border border-cream-3 text-text-primary outline-none"
                />
                <button
                  type="button"
                  onClick={copy}
                  aria-label={t('common.copy', 'Copy')}
                  className="px-3 py-2 rounded-lg bg-glass-bg border border-cream-3 text-text-secondary cursor-pointer hover:bg-cream-3 transition-colors"
                >
                  {copied ? <Check size={15} className="text-green" /> : <Copy size={15} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-[15px] font-medium text-white bg-coffee border-none cursor-pointer hover:bg-coffee-light transition-colors"
              >
                {t('settings.cardWritten', "I've written the card")}
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
