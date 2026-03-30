import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useClosures, useCreateClosure, useUpdateClosure, useDeleteClosure } from '@/hooks/queries/useClosures';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { CalendarX2, Trash2, CalendarOff, Clock, Pencil } from 'lucide-react';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { useDateFormat } from '@/hooks/useDateFormat';

const createClosureSchema = z
  .object({
    name: z.string().min(1, 'Closure name is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  });

type CreateClosureForm = z.infer<typeof createClosureSchema>;

export const Route = createFileRoute('/console/closures/')({
  component: ClosuresPage,
});

function ClosuresPage() {
  const { t } = useTranslation();
  const workspaceId = getWorkspacePublicId() || '';
  const { data: closures, isLoading } = useClosures(workspaceId);
  const createClosure = useCreateClosure(workspaceId);
  const updateClosure = useUpdateClosure(workspaceId);
  const deleteClosure = useDeleteClosure(workspaceId);
  const fmtDate = useDateFormat();
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ publicId: string; name: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateClosureForm>({
    resolver: zodResolver(createClosureSchema),
    defaultValues: {
      name: '',
      startDate: '',
      endDate: '',
    },
  });

  const onSubmit = async (values: CreateClosureForm) => {
    try {
      await createClosure.mutateAsync({
        name: values.name,
        startDate: values.startDate,
        endDate: values.endDate,
      });
      toast.success(t('closure.createSuccess', 'Closure created'));
      setShowForm(false);
      reset();
    } catch {
      toast.error(t('closure.createError', 'Failed to create closure'));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteClosure.mutateAsync(deleteTarget.publicId);
      toast.success(t('closure.deleteSuccess', 'Closure deleted'));
    } catch {
      toast.error(t('closure.deleteError', 'Failed to delete closure'));
    }
    setDeleteTarget(null);
  };

  const handleToggleForm = () => {
    if (showForm) {
      reset();
    }
    setShowForm(!showForm);
  };

  const inputClassName =
    'w-full px-3 py-2 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee transition-colors';

  return (
    <div className="page-enter">
      <PageHeader
        title={t('nav.closures')}
        action={
          <button
            onClick={handleToggleForm}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light"
          >
            + {t('common.create')}
          </button>
        }
      />

      <p className="text-[13px] text-text-secondary mb-5 -mt-2 leading-relaxed">
        Define dates when your restaurant is closed (holidays, renovations, etc.). No attendance is expected during closures — employees won't be marked absent.
      </p>

      {showForm && (
        <GlassCard hover={false} className="mb-6">
          <GlassCardHeader title={t('closure.new', 'New closure')} />
          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-3">
            <div>
              <input
                id="closure-name"
                type="text"
                placeholder={t('closure.namePlaceholder', 'Closure name (e.g. Khmer New Year)')}
                {...register('name')}
                className={inputClassName}
              />
              {errors.name && (
                <p className="text-[11px] text-red mt-1">{errors.name.message}</p>
              )}
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label id="closure-start-label" className="block text-[11px] font-medium text-text-secondary mb-1">
                  {t('closure.startDate', 'Start date')}
                </label>
                <CustomDatePicker
                  value={watch('startDate') || ''}
                  onChange={(v) => setValue('startDate', v, { shouldValidate: true })}
                />
                {errors.startDate && (
                  <p className="text-[11px] text-red mt-1">{errors.startDate.message}</p>
                )}
              </div>
              <div className="flex-1">
                <label id="closure-end-label" className="block text-[11px] font-medium text-text-secondary mb-1">
                  {t('closure.endDate', 'End date')}
                </label>
                <CustomDatePicker
                  value={watch('endDate') || ''}
                  onChange={(v) => setValue('endDate', v, { shouldValidate: true })}
                />
                {errors.endDate && (
                  <p className="text-[11px] text-red mt-1">{errors.endDate.message}</p>
                )}
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={createClosure.isPending}
                className="px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50 transition-colors"
              >
                {createClosure.isPending ? t('common.loading') : t('common.create')}
              </button>
              <button
                type="button"
                onClick={handleToggleForm}
                className="px-4 py-2 rounded-lg text-[13px] font-medium bg-glass-bg text-text-primary border border-cream-3 cursor-pointer hover:bg-cream-3 transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-[13px] text-text-tertiary">{t('common.loading')}</p>
        </div>
      ) : closures?.length === 0 ? (
        <div
          onClick={() => setShowForm(true)}
          className="border-[1.5px] border-dashed border-cream-3 rounded-2xl bg-glass-bg backdrop-blur-md flex flex-col items-center justify-center min-h-[200px] cursor-pointer transition-colors hover:bg-cream-3/30"
        >
          <CalendarOff size={28} className="text-text-tertiary mb-2" />
          <span className="text-[13px] text-text-tertiary">
            {t('closure.empty', 'No closure periods defined')}
          </span>
          <span className="text-[11px] text-text-tertiary mt-1">
            {t('closure.emptyHint', 'Click to add one')}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {closures?.map((closure) => (
            <ClosureCard
              key={closure.publicId}
              closure={closure}
              fmtDate={fmtDate}
              onDelete={() => setDeleteTarget({ publicId: closure.publicId, name: closure.name })}
              onUpdate={async (data) => {
                try {
                  await updateClosure.mutateAsync({ publicId: closure.publicId, ...data });
                  toast.success(t('closure.updateSuccess', 'Closure updated'));
                } catch {
                  toast.error(t('closure.updateError', 'Failed to update closure'));
                }
              }}
              deleting={deleteClosure.isPending}
              updating={updateClosure.isPending}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={t('closure.deleteTitle', 'Delete closure')}
        description={t('closure.deleteConfirm', 'Delete {{name}}? This cannot be undone.', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('common.delete', 'Delete')}
        cancelLabel={t('common.cancel', 'Cancel')}
        variant="danger"
        loading={deleteClosure.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

// ── ClosureCard with inline editing ──────────────────────────

interface ClosureCardProps {
  closure: { publicId: string; name: string; startDate: string; endDate: string };
  fmtDate: (d: string) => string;
  onDelete: () => void;
  onUpdate: (data: { name: string; startDate: string; endDate: string }) => Promise<void>;
  deleting: boolean;
  updating: boolean;
}

function ClosureCard({ closure, fmtDate, onDelete, onUpdate, deleting, updating }: ClosureCardProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(closure.name);
  const [editStart, setEditStart] = useState(closure.startDate);
  const [editEnd, setEditEnd] = useState(closure.endDate);

  const start = new Date(closure.startDate);
  const end = new Date(closure.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const isActive = today >= start && today <= end;
  const isPast = today > end;
  const isUpcoming = today < start;

  const statusLabel = isActive ? 'Active' : isPast ? 'Past' : 'Upcoming';
  const statusVariant = isActive ? 'red' : isPast ? 'gray' : 'amber';
  const accentColor = isActive ? 'from-red to-red/70' : isPast ? 'from-text-tertiary to-text-tertiary/70' : 'from-amber to-amber-light';

  const handleSave = async () => {
    await onUpdate({ name: editName.trim(), startDate: editStart, endDate: editEnd });
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setEditName(closure.name);
    setEditStart(closure.startDate);
    setEditEnd(closure.endDate);
    setIsEditing(true);
  };

  const inputClassName = 'w-full px-3 py-2 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee transition-colors';

  return (
    <GlassCard hover={!isPast && !isEditing}>
      <div className="relative">
        <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${accentColor}`} />
        <div className="px-5 pt-5 pb-3">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Closure name"
                className={inputClassName}
                autoFocus
              />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">
                    Start date
                  </label>
                  <CustomDatePicker value={editStart} onChange={setEditStart} />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">
                    End date
                  </label>
                  <CustomDatePicker value={editEnd} onChange={setEditEnd} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={updating || !editName.trim() || !editStart || !editEnd}
                  className="px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50 transition-colors"
                >
                  {updating ? t('common.loading') : t('common.save')}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg text-[13px] font-medium bg-glass-bg border border-cream-3 text-text-secondary cursor-pointer hover:bg-cream-3/40 transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className={`text-[15px] font-semibold truncate ${isPast ? 'text-text-tertiary' : 'text-text-primary'}`}>
                  {closure.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <StatusBadge label={statusLabel} variant={statusVariant as 'red' | 'gray' | 'amber'} />
                  <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-cream-3/40 text-text-secondary">
                    {days} day{days !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleStartEdit}
                  className="text-text-tertiary hover:text-coffee transition-colors bg-transparent border-none cursor-pointer p-1.5 rounded-lg hover:bg-coffee/8"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={onDelete}
                  disabled={deleting}
                  className="text-text-tertiary hover:text-red transition-colors bg-transparent border-none cursor-pointer p-1.5 rounded-lg hover:bg-red/8 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isEditing && (
        <div className="border-t border-cream-3/80 px-5 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <CalendarX2 size={13} className={isActive ? 'text-red' : 'text-text-tertiary'} />
            <span className="text-[13px] font-mono tabular-nums text-text-secondary">
              {fmtDate(closure.startDate)} &ndash; {fmtDate(closure.endDate)}
            </span>
          </div>
          {isUpcoming && (() => {
            const daysUntil = Math.round((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return (
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-amber" />
                <span className="text-[11.5px] text-text-tertiary">
                  Starts in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                </span>
              </div>
            );
          })()}
          {isActive && (() => {
            const daysLeft = Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            return (
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-red" />
                <span className="text-[11.5px] text-red">
                  {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
                </span>
              </div>
            );
          })()}
        </div>
      )}
    </GlassCard>
  );
}
