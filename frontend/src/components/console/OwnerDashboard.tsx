"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  CalendarDays,
  CalendarOff,
  CheckCircle,
  ClipboardList,
  Clock,
  Coffee,
  Copy,
  Crown,
  Palmtree,
  QrCode,
  Settings,
  UserPlus,
  XCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { getWorkspacePublicId } from "@/lib/api";
import { parseDateAsUTC } from "@/lib/timezone";
import { useDashboard } from "@/hooks/useDashboard";
import { useWorkspace, useWorkspaces } from "@/hooks/useWorkspaces";
import { usePlan } from "@/hooks/usePlan";
import { useRoleContext } from "@/hooks/useRoleContext";
import { useClosures } from "@/hooks/useClosures";
import { useLeaveRequests, useReviewLeaveRequest } from "@/hooks/useLeaveRequests";
import { useDateFormat } from "@/hooks/useDateFormat";
import { useWorkspaceTimezone } from "@/hooks/useWorkspaceSettings";
import { useFeatureEnabled } from "@/hooks/useFeatures";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard, GlassCardHeader } from "@/components/shared/GlassCard";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar } from "@/components/shared/Avatar";
import { CheckinUrlRow } from "@/components/console/CheckinUrlRow";
import { DashboardInsights } from "@/components/console/DashboardInsights";
import { GuidedTour } from "@/components/console/GuidedTour";
import { ManagerCheckinCard } from "@/components/console/ManagerCheckinCard";
import { Skeleton } from "@/components/admin/AdminDataStates";
import { cn } from "@/lib/utils";

const DAY_MS = 86_400_000;

