"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarOff, Plus } from "lucide-react";
import { toast } from "sonner";
import { getWorkspacePublicId } from "@/lib/api";
import { useClosures, useCreateClosure, useDeleteClosure, useUpdateClosure } from "@/hooks/useClosures";
import { useDateFormat } from "@/hooks/useDateFormat";
import type { ClosurePeriod } from "@/types/closure";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { CustomDatePicker } from "@/components/shared/CustomDatePicker";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ClosureCard } from "@/components/console/ClosureCard";
import { Skeleton } from "@/components/admin/AdminDataStates";

const inputClass =
  "w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[15.5px] text-text-primary outline-none transition-colors focus:border-coffee";

export default function ClosuresPage() {
  const { t } = useTranslation();
  const [workspaceId] = useState<string | null>(() => getWorkspacePublicId());
  const wsId = workspaceId ?? "";
  const fmtDate = useDateFormat();

  const { data: closures, isLoading, isError } = useClosures(wsId);
  const createClosure = useCreateClosure(wsId);
  const updateClosure = useUpdateClosure(wsId);
  const deleteClosure = useDeleteClosure(wsId);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ClosurePeriod | null>(null);

  const rangeInvalid = !!startDate && !!endDate && endDate < startDate;
  const canCreate = !!name.trim() && !!startDate && !!endDate && !rangeInvalid;

  const resetForm = () => {
    setName("");
    setStartDate("");
    setEndDate("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;
    try {
      await createClosure.mutateAsync({ name: name.trim(), startDate, endDate });
      toast.success(t("closure.createSuccess", "Closure created"));
      setShowForm(false);
      resetForm();
    } catch {
      toast.error(t("closure.createError", "Failed to create closure"));
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteClosure.mutate(deleteTarget.publicId, {
      onSuccess: () => {
        toast.success(t("closure.deleteSuccess", "Closure deleted"));
        setDeleteTarget(null);
      },
      onError: () => toast.error(t("closure.deleteError", "Failed to delete closure")),
    });
  };

  return (
    <div className="page-enter">
      <PageHeader
        title={t("nav.closures", "Closures")}
        help={{ href: "/guides/owner#step-owner-8", label: "How closures and leave work" }}
        action={
          <button
            type="button"
            onClick={() => {
              if (showForm) resetForm();
              setShowForm((v) => !v);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-all duration-150 hover:bg-coffee-light"
          >
            <Plus size={15} />
            {t("common.create", "Create")}
          </button>
        }
      />

      <p className="-mt-2 mb-5 text-[15px] leading-relaxed text-text-secondary">
        {t(
          "closure.description",
          "Days the restaurant is shut. Nobody is expected to check in, and nobody is counted absent.",
        )}
      </p>

      {showForm && (
        <GlassCard hover={false} className="mb-4 overflow-visible">
          <form onSubmit={handleCreate} className="space-y-3 p-5">
            <label htmlFor="closure-name" className="sr-only">
              {t("closure.nameLabel", "Closure name")}
            </label>
            <input
              id="closure-name"
              name="closureName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("closure.namePlaceholder", "Closure name (e.g. Khmer New Year)")}
              required
              className={inputClass}
            />
            <div className="flex gap-3">
              <div className="flex-1">
                <label
                  htmlFor="closure-start"
                  className="mb-1 block text-[13px] font-medium text-text-secondary"
                >
                  {t("closure.startDate", "Start date")}
                </label>
                <CustomDatePicker
                  id="closure-start"
                  value={startDate}
                  onChange={(v) => {
                    setStartDate(v);
                    // A single-day closure is the common case, so the end
                    // date follows the start unless it's already later.
                    if (!endDate || v > endDate) setEndDate(v);
                  }}
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="closure-end"
                  className="mb-1 block text-[13px] font-medium text-text-secondary"
                >
                  {t("closure.endDate", "End date")}
                </label>
                <CustomDatePicker id="closure-end" value={endDate} onChange={setEndDate} />
              </div>
            </div>
            {rangeInvalid && (
              <p className="text-[13px] text-red">
                {t("closure.endBeforeStart", "End date must be on or after the start date")}
              </p>
            )}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={createClosure.isPending || !canCreate}
                className="rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50"
              >
                {createClosure.isPending
                  ? t("common.loading", "Loading...")
                  : t("common.create", "Create")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="rounded-lg border border-cream-3 bg-glass-bg px-4 py-2 text-[15px] font-medium text-text-secondary transition-colors hover:bg-cream-3/40"
              >
                {t("common.cancel", "Cancel")}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {isError && <p className="text-red">{t("closure.loadError", "Could not load closures.")}</p>}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : closures?.length === 0 ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex min-h-[200px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-[1.5px] border-dashed border-cream-3 bg-glass-bg backdrop-blur-md transition-colors hover:bg-cream-3/30"
        >
          <CalendarOff size={28} className="mb-2 text-text-tertiary" />
          <span className="text-[15px] text-text-tertiary">
            {t("closure.empty", "No closure periods defined")}
          </span>
          <span className="mt-1 text-[13px] text-text-tertiary">
            {t("closure.emptyHint", "Click to add one")}
          </span>
        </button>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {closures?.map((closure) => (
            <ClosureCard
              key={closure.publicId}
              closure={closure}
              formatDate={fmtDate}
              deleting={deleteClosure.isPending}
              updating={updateClosure.isPending}
              onDelete={() => setDeleteTarget(closure)}
              onUpdate={async (data) => {
                try {
                  await updateClosure.mutateAsync({ publicId: closure.publicId, ...data });
                  toast.success(t("closure.updateSuccess", "Closure updated"));
                } catch {
                  toast.error(t("closure.updateError", "Failed to update closure"));
                }
              }}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("closure.deleteTitle", "Delete closure")}
        description={t("closure.deleteConfirm", "Delete {{name}}? This cannot be undone.", {
          name: deleteTarget?.name ?? "",
        })}
        confirmLabel={t("common.delete", "Delete")}
        cancelLabel={t("common.cancel", "Cancel")}
        variant="danger"
        loading={deleteClosure.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
