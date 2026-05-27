"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getWorkspacePublicId } from "@/lib/api";
import { formatTimeInTz } from "@/lib/timezone";
import { useWorkspaceTimezone } from "@/hooks/useWorkspaceSettings";
import { useAttendance } from "@/hooks/useAttendance";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Avatar } from "@/components/shared/Avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CustomDatePicker } from "@/components/shared/CustomDatePicker";

export default function AttendancePage() {
  const { t } = useTranslation();
  const [workspaceId] = useState<string | null>(() => getWorkspacePublicId());
  const wsTz = useWorkspaceTimezone();

  const [date, setDate] = useState<string>(() => wsTz.today());
  const { data: records, isLoading, isError } = useAttendance(workspaceId ?? "", date, date);

  return (
    <div className="page-enter">
      <PageHeader
        title={t("nav.attendance", "Attendance")}
        action={
          <div className="w-44">
            <CustomDatePicker value={date} onChange={setDate} todayOverride={wsTz.today()} />
          </div>
        }
      />

      {isLoading && <p className="text-text-secondary">Loading…</p>}
      {isError && <p className="text-red">Could not load attendance.</p>}

      {records && records.length === 0 && (
        <GlassCard hover={false} className="p-8 text-center">
          <p className="text-text-secondary">No attendance recorded for this day.</p>
        </GlassCard>
      )}

      {records && records.length > 0 && (
        <GlassCard hover={false} className="divide-y divide-cream-3/70">
          {records.map((rec, i) => (
            <div key={rec.publicId} className="flex items-center gap-4 px-5 py-4">
              <Avatar name={rec.employeeName ?? "?"} index={i} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-text-primary">{rec.employeeName}</p>
                {rec.shiftName && (
                  <p className="truncate text-sm text-text-tertiary">{rec.shiftName}</p>
                )}
              </div>

              <div className="text-right font-mono text-sm tabular-nums text-text-secondary">
                <span className={rec.isLate ? "text-red" : undefined}>
                  {formatTimeInTz(rec.checkInAt, wsTz.timezone)}
                </span>
                {" – "}
                <span className={rec.leftEarly ? "text-red" : undefined}>
                  {formatTimeInTz(rec.checkOutAt, wsTz.timezone)}
                </span>
              </div>

              <div className="flex w-28 flex-wrap justify-end gap-1">
                {rec.isLate && <StatusBadge label="Late" variant="red" />}
                {rec.leftEarly && <StatusBadge label="Left early" variant="amber" />}
                {rec.editedAt && <StatusBadge label="Edited" variant="gray" />}
              </div>
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
}
