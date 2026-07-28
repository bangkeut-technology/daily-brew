"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { CalendarClock, CalendarDays, Check, Crown, Inbox, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getWorkspacePublicId } from "@/lib/api";
import { parseDateAsUTC } from "@/lib/timezone";
import {
  useDeleteLeaveRequest,
  useLeaveRequests,
  useReviewLeaveRequest,
} from "@/hooks/useLeaveRequests";
import { useClosures } from "@/hooks/useClosures";
import { useEmployees } from "@/hooks/useEmployees";
import { usePlan } from "@/hooks/usePlan";
import { useRoleContext } from "@/hooks/useRoleContext";
import { useDateFormat } from "@/hooks/useDateFormat";
import { useWorkspaceTimezone } from "@/hooks/useWorkspaceSettings";
import type { LeaveRequest, LeaveStatus } from "@/types/leave";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard, GlassCardHeader } from "@/components/shared/GlassCard";
import { Avatar } from "@/components/shared/Avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { LeaveRequestModal } from "@/components/console/LeaveRequestModal";
import { Skeleton } from "@/components/admin/AdminDataStates";

const DAY_MS = 86_400_000;

type Filter = "all" | LeaveStatus;
const FILTERS: { value: Filter; labelKey: string; fallback: string }[] = [
  { value: "all", labelKey: "leave.all", fallback: "All" },
  { value: "pending", labelKey: "leave.pending", fallback: "Pending" },
  { value: "approved", labelKey: "leave.approved", fallback: "Approved" },
  { value: "rejected", labelKey: "leave.rejected", fallback: "Rejected" },
];

const STATUS_VARIANT: Record<LeaveStatus, "amber" | "green" | "red"> = {
  pending: "amber",
  approved: "green",
  rejected: "red",
};

/** Calendar days covered, inclusive. A partial day still occupies one date. */
function dayCount(req: LeaveRequest): number {
  const span =
    (parseDateAsUTC(req.endDate).getTime() - parseDateAsUTC(req.startDate).getTime()) / DAY_MS;
  return Math.max(1, Math.round(span) + 1);
}

