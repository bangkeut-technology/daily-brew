"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarOff, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getWorkspacePublicId } from "@/lib/api";
import { useClosures, useDeleteClosure } from "@/hooks/useClosures";
import type { ClosurePeriod } from "@/types/closure";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ClosureFormModal } from "@/components/console/ClosureFormModal";

function formatRange(start: string, end: string): string {
  const fmt = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("default", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  return start === end ? fmt(start) : `${fmt(start)} – ${fmt(end)}`;
}

export default function ClosuresPage() {
  const { t } = useTranslation();
  const [workspaceId] = useState<string | null>(() => getWorkspacePublicId());

  const { data: closures, isLoading, isError } = useClosures(workspaceId ?? "");
  const deleteClosure = useDeleteClosure(workspaceId ?? "");

  const [target, setTarget] = useState<ClosurePeriod | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClosurePeriod | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (closure: ClosurePeriod) => {
    setEditing(closure);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!target) return;
    deleteClosure.mutate(target.publicId, {
      onSuccess: () => toast.success(`${target.name} deleted`),
      onError: () => toast.error("Could not delete closure"),
    });
  };

  return (
    <div className="page-enter">
      <PageHeader
        title={t("nav.closures", "Closures")}
        action={
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-coffee px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus size={16} />
            New closure
          </button>
        }
      />

      {isLoading && <p className="text-text-secondary">Loading…</p>}
      {isError && <p className="text-red">Could not load closures.</p>}

      {closures && closures.length === 0 && (
        <GlassCard hover={false} className="p-8 text-center">
          <p className="text-text-secondary">No closures yet.</p>
        </GlassCard>
      )}

      {closures && closures.length > 0 && (
        <GlassCard hover={false} className="divide-y divide-cream-3/70">
          {closures.map((closure) => (
            <div key={closure.publicId} className="flex items-center gap-4 px-5 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber/10 text-amber">
                <CalendarOff size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-text-primary">{closure.name}</p>
                <p className="truncate font-mono text-sm tabular-nums text-text-secondary">
                  {formatRange(closure.startDate, closure.endDate)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openEdit(closure)}
                aria-label={`Edit ${closure.name}`}
                className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-cream-3 hover:text-coffee"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={() => setTarget(closure)}
                aria-label={`Delete ${closure.name}`}
                className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-red/10 hover:text-red"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </GlassCard>
      )}

      <ConfirmModal
        open={target !== null}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Delete closure"
        description={`Delete ${target?.name ?? "this closure"}? Attendance will be expected on those days again.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteClosure.isPending}
        onConfirm={handleDelete}
      />

      <ClosureFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        workspaceId={workspaceId ?? ""}
        closure={editing}
      />
    </div>
  );
}
