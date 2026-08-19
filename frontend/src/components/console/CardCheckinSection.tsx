"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { GlassCard, GlassCardHeader } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { Avatar } from "@/components/shared/Avatar";
import { CardPassModal } from "./CardPassModal";
import { CardRevokeModal } from "./CardRevokeModal";
import {
  useEmployeeCards,
  useIssueEmployeeCard,
  useRevokeEmployeeCard,
} from "@/hooks/useEmployeeCards";
import type { EmployeeCard, EmployeeCardIssueResult } from "@/types/employee-card";
import { cn } from "@/lib/utils";

interface CardCheckinSectionProps {
  workspacePublicId: string;
  employees: { publicId: string; name: string }[];
}

/** Pull an API error message out of an axios failure, falling back to a default. */
function messageOf(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
    if (message) return message;
  }
  return fallback;
}

/**
 * The cards in circulation, shown once card check-in is switched on.
 *
 * Issuing surfaces the pass exactly once — the server derives it from the card
 * row and the workspace key and never stores it, so that modal is the only
 * chance to write a tag. Revoking is the only way to take a card back: the
 * signature stays valid until it expires, and the door has to be told.
 */
export function CardCheckinSection({ workspacePublicId, employees }: CardCheckinSectionProps) {
  const { t } = useTranslation();

  const { data: cards } = useEmployeeCards(workspacePublicId);
  const issue = useIssueEmployeeCard(workspacePublicId);
  const revoke = useRevokeEmployeeCard(workspacePublicId);

  const [employeePublicId, setEmployeePublicId] = useState("");
  const [label, setLabel] = useState("");
  const [issued, setIssued] = useState<EmployeeCardIssueResult | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<EmployeeCard | null>(null);

  const employeeOptions = employees.map((e) => ({ value: e.publicId, label: e.name }));

  const handleIssue = async () => {
    if (!employeePublicId || !label.trim()) return;
    try {
      const result = await issue.mutateAsync({ employeePublicId, label: label.trim() });
      setIssued(result);
      setEmployeePublicId("");
      setLabel("");
    } catch (err: unknown) {
      toast.error(messageOf(err, t("settings.cardIssueError", "Could not issue that card")));
    }
  };

  const handleRevoke = async (reason: string) => {
    if (!revokeTarget || !reason) return;
    try {
      await revoke.mutateAsync({ publicId: revokeTarget.publicId, reason });
      toast.success(t("settings.cardRevoked", "Card revoked"));
      setRevokeTarget(null);
    } catch (err: unknown) {
      toast.error(messageOf(err, t("settings.cardRevokeError", "Could not revoke that card")));
    }
  };

  return (
    <GlassCard hover={false}>
      <GlassCardHeader title={t("settings.issueCard", "Issue a card")} />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <label htmlFor="card-employee" className="mb-1 block text-[13px] text-text-tertiary">
              {t("attendance.employee", "Employee")}
            </label>
            <CustomSelect
              id="card-employee"
              value={employeePublicId}
              onChange={setEmployeePublicId}
              options={employeeOptions}
              placeholder={t("attendance.selectEmployee", "Select employee")}
              renderOption={(opt, idx) => (
                <>
                  <Avatar name={opt.label} index={idx} size={22} />
                  <span className="truncate">{opt.label}</span>
                </>
              )}
            />
          </div>
          <div>
            <label htmlFor="card-label" className="mb-1 block text-[13px] text-text-tertiary">
              {t("settings.cardLabel", "Card name")}
            </label>
            <input
              id="card-label"
              name="cardLabel"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={100}
              placeholder={t("settings.cardLabelPlaceholder", "e.g. Blue card")}
              className="w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 font-sans text-[15px] text-text-primary outline-none focus:border-coffee"
            />
          </div>
          <button
            type="button"
            onClick={handleIssue}
            disabled={!employeePublicId || !label.trim() || issue.isPending}
            className="cursor-pointer rounded-lg border-none bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50"
          >
            {issue.isPending ? t("common.loading", "Loading...") : t("settings.issue", "Issue")}
          </button>
        </div>

        <div className="border-t border-cream-3/70 pt-4">
          {(cards?.length ?? 0) === 0 ? (
            <p className="py-6 text-center text-[14px] text-text-tertiary">
              {t(
                "settings.noCards",
                "No cards yet — issue one above, then hold a blank card to the kiosk to write it.",
              )}
            </p>
          ) : (
            <ul className="space-y-2">
              {cards?.map((card, index) => (
                <li
                  key={card.publicId}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border border-cream-3 bg-glass-bg px-3 py-2.5",
                    card.revokedAt && "opacity-60",
                  )}
                >
                  <Avatar name={card.employeeName ?? "?"} index={index} size={26} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14.5px] text-text-primary">
                      {card.employeeName}
                      <span className="text-text-tertiary"> · {card.label}</span>
                    </p>
                    {card.revokedAt ? (
                      <p className="truncate text-[12.5px] text-text-tertiary">
                        {t("settings.cardRevokedBy", "Revoked by {{email}}", {
                          email: card.revokedByEmail ?? "—",
                        })}
                        {card.revokeReason ? ` · ${card.revokeReason}` : ""}
                      </p>
                    ) : (
                      <p className="font-mono text-[12.5px] tabular-nums text-text-tertiary">
                        {card.publicId}
                      </p>
                    )}
                  </div>
                  {card.revokedAt ? (
                    <StatusBadge label={t("settings.cardRevokedBadge", "Revoked")} variant="gray" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRevokeTarget(card)}
                      aria-label={t("settings.revokeCard", "Revoke card")}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-text-tertiary transition-colors hover:bg-red/10 hover:text-red"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <CardPassModal issued={issued} onClose={() => setIssued(null)} />

      <CardRevokeModal
        key={revokeTarget?.publicId ?? "none"}
        card={revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        onConfirm={handleRevoke}
        loading={revoke.isPending}
      />
    </GlassCard>
  );
}
