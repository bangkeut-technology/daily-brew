"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface NextDayBadgeProps {
  className?: string;
}

/**
 * The "+1" marker for a check-out clock time that belongs to the day *after*
 * the attendance date — an overnight shift is filed under the day it started,
 * so without this "18:00 → 02:00" reads as negative hours.
 *
 * Shared by the attendance rows (where the backend supplies `checkOutNextDay`)
 * and the create/edit modals (where it is derived from the times being typed).
 */
export function NextDayBadge({ className }: NextDayBadgeProps) {
  const { t } = useTranslation();

  return (
    <span
      title={t("attendance.nextDayTooltip", "Checked out the next day")}
      className={cn("ml-1 text-[11px] font-sans font-medium text-amber", className)}
    >
      {t("attendance.nextDay", "+1")}
    </span>
  );
}
