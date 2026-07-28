"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarX2, Clock, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseDateAsUTC } from "@/lib/timezone";
import { useWorkspaceTimezone } from "@/hooks/useWorkspaceSettings";
import type { ClosurePeriod } from "@/types/closure";
import { GlassCard } from "@/components/shared/GlassCard";
import { CustomDatePicker } from "@/components/shared/CustomDatePicker";
import { StatusBadge } from "@/components/shared/StatusBadge";

const DAY_MS = 86_400_000;

const inputClass =
  "w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[15.5px] text-text-primary outline-none transition-colors focus:border-coffee";

/**
 * A closure period, with its status (upcoming / active / past) doing the
 * visual work — an owner scanning the grid mostly wants to know "are we shut
 * right now, and what's next", not to read dates.
 */
export function ClosureCard({
  closure,
  formatDate,
  onDelete,
  onUpdate,
  deleting,
  updating,
}: {
  closure: ClosurePeriod;
  formatDate: (iso: string) => string;
  onDelete: () => void;
  onUpdate: (data: { name: string; startDate: string; endDate: string }) => Promise<void>;
  deleting: boolean;
  updating: boolean;
}) {
  const { t } = useTranslation();
  const wsTz = useWorkspaceTimezone();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(closure.name);
  const [editStart, setEditStart] = useState(closure.startDate);
  const [editEnd, setEditEnd] = useState(closure.endDate);

  const start = parseDateAsUTC(closure.startDate);
  const end = parseDateAsUTC(closure.endDate);
  const today = parseDateAsUTC(wsTz.today());

  const days = Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
  const isActive = today >= start && today <= end;
  const isPast = today > end;
  const isUpcoming = today < start;

  const statusLabel = isActive
    ? t("closure.statusActive", "Active")
    : isPast
      ? t("closure.statusPast", "Past")
      : t("closure.statusUpcoming", "Upcoming");
  const statusVariant = isActive ? "red" : isPast ? "gray" : "amber";
  const accent = isActive
    ? "from-red to-red/70"
    : isPast
      ? "from-text-tertiary to-text-tertiary/70"
      : "from-amber to-amber-light";

  const startEdit = () => {
    setEditName(closure.name);
    setEditStart(closure.startDate);
    setEditEnd(closure.endDate);
    setIsEditing(true);
  };

  const save = async () => {
    await onUpdate({ name: editName.trim(), startDate: editStart, endDate: editEnd });
    setIsEditing(false);
  };

  return (
    <GlassCard hover={!isPast && !isEditing} className={isEditing ? "overflow-visible" : undefined}>
      <div className="relative">
        <div className={cn("absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-linear-to-r", accent)} />
        <div className="px-5 pb-3 pt-5">
          {isEditing ? (
            <div className="space-y-3">
              <label htmlFor={`closure-name-${closure.publicId}`} className="sr-only">
                {t("closure.nameLabel", "Closure name")}
              </label>
              <input
                id={`closure-name-${closure.publicId}`}
                name="closureName"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder={t("closure.nameLabel", "Closure name")}
                className={inputClass}
                autoFocus
              />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label
                    htmlFor={`closure-start-${closure.publicId}`}
                    className="mb-1 block text-[13px] font-medium text-text-secondary"
                  >
                    {t("closure.startDate", "Start date")}
                  </label>
                  <CustomDatePicker
                    id={`closure-start-${closure.publicId}`}
                    value={editStart}
                    onChange={setEditStart}
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor={`closure-end-${closure.publicId}`}
                    className="mb-1 block text-[13px] font-medium text-text-secondary"
                  >
                    {t("closure.endDate", "End date")}
                  </label>
                  <CustomDatePicker
                    id={`closure-end-${closure.publicId}`}
                    value={editEnd}
                    onChange={setEditEnd}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={save}
                  disabled={updating || !editName.trim() || !editStart || !editEnd || editEnd < editStart}
                  className="rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50"
                >
                  {updating ? t("common.loading", "Loading...") : t("common.save", "Save")}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg border border-cream-3 bg-glass-bg px-4 py-2 text-[15px] font-medium text-text-secondary transition-colors hover:bg-cream-3/40"
                >
                  {t("common.cancel", "Cancel")}
                </button>
              </div>
              {editEnd < editStart && (
                <p className="text-[13px] text-red">
                  {t("closure.endBeforeStart", "End date must be on or after the start date")}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3
                  className={cn(
                    "truncate text-[17px] font-semibold",
                    isPast ? "text-text-tertiary" : "text-text-primary",
                  )}
                >
                  {closure.name}
                </h3>
                <div className="mt-1.5 flex items-center gap-2">
                  <StatusBadge label={statusLabel} variant={statusVariant} />
                  <span className="rounded-full bg-cream-3/40 px-2 py-0.5 text-[12.5px] font-medium text-text-secondary">
                    {t("closure.dayCount", "{{count}} day", { count: days })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={startEdit}
                  aria-label={t("closure.editAria", "Edit closure")}
                  className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-coffee/8 hover:text-coffee"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={deleting}
                  aria-label={t("closure.deleteAria", "Delete closure")}
                  className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-red/8 hover:text-red disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isEditing && (
        <div className="space-y-2 border-t border-cream-3/80 px-5 py-3">
          <div className="flex items-center gap-2">
            <CalendarX2 size={13} className={isActive ? "text-red" : "text-text-tertiary"} />
            <span className="font-mono text-[15px] tabular-nums text-text-secondary">
              {formatDate(closure.startDate)} &ndash; {formatDate(closure.endDate)}
            </span>
          </div>
          {isUpcoming && (
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-amber" />
              <span className="text-[13.5px] text-text-tertiary">
                {t("closure.startsIn", "Starts in {{count}} day", {
                  count: Math.round((start.getTime() - today.getTime()) / DAY_MS),
                })}
              </span>
            </div>
          )}
          {isActive && (
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-red" />
              <span className="text-[13.5px] text-red">
                {t("closure.daysRemaining", "{{count}} day remaining", {
                  count: Math.round((end.getTime() - today.getTime()) / DAY_MS) + 1,
                })}
              </span>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
