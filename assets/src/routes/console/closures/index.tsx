import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useClosures, useCreateClosure, useDeleteClosure } from '@/hooks/queries/useClosures';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { CalendarX2, Trash2, CalendarOff } from 'lucide-react';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';

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
  const deleteClosure = useDeleteClosure(workspaceId);
  const [showForm, setShowForm] = useState(false);

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

  const handleDelete = async (publicId: string) => {
    try {
      await deleteClosure.mutateAsync(publicId);
      toast.success(t('closure.deleteSuccess', 'Closure deleted'));
    } catch {
      toast.error(t('closure.deleteError', 'Failed to delete closure'));
    }
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

      {showForm && (
        <GlassCard hover={false} className="mb-6">
          <GlassCardHeader title={t('closure.new', 'New closure')} />
          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-3">
            <div>
              <input
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
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
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
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
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
            <GlassCard key={closure.publicId}>
              <GlassCardHeader
                title={closure.name}
                action={
                  <button
                    onClick={() => handleDelete(closure.publicId)}
                    disabled={deleteClosure.isPending}
                    className="text-text-tertiary hover:text-red transition-colors bg-transparent border-none cursor-pointer p-1 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                }
              />
              <div className="px-5 py-4 flex items-center gap-2 text-[13px] text-text-secondary">
                <CalendarX2 size={14} className="text-red" />
                {closure.startDate} &mdash; {closure.endDate}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
