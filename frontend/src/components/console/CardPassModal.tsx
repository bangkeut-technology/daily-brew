"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Copy, X } from "lucide-react";
import type { EmployeeCardIssueResult } from "@/types/employee-card";

interface CardPassModalProps {
  issued: EmployeeCardIssueResult | null;
  onClose: () => void;
}

/**
 * The one and only time the pass is visible.
 *
 * The server derives these bytes from the card row plus the workspace signing
 * key and never stores them, so there is no "show again" — a card that was
 * never written to a tag is re-issued, not recovered. The copy says so rather
 * than leaving the operator to discover it.
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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-glass-border bg-glass-bg shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="space-y-4 p-6">
            <Dialog.Title className="font-serif text-[18px] font-semibold text-text-primary">
              {t("settings.cardIssuedTitle", "Card issued")}
            </Dialog.Title>
            <Dialog.Description className="-mt-2 text-[14.5px] leading-relaxed text-text-secondary">
              {issued
                ? t("settings.cardIssuedDesc", "{{name}} · {{label}}", {
                    name: issued.card.employeeName ?? "",
                    label: issued.card.label,
                  })
                : ""}
            </Dialog.Description>

            <p className="rounded-lg bg-amber/10 px-3 py-2.5 text-[13.5px] leading-relaxed text-amber">
              {t(
                "settings.cardIssuedOnce",
                "Write this to the card now. It is shown once and cannot be retrieved later — if you lose it, revoke the card and issue a new one.",
              )}
            </p>

            <div>
              <label htmlFor="card-pass" className="mb-1 block text-[13px] font-medium text-text-secondary">
                {t("settings.cardPass", "Card data")}
              </label>
              <div className="flex gap-2">
                <input
                  id="card-pass"
                  name="cardPass"
                  readOnly
                  value={issued?.pass.base64Url ?? ""}
                  className="min-w-0 flex-1 rounded-lg border border-cream-3 bg-cream-3/40 px-3 py-2 font-mono text-[13px] text-text-primary outline-none"
                />
                <button
                  type="button"
                  onClick={copy}
                  aria-label={t("common.copy", "Copy")}
                  className="cursor-pointer rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-text-secondary transition-colors hover:bg-cream-3"
                >
                  {copied ? <Check size={15} className="text-green" /> : <Copy size={15} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg border-none bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-coffee-light"
              >
                {t("settings.cardWritten", "I've written the card")}
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
