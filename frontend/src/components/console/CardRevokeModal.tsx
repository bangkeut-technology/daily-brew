"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { EmployeeCard } from "@/types/employee-card";

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
  // Reset comes from remounting: the caller keys this on the card's id, so a
  // second card opens with an empty box rather than the previous reason.
  const [reason, setReason] = useState("");

  return (
    <Dialog.Root open={!!card} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-glass-border bg-glass-bg shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="space-y-4 p-6">
            <Dialog.Title className="font-serif text-[18px] font-semibold text-text-primary">
              {t("settings.revokeCardTitle", "Revoke this card?")}
            </Dialog.Title>
            <Dialog.Description className="-mt-2 text-[14.5px] leading-relaxed text-text-secondary">
              {card ? `${card.employeeName ?? ""} · ${card.label}` : ""}
            </Dialog.Description>

            <p className="text-[13.5px] leading-relaxed text-text-tertiary">
              {t(
                "settings.revokeCardDesc",
                "The kiosk stops accepting it the next time it syncs. This cannot be undone — a replacement is a new card.",
              )}
            </p>

            <div>
              <label
                htmlFor="card-revoke-reason"
                className="mb-1 block text-[13px] font-medium text-text-secondary"
              >
                {t("attendance.editReason", "Reason")} <span className="text-red">*</span>
              </label>
              <textarea
                id="card-revoke-reason"
                name="cardRevokeReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={255}
                placeholder={t("settings.revokeCardReason", "e.g. Lost — left in a taxi")}
                className="w-full resize-none rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 font-sans text-[15px] text-text-primary outline-none focus:border-coffee"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer rounded-lg border border-cream-3 bg-transparent px-4 py-2 text-[15px] font-medium text-text-secondary transition-colors hover:bg-cream-3"
              >
                {t("common.cancel", "Cancel")}
              </button>
              <button
                type="button"
                onClick={() => onConfirm(reason.trim())}
                disabled={!reason.trim() || loading}
                className="cursor-pointer rounded-lg border-none bg-red px-4 py-2 text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? t("common.loading", "Loading...") : t("settings.revokeCard", "Revoke card")}
              </button>
            </div>
          </div>
          <Dialog.Close className="absolute right-3 top-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-text-tertiary transition-all hover:bg-cream-3/40 hover:text-text-secondary">
            <X size={15} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
