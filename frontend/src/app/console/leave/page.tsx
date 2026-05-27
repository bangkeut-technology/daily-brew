"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getWorkspacePublicId } from "@/lib/api";
import { useLeaveRequests, useReviewLeaveRequest, useDeleteLeaveRequest } from "@/hooks/useLeaveRequests";
import type { LeaveRequest, LeaveStatus } from "@/types/leave";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Avatar } from "@/components/shared/Avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

type Filter = "all" | LeaveStatus;
const FILTERS: Filter[] = ["all", "pending", "approved", "rejected"];

const STATUS_VARIANT: Record<LeaveStatus, "amber" | "green" | "red"> = {
  pending: "amber",
  approved: "green",
  rejected: "red",
};

function fmtDate(s: string): string {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("default", { month: "short", day: "numeric" });
}

function describe(req: LeaveRequest): string {
  const range = req.startDate === req.endDate ? fmtDate(req.startDate) : `${fmtDate(req.startDate)} – ${fmtDate(req.endDate)}`;
  if (!req.isFullDay && req.startTime && req.endTime) {
    return `${range} · ${req.startTime}–${req.endTime}`;
  }
  return range;
}

export default function LeavePage() {
  const { t } = useTranslation();
  const [workspaceId] = useState<string | null>(() => getWorkspacePublicId());

  const { data: requests, isLoading, isError } = useLeaveRequests(workspaceId ?? "");
  const review = useReviewLeaveRequest(workspaceId ?? "");
  const deleteRequest = useDeleteLeaveRequest(workspaceId ?? "");

  const [filter, setFilter] = useState<Filter>("all");
  const [target, setTarget] = useState<LeaveRequest | null>(null);

  const filtered = useMemo(
    () => (requests ?? []).filter((r) => filter === "all" || r.status === filter),
    [requests, filter],
  );

  const handleReview = (req: LeaveRequest, status: LeaveStatus) => {
    review.mutate(
      { publicId: req.publicId, status },
      {
        onSuccess: () => toast.success(`${req.employeeName}'s leave ${status}`),
        onError: () => toast.error("Could not update request"),
      },
    );
  };

  const handleDelete = () => {
    if (!target) return;
    deleteRequest.mutate(target.publicId, {
      onSuccess: () => toast.success("Request cancelled"),
      onError: () => toast.error("Could not cancel request"),
    });
  };

  return (
    <div className="page-enter">
      <PageHeader title={t("nav.leaveRequests", "Leave requests")} />

      <div className="mb-5 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-xl px-3 py-1.5 text-sm font-medium capitalize transition-colors",
              filter === f
                ? "bg-coffee text-white"
                : "bg-glass-bg text-text-secondary hover:bg-cream-3",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-text-secondary">Loading…</p>}
      {isError && <p className="text-red">Could not load leave requests.</p>}

      {requests && filtered.length === 0 && (
        <GlassCard hover={false} className="p-8 text-center">
          <p className="text-text-secondary">No {filter === "all" ? "" : filter} leave requests.</p>
        </GlassCard>
      )}

      {filtered.length > 0 && (
        <GlassCard hover={false} className="divide-y divide-cream-3/70">
          {filtered.map((req, i) => (
            <div key={req.publicId} className="flex items-center gap-4 px-5 py-4">
              <Avatar name={req.employeeName} index={i} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-text-primary">{req.employeeName}</p>
                <p className="truncate text-sm text-text-secondary">
                  {describe(req)} · <span className="capitalize">{req.type}</span>
                  {req.reason ? ` · ${req.reason}` : ""}
                </p>
              </div>
              <StatusBadge label={req.status} variant={STATUS_VARIANT[req.status]} />

              {req.status === "pending" && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleReview(req, "approved")}
                    aria-label="Approve"
                    className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-green/10 hover:text-green"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReview(req, "rejected")}
                    aria-label="Reject"
                    className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-red/10 hover:text-red"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => setTarget(req)}
                aria-label="Cancel request"
                className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-red/10 hover:text-red"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </GlassCard>
      )}

      <ConfirmModal
        open={target !== null}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Cancel leave request"
        description={`Cancel ${target?.employeeName ?? "this"}'s leave request? This can't be undone.`}
        confirmLabel="Cancel request"
        variant="danger"
        loading={deleteRequest.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
