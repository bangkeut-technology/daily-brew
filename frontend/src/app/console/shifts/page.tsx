"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getWorkspacePublicId } from "@/lib/api";
import { useShifts, useDeleteShift } from "@/hooks/useShifts";
import type { Shift } from "@/types/shift";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ShiftFormModal } from "@/components/console/ShiftFormModal";

export default function ShiftsPage() {
  const { t } = useTranslation();
  const [workspaceId] = useState<string | null>(() => getWorkspacePublicId());

  const { data: shifts, isLoading, isError } = useShifts(workspaceId ?? "");
  const deleteShift = useDeleteShift(workspaceId ?? "");

  const [target, setTarget] = useState<Shift | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Shift | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (shift: Shift) => {
    setEditing(shift);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!target) return;
    deleteShift.mutate(target.publicId, {
      onSuccess: () => toast.success(`${target.name} deleted`),
      onError: () => toast.error("Could not delete shift"),
    });
  };

  return (
    <div className="page-enter">
      <PageHeader
        title={t("nav.shifts", "Shifts")}
        action={
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-coffee px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus size={16} />
            New shift
          </button>
        }
      />

      {isLoading && <p className="text-text-secondary">Loading…</p>}
      {isError && <p className="text-red">Could not load shifts.</p>}

      {shifts && shifts.length === 0 && (
        <GlassCard hover={false} className="p-8 text-center">
          <p className="text-text-secondary">No shifts yet.</p>
        </GlassCard>
      )}

      {shifts && shifts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shifts.map((shift) => (
            <GlassCard key={shift.publicId} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-text-primary">{shift.name}</p>
                  <p className="mt-1 flex items-center gap-1.5 font-mono text-sm tabular-nums text-text-secondary">
                    <Clock size={13} className="text-text-tertiary" />
                    {shift.startTime} – {shift.endTime}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(shift)}
                    aria-label={`Edit ${shift.name}`}
                    className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-cream-3 hover:text-coffee"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTarget(shift)}
                    aria-label={`Delete ${shift.name}`}
                    className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-red/10 hover:text-red"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <ConfirmModal
        open={target !== null}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Delete shift"
        description={`Delete ${target?.name ?? "this shift"}? Employees on it will have no shift assigned.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteShift.isPending}
        onConfirm={handleDelete}
      />

      <ShiftFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        workspaceId={workspaceId ?? ""}
        shift={editing}
      />
    </div>
  );
}
