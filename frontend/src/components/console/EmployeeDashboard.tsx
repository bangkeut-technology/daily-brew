"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { CalendarDays, CalendarOff, Clock, Loader2, LogIn, LogOut, Plus } from "lucide-react";
import { getWorkspacePublicId } from "@/lib/api";
import { parseDateAsUTC } from "@/lib/timezone";
import { useRoleContext } from "@/hooks/useRoleContext";
import { useWorkspace } from "@/hooks/useWorkspaces";
import { useCheckinStatus } from "@/hooks/useCheckin";
import { useClosures } from "@/hooks/useClosures";
import { useLeaveRequests } from "@/hooks/useLeaveRequests";
import { useDateFormat } from "@/hooks/useDateFormat";
import { useWorkspaceTimezone } from "@/hooks/useWorkspaceSettings";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard, GlassCardHeader } from "@/components/shared/GlassCard";
import { DashboardInsights } from "@/components/console/DashboardInsights";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar } from "@/components/shared/Avatar";
import { LeaveRequestModal } from "@/components/console/LeaveRequestModal";
import { Skeleton } from "@/components/admin/AdminDataStates";
import { cn } from "@/lib/utils";

const DAY_MS = 86_400_000;

export function EmployeeDashboard() {
  const { t } = useTranslation();
  const { data: ctx, isLoading: ctxLoading } = useRoleContext();
  const workspaceId = getWorkspacePublicId() || "";
  const { data: workspace } = useWorkspace(workspaceId);
  const { data: closures } = useClosures(workspaceId);
  const { data: allLeaves } = useLeaveRequests(workspaceId);
  const fmtDate = useDateFormat();
  const wsTz = useWorkspaceTimezone();
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  const employee = ctx?.employee ?? null;
  // Read-only status: every punch goes through the QR scan + device + IP
  // verification stack in the mobile app or /checkin/{token}, never here.
  const { data: checkinData, isLoading: checkinLoading } = useCheckinStatus(
    workspace?.qrToken ?? "",
  );

  if (ctxLoading) {
    return (
      <div className="page-enter" aria-busy="true">
        <Skeleton className="mb-6 h-8 w-64" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!employee || !workspaceId) {
    return (
      <div className="page-enter">
        <PageHeader title={t("nav.dashboard", "Dashboard")} />
        <GlassCard hover={false}>
          <div className="space-y-3 p-8 text-center">
            <p className="text-[15.5px] text-text-secondary">
              {t("dashboard.noEmployee", "Your account is not linked to an employee profile yet.")}
            </p>
            <p className="text-sm text-text-tertiary">
              Ask your employer to link your account, or enter your employee ID on your profile
              page.
            </p>
          </div>
        </GlassCard>
      </div>
    );
  }

  const today = checkinData?.today ?? null;
  const checkedIn = today?.checkedIn ?? false;
  const checkedOut = today?.checkedOut ?? false;
  const completed = checkedIn && checkedOut;
  // A full-day approved leave means no punch is expected at all; a half-day
  // one still does, so only the full-day case replaces the status.
  const onFullDayLeave = (checkinData?.onLeave ?? false) && (checkinData?.leaveIsFullDay ?? false);

  const todayMid = parseDateAsUTC(wsTz.today());
  const activeClosure = (closures ?? []).find(
    (c) => todayMid >= parseDateAsUTC(c.startDate) && todayMid <= parseDateAsUTC(c.endDate),
  );
  const nextClosure = (closures ?? []).find((c) => {
    const start = parseDateAsUTC(c.startDate);
    return start > todayMid && start.getTime() <= todayMid.getTime() + 7 * DAY_MS;
  });
  const upcomingClosures = (closures ?? [])
    .filter((c) => parseDateAsUTC(c.endDate) >= todayMid)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 5);

  const myLeaves = (allLeaves ?? [])
    .filter(
      (l) =>
        l.employeePublicId === employee.publicId &&
        (l.status === "pending" || (l.status === "approved" && l.endDate >= wsTz.today())),
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 5);

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: wsTz.timezone,
  });

  return (
    <div className="page-enter">
      <div className="mb-2 flex items-center gap-4">
        <Avatar name={employee.name} index={0} size={48} radius="14px" />
        <div>
          <h1 className="font-serif text-[26px] font-semibold leading-tight text-text-primary">
            {t("dashboard.welcomeBack", "Welcome back")}, {employee.name.split(" ")[0]}
          </h1>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="rounded-full bg-blue/10 px-2 py-0.5 text-xs font-semibold text-blue">
              Employee
            </span>
            <span className="text-[15px] text-text-tertiary">{todayLabel}</span>
          </div>
        </div>
      </div>

      <p className="mb-6 text-[15px] leading-relaxed text-text-secondary">
        {completed
          ? "You're all done for today. Your attendance has been recorded."
          : checkedIn
            ? "You're checked in. Don't forget to check out when your shift ends."
            : checkinData?.shiftName
              ? `Your shift (${checkinData.shiftName}) is ${checkinData.shiftStart}–${checkinData.shiftEnd}. Scan the workspace QR code to check in.`
              : "Scan the workspace QR code from the DailyBrew app to check in."}
      </p>

      {activeClosure && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red/15 bg-red/8 px-5 py-3">
          <CalendarOff size={16} className="shrink-0 text-red" />
          <div>
            <p className="text-[15px] font-medium text-red">
              Restaurant is closed — {activeClosure.name}
            </p>
            <p className="text-[13px] text-red/70">No check-in required today.</p>
          </div>
        </div>
      )}
      {!activeClosure && nextClosure && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber/15 bg-amber/8 px-5 py-3">
          <CalendarOff size={16} className="shrink-0 text-amber" />
          <div>
            <p className="text-[15px] font-medium text-amber">
              Upcoming closure — {nextClosure.name}
            </p>
            <p className="text-[13px] text-amber/70">
              {fmtDate(nextClosure.startDate)}
              {nextClosure.startDate !== nextClosure.endDate
                ? ` – ${fmtDate(nextClosure.endDate)}`
                : ""}
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <GlassCard hover={false}>
          <GlassCardHeader
            title={t("dashboard.myShift", "My shift today")}
            action={<Clock size={14} className="text-text-tertiary" />}
          />
          <div className="px-5 py-4">
            {checkinData?.shiftName ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-amber-light to-coffee">
                  <Clock size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-base font-semibold text-text-primary">
                    {checkinData.shiftName}
                  </p>
                  <p className="font-mono text-[14.5px] tabular-nums text-text-secondary">
                    {checkinData.shiftStart} &ndash; {checkinData.shiftEnd}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-[15px] text-text-tertiary">
                {t("dashboard.noShiftAssigned", "No shift assigned")}
              </p>
            )}
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <GlassCardHeader
            title={t("dashboard.myStatus", "My status")}
            action={
              onFullDayLeave && !checkedIn ? (
                <StatusBadge label={t("dashboard.onLeave", "On leave")} variant="blue" />
              ) : checkedIn ? (
                <StatusBadge
                  label={
                    completed
                      ? t("dashboard.completed", "Completed")
                      : t("dashboard.checkedIn", "Checked in")
                  }
                  variant={completed ? "green" : "blue"}
                />
              ) : (
                <StatusBadge label={t("dashboard.notCheckedIn", "Not checked in")} variant="gray" />
              )
            }
          />
          <div className="px-5 py-4">
            {checkinLoading ? (
              <div className="flex items-center gap-2 text-[15px] text-text-tertiary">
                <Loader2 size={14} className="animate-spin" />
                {t("common.loading", "Loading…")}
              </div>
            ) : onFullDayLeave && !checkedIn ? (
              <div className="flex items-center gap-3 rounded-xl border border-blue/15 bg-blue/8 px-4 py-3">
                <CalendarOff size={16} className="shrink-0 text-blue" />
                <div>
                  <p className="text-[15px] font-medium text-blue">
                    {t("dashboard.onApprovedLeave", "You are on approved leave today")}
                  </p>
                  <p className="text-[13px] text-blue/70">
                    {t("dashboard.noCheckinRequired", "No check-in required.")}
                  </p>
                </div>
              </div>
            ) : checkedIn ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <LogIn size={14} className="text-green" />
                  <span className="text-[15px] text-text-primary">Check-in:</span>
                  <span className="font-mono text-[14.5px] tabular-nums text-text-secondary">
                    {today?.checkInAt ?? "--:--"}
                  </span>
                  {today?.isLate && <StatusBadge label="Late" variant="amber" />}
                </div>
                {checkedOut && (
                  <div className="flex items-center gap-2">
                    <LogOut size={14} className="text-blue" />
                    <span className="text-[15px] text-text-primary">Check-out:</span>
                    <span className="font-mono text-[14.5px] tabular-nums text-text-secondary">
                      {today?.checkOutAt ?? "--:--"}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[15px] text-text-secondary">
                {t("dashboard.notCheckedInYet", "You have not checked in yet today.")}
              </p>
            )}
          </div>
        </GlassCard>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <MiniStat
          label="Today"
          value={completed ? "Done" : checkedIn ? "In" : "—"}
          tone={completed ? "text-green" : checkedIn ? "text-blue" : "text-text-tertiary"}
          hint={
            completed
              ? "Checked in and out"
              : checkedIn
                ? "Checked in, awaiting checkout"
                : "Not checked in yet"
          }
        />
        <MiniStat
          label="Check-in"
          value={today?.checkInAt || "—"}
          mono
          hint={today?.isLate ? "Late arrival" : today?.checkInAt ? "On time" : "Awaiting"}
        />
        <MiniStat
          label="Check-out"
          value={today?.checkOutAt || "—"}
          mono
          hint={today?.checkOutAt ? "Recorded" : checkedIn ? "Pending" : "Awaiting"}
        />
      </div>

      {/* Own punctuality over the rolling window — the trends endpoint scopes
          itself to the caller for non-manager employees. */}
      <DashboardInsights workspaceId={workspaceId} personal />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <GlassCard hover={false}>
          <GlassCardHeader title={t("dashboard.upcomingClosures", "Upcoming closures")} />
          <div className="px-5 py-4">
            {!closures ? (
              <Skeleton className="h-10" />
            ) : upcomingClosures.length === 0 ? (
              <p className="py-2 text-center text-[15px] text-text-tertiary">
                {t("dashboard.noUpcomingClosures", "No upcoming closures")}
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingClosures.map((c) => {
                  const isActive =
                    todayMid >= parseDateAsUTC(c.startDate) &&
                    todayMid <= parseDateAsUTC(c.endDate);
                  return (
                    <div key={c.publicId} className="flex items-center gap-3 py-2">
                      <CalendarOff
                        size={14}
                        className={cn("shrink-0", isActive ? "text-red" : "text-amber")}
                      />
                      <div className="flex-1">
                        <p className="text-[15px] text-text-primary">{c.name}</p>
                        <p className="text-[13px] text-text-tertiary">
                          {fmtDate(c.startDate)}
                          {c.startDate !== c.endDate ? ` – ${fmtDate(c.endDate)}` : ""}
                        </p>
                      </div>
                      <StatusBadge
                        label={isActive ? "Closed now" : "Upcoming"}
                        variant={isActive ? "red" : "amber"}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <GlassCardHeader
            title={t("dashboard.myLeaveRequests", "My leave requests")}
            action={
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setLeaveModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-coffee"
                >
                  <Plus size={12} />
                  Request
                </button>
                <Link href="/console/leave" className="text-xs font-medium text-amber no-underline">
                  {t("dashboard.viewAll", "View all")} &rarr;
                </Link>
              </div>
            }
          />
          <div className="px-5 py-4">
            {myLeaves.length === 0 ? (
              <p className="py-2 text-center text-[15px] text-text-tertiary">
                No pending or upcoming leave.
              </p>
            ) : (
              <div className="space-y-2">
                {myLeaves.map((leave) => (
                  <div key={leave.publicId} className="flex items-center gap-3 py-2">
                    <CalendarDays
                      size={14}
                      className={cn(
                        "shrink-0",
                        leave.status === "pending" ? "text-amber" : "text-green",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] text-text-primary">
                        {fmtDate(leave.startDate)}
                        {leave.startDate !== leave.endDate ? ` – ${fmtDate(leave.endDate)}` : ""}
                        {!leave.isFullDay && leave.startTime && leave.endTime && (
                          <span className="ml-1 text-[13px] text-text-tertiary">
                            {leave.startTime}–{leave.endTime}
                          </span>
                        )}
                      </p>
                      {leave.reason && (
                        <p className="truncate text-[13px] text-text-tertiary">{leave.reason}</p>
                      )}
                    </div>
                    <StatusBadge
                      label={leave.status === "pending" ? "Pending" : "Approved"}
                      variant={leave.status === "pending" ? "amber" : "green"}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      <LeaveRequestModal
        open={leaveModalOpen}
        onOpenChange={setLeaveModalOpen}
        workspaceId={workspaceId}
        employeePublicId={employee.publicId}
      />
    </div>
  );
}

function MiniStat({
  label,
  value,
  hint,
  tone,
  mono,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: string;
  mono?: boolean;
}) {
  return (
    <GlassCard hover={false}>
      <div className="p-4">
        <p className="mb-1 text-[13px] uppercase tracking-[1px] text-text-tertiary">{label}</p>
        <p
          className={cn(
            "text-[26px] font-bold tabular-nums",
            mono && "font-mono",
            tone ?? "text-text-primary",
          )}
        >
          {value}
        </p>
        <p className="mt-1 text-[13px] text-text-tertiary">{hint}</p>
      </div>
    </GlassCard>
  );
}
