"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { getWorkspacePublicId } from "@/lib/api";
import { formatTimeInTz } from "@/lib/timezone";
import { useWorkspaceTimezone } from "@/hooks/useWorkspaceSettings";
import { useAttendance } from "@/hooks/useAttendance";
import { useRoleContext } from "@/hooks/useRoleContext";
import type { AttendanceRecord } from "@/types/attendance";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Avatar } from "@/components/shared/Avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CustomDatePicker } from "@/components/shared/CustomDatePicker";
import { AttendanceEditModal } from "@/components/console/AttendanceEditModal";
import { AttendanceCreateModal } from "@/components/console/AttendanceCreateModal";
import { AttendanceDeleteModal } from "@/components/console/AttendanceDeleteModal";

export default function AttendancePage() {
  const { t } = useTranslation();
  const [workspaceId] = useState<string | null>(() => getWorkspacePublicId());
  const wsTz = useWorkspaceTimezone();
  const { data: roleContext } = useRoleContext();

  const [date, setDate] = useState<string>(() => wsTz.today());
  const { data: records, isLoading, isError } = useAttendance(workspaceId ?? "", date, date);

  const [editTarget, setEditTarget] = useState<AttendanceRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AttendanceRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const canManage =
    !!roleContext &&
    (roleContext.isOwner ||
      (roleContext.isManager && roleContext.managerPermissions.includes("manage_attendance")));

  return (
    <div className="page-enter">
      <PageHeader
        title={t("nav.attendance", "Attendance")}
        action={
          <div className="flex items-center gap-3">
            {canManage && (
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-coffee px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <Plus size={16} />
                Manual entry
              </button>
            )}
            <div className="w-44">
              <CustomDatePicker value={date} onChange={setDate} todayOverride={wsTz.today()} />
            </div>
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
          {records.map((rec, i) => {
            const voided = rec.status === "voided" || rec.voidedAt != null;
            return (
              <div
                key={rec.publicId}
                className={`flex items-center gap-4 px-5 py-4 ${voided ? "opacity-60" : ""}`}
              >
                <Avatar name={rec.employeeName ?? "?"} index={i} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-text-primary">{rec.employeeName}</p>
                  {voided && rec.voidedByEmail ? (
                    <p className="truncate text-sm text-text-tertiary">
                      Removed by {rec.voidedByEmail}
                      {rec.voidReason ? ` · ${rec.voidReason}` : ""}
                    </p>
                  ) : (
                    rec.shiftName && (
                      <p className="truncate text-sm text-text-tertiary">{rec.shiftName}</p>
                    )
                  )}
                </div>

                <div
                  className={`text-right font-mono text-sm tabular-nums text-text-secondary ${
                    voided ? "line-through" : ""
                  }`}
                >
                  <span className={!voided && rec.isLate ? "text-red" : undefined}>
                    {formatTimeInTz(rec.checkInAt, wsTz.timezone)}
                  </span>
                  {" – "}
                  <span className={!voided && rec.leftEarly ? "text-red" : undefined}>
                    {formatTimeInTz(rec.checkOutAt, wsTz.timezone)}
                  </span>
                </div>

                <div className="flex w-28 flex-wrap justify-end gap-1">
                  {voided ? (
                    <StatusBadge label="Voided" variant="gray" />
                  ) : (
                    <>
                      {rec.isLate && <StatusBadge label="Late" variant="red" />}
                      {rec.leftEarly && <StatusBadge label="Left early" variant="amber" />}
                      {rec.editedAt && <StatusBadge label="Edited" variant="gray" />}
                    </>
                  )}
                </div>

                {canManage && !voided && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditTarget(rec)}
                      aria-label={`Edit ${rec.employeeName}'s attendance`}
                      className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-cream-3 hover:text-coffee"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(rec)}
                      aria-label={`Remove ${rec.employeeName}'s attendance`}
                      className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-red/10 hover:text-red"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </GlassCard>
      )}

      <AttendanceEditModal
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        workspaceId={workspaceId ?? ""}
        tz={wsTz.timezone}
        record={editTarget}
      />

      <AttendanceDeleteModal
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        workspaceId={workspaceId ?? ""}
        tz={wsTz.timezone}
        record={deleteTarget}
      />

      <AttendanceCreateModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        workspaceId={workspaceId ?? ""}
        today={wsTz.today()}
        defaultDate={date}
        onCollision={(existing) => setEditTarget(existing)}
      />
    </div>
  );
}
