"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  loading?: boolean;
  onConfirm: () => void;
  /** Optional content between description and actions (e.g. a date picker). */
  children?: ReactNode;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading,
  onConfirm,
  children,
}: ConfirmModalProps) {
  const isDanger = variant === "danger";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-glass-border bg-glass-bg shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none backdrop-blur-xl">
          <div className="p-6">
            <div className="mb-4 flex items-start gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl",
                  isDanger ? "bg-red/10" : "bg-amber/10",
                )}
              >
                <AlertTriangle size={20} className={cn(isDanger ? "text-red" : "text-amber")} />
              </div>
              <div>
                <Dialog.Title className="text-[17px] font-semibold text-text-primary">
                  {title}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-[14.5px] leading-relaxed text-text-secondary">
                  {description}
                </Dialog.Description>
              </div>
            </div>

            {children && <div className="mb-4">{children}</div>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer rounded-lg border border-cream-3 bg-transparent px-4 py-2 text-[15px] font-medium text-text-secondary transition-colors hover:bg-cream-3"
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
                  "cursor-pointer rounded-lg border-none px-4 py-2 text-[15px] font-medium text-white transition-colors disabled:opacity-50",
                  isDanger ? "bg-red hover:bg-red/90" : "bg-coffee hover:bg-coffee-light",
                )}
              >
                {confirmLabel}
              </button>
            </div>
          </div>

          <Dialog.Close className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg border-none bg-transparent text-text-tertiary transition-all hover:bg-cream-3/40 hover:text-text-secondary">
            <X size={15} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
