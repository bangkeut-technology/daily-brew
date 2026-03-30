import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
  onConfirm: () => void;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading,
  onConfirm,
}: ConfirmModalProps) {
  const isDanger = variant === 'danger';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-[380px] bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
          <div className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', isDanger ? 'bg-red/10' : 'bg-amber/10')}>
                <AlertTriangle size={20} className={cn(isDanger ? 'text-red' : 'text-amber')} />
              </div>
              <div>
                <Dialog.Title className="text-[17px] font-semibold text-text-primary">
                  {title}
                </Dialog.Title>
                <Dialog.Description className="text-[14.5px] text-text-secondary mt-1 leading-relaxed">
                  {description}
                </Dialog.Description>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 rounded-lg text-[15px] font-medium bg-transparent text-text-secondary border border-cream-3 cursor-pointer hover:bg-cream-3 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onOpenChange(false);
                }}
                disabled={loading}
                className={cn(
                  'px-4 py-2 rounded-lg text-[15px] font-medium text-white border-none cursor-pointer transition-colors disabled:opacity-50',
                  isDanger
                    ? 'bg-red hover:bg-red/90'
                    : 'bg-coffee hover:bg-coffee-light'
                )}
              >
                {confirmLabel}
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