export function OwnerDashboard() {
  const { t } = useTranslation();
  const workspaceId = getWorkspacePublicId() || "";
  const { data, isLoading } = useDashboard(workspaceId);
  const { data: workspaces } = useWorkspaces();
  const { data: plan } = usePlan(workspaceId);
  const { data: roleContext } = useRoleContext();
  const { data: workspace } = useWorkspace(workspaceId);
  const nfcEnabled = useFeatureEnabled("nfc_checkin");
  const canUseLeave = plan?.canUseLeaveRequests ?? false;
  const isManagerView = !!roleContext?.isManager && !roleContext?.isOwner;
  const { data: leaveRequests } = useLeaveRequests(canUseLeave ? workspaceId : "");
  const reviewLeave = useReviewLeaveRequest(workspaceId);
  const fmtDate = useDateFormat();
  const { data: closures } = useClosures(workspaceId);
  const wsTz = useWorkspaceTimezone();

  const currentWs = workspaces?.find((ws) => ws.publicId === workspaceId) ?? workspace;
  const qrToken = currentWs?.qrToken ?? "";

  // "Today" in workspace time, as a UTC-midnight Date so it compares cleanly
  // against the calendar dates the API returns.
  const today = parseDateAsUTC(wsTz.today());

  const activeClosures = (closures ?? []).filter((c) => {
    return today >= parseDateAsUTC(c.startDate) && today <= parseDateAsUTC(c.endDate);
  });
  const upcomingClosures = (closures ?? [])
    .filter((c) => {
      const start = parseDateAsUTC(c.startDate);
      return start > today && start.getTime() <= today.getTime() + 30 * DAY_MS;
    })
    .slice(0, 3);

  const upcomingLeaves = (leaveRequests ?? [])
    .filter((lr) => {
      if (lr.status !== "approved" && lr.status !== "pending") return false;
      const in14 = today.getTime() + 14 * DAY_MS;
      return (
        parseDateAsUTC(lr.endDate) >= today && parseDateAsUTC(lr.startDate).getTime() <= in14
      );
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 5);

  if (isLoading || !data) return <DashboardSkeleton />;

  if (data.totalEmployees === 0) return <EmptyWorkspaceView />;

  const ofEmployees = t("dashboard.ofEmployees", {
    count: data.totalEmployees,
    defaultValue: "of {{count}} employees",
  });

  return (
    <div className="page-enter">
      <PageHeader
        title={t("nav.dashboard", "Dashboard")}
        help={{ href: "/guides/owner", label: "Open the owner setup guide" }}
        badge={
          <div className="flex items-center gap-1.5">
            {roleContext && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  roleContext.isOwner
                    ? "bg-coffee/10 text-coffee"
                    : roleContext.isManager
                      ? "bg-amber/10 text-amber"
                      : "bg-blue/10 text-blue",
                )}
              >
                {roleContext.isOwner ? "Owner" : roleContext.isManager ? "Manager" : "Employee"}
              </span>
            )}
            {plan && (
              <Link href="/console/settings" className="no-underline">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    plan.isEspresso ? "bg-green/10 text-green" : "bg-cream-3 text-text-tertiary",
                  )}
                >
                  {plan.planLabel}
                </span>
              </Link>
            )}
          </div>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {data.pendingLeaves > 0 && canUseLeave && (
              <Link
                href="/console/leave"
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber/10 px-3 py-1.5 no-underline transition-colors hover:bg-amber/15"
              >
                <span className="text-sm font-medium text-amber">
                  {data.pendingLeaves}{" "}
                  {data.pendingLeaves === 1
                    ? t("leave.pendingRequest", "leave request pending")
                    : t("leave.pendingRequests", "leave requests pending")}
                </span>
              </Link>
            )}
            {isManagerView && canUseLeave && (
              <Link
                href="/console/leave"
                className="inline-flex items-center gap-1.5 rounded-lg bg-coffee px-3 py-1.5 text-sm font-medium text-white no-underline transition-all hover:bg-coffee-light"
              >
                <CalendarDays size={13} />
                {t("nav.leaveRequests", "Leave requests")}
              </Link>
            )}
            {!isManagerView && (
              <Link
                href="/console/employees"
                data-tour="add-employee"
                className="inline-flex items-center gap-1.5 rounded-lg bg-coffee px-3 py-1.5 text-sm font-medium text-white no-underline transition-all hover:bg-coffee-light"
              >
                <UserPlus size={13} />
                {t("dashboard.addEmployee", "Add employee")}
              </Link>
            )}
            <Link
              href="/console/attendance"
              className="inline-flex items-center gap-1.5 rounded-lg border border-cream-3 bg-glass-bg px-3 py-1.5 text-sm font-medium text-text-primary no-underline transition-all hover:bg-cream-3"
            >
              <ClipboardList size={13} />
              {t("dashboard.viewAttendance", "View attendance")}
            </Link>
          </div>
        }
      />

      {!isManagerView && <GuidedTour />}

      {isManagerView && qrToken && (
        <div className="mb-6">
          <ManagerCheckinCard qrToken={qrToken} />
        </div>
      )}

      <p className="mb-6 text-[15.5px] leading-relaxed text-text-secondary">
        {summaryLine(t, data.present, data.totalEmployees, data.late, data.absent)}
      </p>

      {!isManagerView && qrToken && (
        <GlassCard hover={false} className="mb-6">
          <div className="flex flex-col items-center gap-4 p-5 md:flex-row md:gap-5">
            <div className="shrink-0 rounded-xl bg-white p-3 shadow-[0_2px_8px_rgba(107,66,38,0.06)]">
              <QRCodeSVG
                value={`dailybrew:ws:${qrToken}`}
                size={80}
                fgColor="#6B4226"
                bgColor="#FFFFFF"
                level="M"
              />
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <QrCode size={15} className="text-coffee" />
                <h3 className="text-base font-semibold text-text-primary">
                  {t("dashboard.checkinQrTitle", "Check-in QR code")}
                </h3>
              </div>
              <p className="mb-3 text-sm leading-relaxed text-text-secondary">
                {t(
                  "dashboard.checkinQrDesc",
                  "Print and display this at your restaurant. Employees scan it with the DailyBrew app to check in and out.",
                )}
              </p>
              <div className="flex items-center gap-2">
                <code className="rounded bg-cream-3/30 px-2 py-1 font-mono text-[13px] text-text-tertiary">
                  dailybrew:ws:{qrToken}
                </code>
                <button
                  type="button"
                  aria-label="Copy QR token"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(qrToken);
                      toast.success("Token copied");
                    } catch {
                      toast.error("Failed to copy");
                    }
                  }}
                  className="rounded p-1 text-text-tertiary transition-colors hover:text-coffee"
                >
                  <Copy size={12} />
                </button>
              </div>
              {nfcEnabled && (
                <>
                  <CheckinUrlRow qrToken={qrToken} />
                  <Link
                    href="/guides/nfc"
                    className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-coffee no-underline hover:text-coffee-light"
                  >
                    {t("dashboard.setUpNfc", "Set up NFC check-in")} &rarr;
                  </Link>
                </>
              )}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Sits above the stats it explains: when the restaurant is shut, an
          absent count of 12 is expected rather than alarming. */}
      {activeClosures.length > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red/15 bg-red/8 px-5 py-3">
          <CalendarOff size={16} className="shrink-0 text-red" />
          <div className="flex-1">
            <p className="text-[15px] font-medium text-red">
              {t("dashboard.closedToday", "Restaurant is closed today")} —{" "}
              {activeClosures.map((c) => c.name).join(", ")}
            </p>
            <p className="text-[13px] text-red/70">
              {t("dashboard.closedTodayHint", "No attendance is expected during this period.")}
            </p>
          </div>
        </div>
      )}

      <div data-tour="dashboard" className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("dashboard.present", "Present today")}
          value={data.present}
          subtitle={ofEmployees}
          accent="#4A7C59"
          icon={<CheckCircle size={24} />}
        />
        <StatCard
          label={t("dashboard.late", "Late")}
          value={data.late}
          subtitle={ofEmployees}
          accent="#C17F3B"
          icon={<AlertTriangle size={24} />}
        />
        <StatCard
          label={t("dashboard.onLeave", "On leave")}
          value={data.onLeave}
          subtitle={`${data.pendingLeaves} ${t("dashboard.pending", "pending")}`}
          accent="#3B6FA0"
          icon={<Palmtree size={24} />}
        />
        <StatCard
          label={t("dashboard.absent", "Absent")}
          value={data.absent}
          subtitle={ofEmployees}
          accent="#C0392B"
          icon={<XCircle size={24} />}
        />
      </div>

      <DashboardInsights workspaceId={workspaceId} />

      {upcomingClosures.length > 0 && (
        <GlassCard hover={false} className="mb-6">
          <GlassCardHeader
            title={t("dashboard.upcomingClosures", "Upcoming closures")}
            action={
              !isManagerView ? (
                <Link href="/console/closures" className="text-xs font-medium text-amber no-underline">
                  {t("common.manage", "Manage")} &rarr;
                </Link>
              ) : undefined
            }
          />
          <div>
            {upcomingClosures.map((c) => {
              const daysUntil = Math.round(
                (parseDateAsUTC(c.startDate).getTime() - today.getTime()) / DAY_MS,
              );
              return (
                <div
                  key={c.publicId}
                  className="flex items-center gap-3 border-b border-cream-3/50 px-5 py-3 last:border-0"
                >
                  <CalendarOff size={14} className="shrink-0 text-amber" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-text-primary">{c.name}</p>
                    <p className="text-[13px] text-text-tertiary">
                      {fmtDate(c.startDate)}
                      {c.startDate !== c.endDate ? ` – ${fmtDate(c.endDate)}` : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber/10 px-2 py-0.5 text-[12.5px] font-medium text-amber">
                    {t("dashboard.inDays", { count: daysUntil, defaultValue: "in {{count}} days" })}
                  </span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      <GlassCard hover={false} className="mb-6">
        <GlassCardHeader
          title={t("dashboard.todayAttendance", "Today's attendance")}
          action={
            <Link href="/console/attendance" className="text-xs font-medium text-amber no-underline">
              {t("dashboard.viewAll", "View all")} &rarr;
            </Link>
          }
        />
        <div>
          {data.recentAttendance.length === 0 ? (
            <p className="px-5 py-8 text-center text-[15px] text-text-tertiary">
              {t("dashboard.noAttendance", "No attendance records yet today")}
            </p>
          ) : (
            data.recentAttendance.map((record, i) => (
              <div
                key={record.publicId}
                className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-cream-3/35"
              >
                <Avatar name={record.employeeName} index={i} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15.5px] font-medium text-text-primary">
                    {record.employeeName}
                  </p>
                  <p className="truncate text-[13px] text-text-tertiary">
                    {record.shiftName || t("attendance.noShift", "No shift")}
                  </p>
                </div>
                {/* Times arrive pre-formatted as workspace-local HH:MM. */}
                <span className="font-mono text-sm tabular-nums text-text-secondary">
                  {record.checkInAt ?? "—"}
                  {record.checkOutAt ? ` → ${record.checkOutAt}` : ""}
                </span>
                <StatusBadge
                  label={
                    record.isLate
                      ? t("attendance.late", "Late")
                      : record.leftEarly
                        ? t("attendance.leftEarly", "Left early")
                        : t("attendance.onTime", "On time")
                  }
                  variant={record.isLate || record.leftEarly ? "amber" : "green"}
                />
              </div>
            ))
          )}
        </div>
      </GlassCard>

      <div className="relative mb-6">
        {!canUseLeave && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-cream/80 backdrop-blur-sm dark:bg-cream/60">
            <Crown size={24} className="mb-2 text-amber" />
            <p className="mb-1 text-base font-semibold text-text-primary">
              {t("dashboard.upcomingLeaves", "Upcoming leaves")}
            </p>
            <p className="mb-3 max-w-xs text-center text-sm text-text-secondary">
              {t(
                "dashboard.upcomingLeavesUpsell",
                "Track and approve staff leave with Espresso.",
              )}
            </p>
            <Link
              href="/console/settings"
              className="rounded-xl bg-coffee px-5 py-2 text-[15px] font-medium text-white no-underline transition-all hover:bg-coffee-light"
            >
              {t("dashboard.startTrial", "Start free trial")}
            </Link>
          </div>
        )}
        <GlassCard hover={false}>
          <GlassCardHeader
            title={t("dashboard.upcomingLeaves", "Upcoming leaves")}
            action={
              canUseLeave ? (
                <Link href="/console/leave" className="text-xs font-medium text-amber no-underline">
                  {t("dashboard.viewAll", "View all")} &rarr;
                </Link>
              ) : (
                <StatusBadge label="Espresso" variant="amber" />
              )
            }
          />
          <div className={!canUseLeave ? "pointer-events-none select-none blur-[2px]" : undefined}>
            {canUseLeave && upcomingLeaves.length === 0 ? (
              <p className="px-5 py-6 text-center text-[15px] text-text-tertiary">
                {t("dashboard.noUpcomingLeaves", "No upcoming leave")}
              </p>
            ) : (
              <div>
                {(canUseLeave ? upcomingLeaves : PLACEHOLDER_LEAVES).map((lr) => (
                  <div
                    key={lr.publicId}
                    className="flex items-center gap-3 border-b border-cream-3/50 px-5 py-3 last:border-0"
                  >
                    <CalendarDays
                      size={14}
                      className={cn("shrink-0", lr.status === "pending" ? "text-amber" : "text-blue")}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium text-text-primary">
                        {lr.employeeName}
                      </p>
                      <p className="text-[13px] text-text-tertiary">
                        {fmtDate(lr.startDate)}
                        {lr.startDate !== lr.endDate ? ` – ${fmtDate(lr.endDate)}` : ""}
                      </p>
                    </div>
                    <StatusBadge
                      label={lr.status === "pending" ? "Pending" : "Approved"}
                      variant={lr.status === "pending" ? "amber" : "green"}
                    />
                    {canUseLeave && lr.status === "pending" && (
                      <div className="ml-1 flex gap-1.5">
                        <button
                          type="button"
                          aria-label="Approve leave request"
                          disabled={reviewLeave.isPending}
                          onClick={() =>
                            reviewLeave.mutate(
                              { publicId: lr.publicId, status: "approved" },
                              {
                                onSuccess: () => toast.success("Leave request approved"),
                                onError: () => toast.error("Failed to update leave request"),
                              },
                            )
                          }
                          className="rounded-md bg-green/12 px-2.5 py-1 text-[13px] font-medium text-green transition-colors hover:bg-green/20 disabled:opacity-50"
                        >
                          &#10003;
                        </button>
                        <button
                          type="button"
                          aria-label="Reject leave request"
                          disabled={reviewLeave.isPending}
                          onClick={() =>
                            reviewLeave.mutate(
                              { publicId: lr.publicId, status: "rejected" },
                              {
                                onSuccess: () => toast.success("Leave request rejected"),
                                onError: () => toast.error("Failed to update leave request"),
                              },
                            )
                          }
                          className="rounded-md bg-red/10 px-2.5 py-1 text-[13px] font-medium text-red transition-colors hover:bg-red/18 disabled:opacity-50"
                        >
                          &#10005;
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/** Blurred filler behind the Espresso upsell overlay — never real data. */
const PLACEHOLDER_LEAVES = [
  { publicId: "1", employeeName: "John Doe", startDate: "2026-04-02", endDate: "2026-04-03", status: "approved" },
  { publicId: "2", employeeName: "Jane Smith", startDate: "2026-04-05", endDate: "2026-04-05", status: "approved" },
  { publicId: "3", employeeName: "Alex Brown", startDate: "2026-04-10", endDate: "2026-04-12", status: "approved" },
];

type TFunc = ReturnType<typeof useTranslation>["t"];

/** Mirrors the legacy console's summary sentence, key for key. */
function summaryLine(t: TFunc, present: number, total: number, late: number, absent: number): string {
  if (total === 0) {
    return t("dashboard.summaryEmpty", "Add your first employee to start tracking attendance.");
  }
  if (present === total) {
    return t("dashboard.summaryAllPresent", {
      count: total,
      defaultValue: "All {{count}} employees are checked in today.",
    });
  }
  if (present === 0) {
    return t("dashboard.summaryNonePresent", {
      count: total,
      defaultValue: "None of your {{count}} employees have checked in yet today.",
    });
  }

  const parts = [
    t("dashboard.summarySome", {
      present,
      total,
      defaultValue: "{{present}} of {{total}} employees are in today.",
    }),
  ];
  if (late > 0) {
    parts.push(t("dashboard.summaryLate", { count: late, defaultValue: "{{count}} arrived late." }));
  }
  if (absent > 0) {
    parts.push(
      t("dashboard.summaryAbsent", { count: absent, defaultValue: "{{count}} not accounted for." }),
    );
  }

  return parts.join(" ");
}

function EmptyWorkspaceView() {
  const { t } = useTranslation();
  return (
    <div className="page-enter">
      <PageHeader title={t("nav.dashboard", "Dashboard")} />
      <div className="flex min-h-100 flex-col items-center justify-center rounded-2xl border-[1.5px] border-dashed border-cream-3 bg-glass-bg px-6 py-12 backdrop-blur-md">
        <Coffee size={48} className="mb-4 text-coffee/80" strokeWidth={1.5} />
        <h2 className="mb-2 text-center font-serif text-[22px] font-semibold text-text-primary">
          {t("dashboard.emptyWelcome", "Welcome to DailyBrew")}
        </h2>
        <p className="mb-8 max-w-md text-center text-[15.5px] text-text-secondary">
          {t(
            "dashboard.emptySubtitle",
            "Add your team, set their shifts, and put the check-in QR on the wall.",
          )}
        </p>
        <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          <EmptyAction
            href="/console/employees"
            icon={UserPlus}
            title={t("dashboard.emptyAddEmployee", "Add an employee")}
            hint={t("dashboard.emptyAddEmployeeDesc", "Start with one person on the team.")}
          />
          <EmptyAction
            href="/console/shifts"
            icon={Clock}
            title={t("dashboard.emptyCreateShift", "Create a shift")}
            hint={t("dashboard.emptyCreateShiftDesc", "Set the hours you expect them in.")}
          />
          <EmptyAction
            href="/console/settings"
            icon={Settings}
            title={t("dashboard.emptyConfigure", "Configure check-in")}
            hint={t("dashboard.emptyConfigureDesc", "Timezone, IP rules, and device checks.")}
          />
        </div>
      </div>
    </div>
  );
}

function EmptyAction({
  href,
  icon: Icon,
  title,
  hint,
}: {
  href: string;
  icon: typeof UserPlus;
  title: string;
  hint: string;
}) {
  return (
    <Link href={href} className="group no-underline">
      <div className="cursor-pointer rounded-2xl border border-glass-border bg-glass-bg p-5 text-center backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <Icon
          size={28}
          className="mx-auto mb-3 text-text-tertiary transition-colors group-hover:text-coffee"
        />
        <p className="mb-1 text-[15.5px] font-medium text-text-primary">{title}</p>
        <p className="text-[13px] text-text-tertiary">{hint}</p>
      </div>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="page-enter" aria-busy="true">
      <Skeleton className="mb-6 h-7 w-48" />
      <Skeleton className="mb-6 h-4 w-2/3" />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassCard key={i} hover={false}>
            <div className="space-y-3 p-5">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </GlassCard>
        ))}
      </div>
      <GlassCard hover={false}>
        <div className="space-y-3 p-5">
          <Skeleton className="h-3 w-1/4" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