export default function LeavePage() {
  const { t } = useTranslation();
  const workspaceId = getWorkspacePublicId() || "";
  const wsTz = useWorkspaceTimezone();
  const fmtDate = useDateFormat();

  const { data: plan, isLoading: planLoading } = usePlan(workspaceId);
  const { data: roleContext, isLoading: roleLoading } = useRoleContext();
  const canUse = plan?.canUseLeaveRequests ?? false;

  const isOwner = roleContext?.isOwner ?? false;
  const isManager = roleContext?.isManager ?? false;
  const isEmployee = !!roleContext && roleContext.isEmployee && !isOwner && !isManager;
  const canManage = isOwner || isManager;
  const employee = roleContext?.employee ?? null;

  const [filter, setFilter] = useState<Filter>("all");
  const [submitOpen, setSubmitOpen] = useState(false);
  const [editing, setEditing] = useState<LeaveRequest | null>(null);
  const [cancelTarget, setCancelTarget] = useState<LeaveRequest | null>(null);

  const { data: requests, isLoading } = useLeaveRequests(canUse ? workspaceId : "");
  const { data: employees } = useEmployees(canManage ? workspaceId : "");
  const { data: closures } = useClosures(workspaceId);
  const review = useReviewLeaveRequest(workspaceId);
  const deleteRequest = useDeleteLeaveRequest(workspaceId);

  // The API already scopes an employee's list to themself; this keeps the
  // view honest if a manager-shaped response ever reaches an employee.
  const mine = useMemo(
    () =>
      isEmployee && employee
        ? (requests ?? []).filter((r) => r.employeePublicId === employee.publicId)
        : (requests ?? []),
    [requests, isEmployee, employee],
  );

  const counts = useMemo(
    () => ({
      all: mine.length,
      pending: mine.filter((r) => r.status === "pending").length,
      approved: mine.filter((r) => r.status === "approved").length,
      rejected: mine.filter((r) => r.status === "rejected").length,
    }),
    [mine],
  );

  const today = wsTz.today();
  const upcomingApproved = useMemo(
    () => mine.filter((r) => r.status === "approved" && r.endDate >= today),
    [mine, today],
  );

  const visible = useMemo(() => {
    const rows = filter === "all" ? mine : mine.filter((r) => r.status === filter);
    // Pending first — they're the only rows that need a decision — then most
    // recent start date, so the list reads as a work queue rather than a log.
    return [...rows].sort((a, b) => {
      if (a.status !== b.status) {
        if (a.status === "pending") return -1;
        if (b.status === "pending") return 1;
      }
      return b.startDate.localeCompare(a.startDate);
    });
  }, [mine, filter]);

  if (planLoading || roleLoading) {
    return (
      <div className="page-enter" aria-busy="true">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (plan && !canUse) return <LeaveUpsell />;

  const handleReview = (req: LeaveRequest, status: Exclude<LeaveStatus, "pending">) => {
    review.mutate(
      { publicId: req.publicId, status },
      {
        onSuccess: () => toast.success(t(`leave.${status}Success`, `Leave request ${status}`)),
        onError: () => toast.error(t("leave.updateError", "Failed to update leave request")),
      },
    );
  };

  const handleCancel = () => {
    if (!cancelTarget) return;
    deleteRequest.mutate(cancelTarget.publicId, {
      onSuccess: () => {
        toast.success(t("leave.cancelSuccess", "Leave request cancelled"));
        setCancelTarget(null);
      },
      onError: () => toast.error(t("leave.cancelError", "Failed to cancel leave request")),
    });
  };

  const dateRange = (req: LeaveRequest) =>
    req.startDate === req.endDate
      ? fmtDate(req.startDate)
      : `${fmtDate(req.startDate)} – ${fmtDate(req.endDate)}`;

  return (
    <div className="page-enter">
      <PageHeader
        title={
          isEmployee
            ? t("nav.myLeaveRequests", "My leave requests")
            : t("nav.leaveRequests", "Leave requests")
        }
        help={
          isEmployee
            ? { href: "/guides/employee#step-employee-7", label: "How to submit leave" }
            : { href: "/guides/owner#step-owner-8", label: "How to review leave requests" }
        }
        action={
          (canManage || employee) && (
            <button
              type="button"
              onClick={() => setSubmitOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-coffee-light"
            >
              <CalendarDays size={14} />
              {t("leave.submitRequest", "Submit leave request")}
            </button>
          )
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <LeaveStat
          label={
            canManage
              ? t("leave.awaitingDecision", "Awaiting your decision")
              : t("leave.pending", "Pending")
          }
          value={counts.pending}
          tone={counts.pending > 0 ? "text-amber" : "text-text-tertiary"}
          hint={
            counts.pending > 0
              ? t("leave.oldestPending", {
                  date: fmtDate(
                    mine
                      .filter((r) => r.status === "pending")
                      .map((r) => r.startDate)
                      .sort()[0] ?? today,
                  ),
                  defaultValue: "Earliest starts {{date}}",
                })
              : t("leave.allCaughtUp", "Nothing waiting")
          }
        />
        <LeaveStat
          label={t("leave.upcomingApproved", "Approved & upcoming")}
          value={upcomingApproved.length}
          tone="text-green"
          hint={t("leave.daysBooked", {
            count: upcomingApproved.reduce((sum, r) => sum + dayCount(r), 0),
            defaultValue: "{{count}} days booked",
          })}
        />
        <LeaveStat
          label={t("leave.totalRequests", "Total requests")}
          value={counts.all}
          tone="text-coffee"
          hint={t("leave.approvedRejectedSplit", {
            approved: counts.approved,
            rejected: counts.rejected,
            defaultValue: "{{approved}} approved · {{rejected}} rejected",
          })}
        />
      </div>

      <div className="mb-5 flex flex-wrap gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              filter === f.value
                ? "bg-coffee text-white"
                : "bg-glass-bg text-text-secondary hover:bg-cream-3",
            )}
          >
            {t(f.labelKey, f.fallback)} ({counts[f.value]})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-[1.5px] border-dashed border-cream-3 bg-glass-bg backdrop-blur-md">
          <Inbox size={28} className="mb-2 text-text-tertiary" />
          <span className="text-[15px] text-text-tertiary">
            {t("leave.noRequests", "No leave requests found")}
          </span>
        </div>
      ) : (
        <GlassCard hover={false}>
          <GlassCardHeader
            title={
              isEmployee ? t("leave.myRequests", "My requests") : t("leave.requests", "Leave requests")
            }
            action={
              <span className="text-sm text-text-tertiary">
                {visible.length} {t("leave.total", "total")}
              </span>
            }
          />
          <div>
            {visible.map((req, i) => {
              const days = dayCount(req);
              const isOwn = employee?.publicId === req.employeePublicId;
              const startsSoon =
                req.status === "approved" &&
                req.startDate >= today &&
                parseDateAsUTC(req.startDate).getTime() - parseDateAsUTC(today).getTime() <=
                  7 * DAY_MS;

              return (
                <div
                  key={req.publicId}
                  className="flex items-center gap-3 border-b border-cream-3/50 px-5 py-3 transition-colors last:border-0 hover:bg-cream-3/20"
                >
                  {!isEmployee && <Avatar name={req.employeeName} index={i} size={32} />}
                  <div className="min-w-0 flex-1">
                    {!isEmployee && (
                      <div className="truncate text-[15.5px] font-medium text-text-primary">
                        {req.employeeName}
                      </div>
                    )}
                    <div
                      className={cn(
                        "flex flex-wrap items-center gap-x-2",
                        isEmployee
                          ? "text-[15.5px] font-medium text-text-primary"
                          : "text-[13px] text-text-tertiary",
                      )}
                    >
                      <span>{dateRange(req)}</span>
                      {!req.isFullDay && req.startTime && req.endTime ? (
                        <span className="font-mono tabular-nums">
                          {req.startTime}–{req.endTime}
                        </span>
                      ) : (
                        <span className="text-text-tertiary">
                          ·{" "}
                          {t("leave.dayCount", { count: days, defaultValue: "{{count}} days" })}
                        </span>
                      )}
                      {startsSoon && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue/10 px-1.5 py-0.5 text-[11.5px] font-medium text-blue">
                          <CalendarClock size={10} />
                          {t("leave.startsSoon", "Starts soon")}
                        </span>
                      )}
                    </div>
                    {req.reason && (
                      <div className="mt-0.5 truncate text-[13.5px] text-text-secondary">
                        {req.reason}
                      </div>
                    )}
                  </div>

                  <StatusBadge
                    label={t(`leave.${req.status}`, req.status)}
                    variant={STATUS_VARIANT[req.status]}
                  />

                  {/* Employees may withdraw their own pending request; owners
                      and managers decide on anyone's. */}
                  {isOwn && req.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => setCancelTarget(req)}
                      title={t("leave.cancel", "Cancel")}
                      aria-label={t("leave.cancel", "Cancel")}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-red/10 hover:text-red"
                    >
                      <X size={14} />
                    </button>
                  )}

                  {canManage && req.status !== "rejected" && (
                    <button
                      type="button"
                      onClick={() => setEditing(req)}
                      title={t("leave.editRequest", "Edit leave request")}
                      aria-label={t("leave.editRequest", "Edit leave request")}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-coffee/10 hover:text-coffee"
                    >
                      <Pencil size={14} />
                    </button>
                  )}

                  {canManage && req.status === "pending" && (
                    <div className="ml-2 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleReview(req, "approved")}
                        disabled={review.isPending}
                        className="flex items-center gap-1 rounded-md bg-green/12 px-3 py-1 text-[13.5px] font-medium text-green transition-colors hover:bg-green/20 disabled:opacity-50"
                      >
                        <Check size={13} />
                        {t("leave.approve", "Approve")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReview(req, "rejected")}
                        disabled={review.isPending}
                        className="flex items-center gap-1 rounded-md bg-red/10 px-3 py-1 text-[13.5px] font-medium text-red transition-colors hover:bg-red/18 disabled:opacity-50"
                      >
                        <X size={13} />
                        {t("leave.reject", "Reject")}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {(canManage || employee) && (
        <LeaveRequestModal
          open={submitOpen}
          onOpenChange={setSubmitOpen}
          workspaceId={workspaceId}
          employeePublicId={employee?.publicId}
          employees={
            canManage
              ? (employees ?? [])
                  .filter((e) => e.active)
                  .map((e) => ({ publicId: e.publicId, name: e.name }))
              : undefined
          }
          closures={closures}
        />
      )}

      {canManage && (
        <LeaveRequestModal
          open={editing !== null}
          onOpenChange={(open) => !open && setEditing(null)}
          workspaceId={workspaceId}
          leaveRequest={editing}
          closures={closures}
        />
      )}

      <ConfirmModal
        open={cancelTarget !== null}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title={t("leave.cancelTitle", "Cancel leave request")}
        description={t(
          "leave.cancelDescription",
          "Are you sure you want to cancel this leave request? This action cannot be undone.",
        )}
        confirmLabel={t("leave.cancelConfirm", "Yes, cancel")}
        variant="danger"
        loading={deleteRequest.isPending}
        onConfirm={handleCancel}
      />
    </div>
  );
}

function LeaveStat({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: number;
  tone: string;
  hint: string;
}) {
  return (
    <GlassCard hover={false}>
      <div className="p-4">
        <p className="mb-1 text-[13px] uppercase tracking-[1px] text-text-tertiary">{label}</p>
        <p className={cn("text-[30px] font-bold leading-none", tone)}>{value}</p>
        <p className="mt-2 text-[13px] text-text-tertiary">{hint}</p>
      </div>
    </GlassCard>
  );
}

/**
 * Free-tier gate. Links to settings rather than opening Paddle checkout —
 * billing lives there in this app, and the console has no checkout of its own.
 */
function LeaveUpsell() {
  const { t } = useTranslation();
  return (
    <div className="page-enter">
      <PageHeader title={t("nav.leaveRequests", "Leave requests")} />
      <GlassCard hover={false}>
        <div className="space-y-4 p-8 text-center">
          <div className="mb-2 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber/10">
            <Crown size={28} className="text-amber" />
          </div>
          <h2 className="font-serif text-[20px] font-semibold text-text-primary">
            {t("upgrade.leaveRequests.title", "Leave management is an Espresso feature")}
          </h2>
          <p className="text-[15px] leading-relaxed text-text-secondary">
            {t(
              "upgrade.leaveRequests.description",
              "Let staff request time off and approve it in one place.",
            )}
          </p>
          <Link
            href="/console/settings"
            className="btn-shimmer inline-block rounded-xl px-6 py-2.5 text-base font-medium text-white no-underline transition-all hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(107,66,38,0.30)]"
          >
            {t("upgrade.upgradeButton", "Upgrade")}
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
