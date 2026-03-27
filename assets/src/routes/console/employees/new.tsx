import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateEmployee } from '@/hooks/queries/useEmployees';
import { useShifts } from '@/hooks/queries/useShifts';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';

const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().optional(),
  shiftPublicId: z.string().optional(),
});

type CreateEmployeeForm = z.infer<typeof createEmployeeSchema>;

export const Route = createFileRoute('/console/employees/new')({
  component: NewEmployeePage,
});

function NewEmployeePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const workspaceId = getWorkspacePublicId() || '';
  const createEmployee = useCreateEmployee(workspaceId);
  const { data: shifts } = useShifts(workspaceId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEmployeeForm>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      shiftPublicId: '',
    },
  });

  const onSubmit = async (values: CreateEmployeeForm) => {
    try {
      await createEmployee.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber || undefined,
        shiftPublicId: values.shiftPublicId || undefined,
      });
      toast.success(t('employee.createSuccess', 'Employee created'));
      navigate({ to: '/console/employees' });
    } catch {
      toast.error(t('employee.createError', 'Failed to create employee'));
    }
  };

  const inputClassName =
    'w-full px-3 py-2 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee transition-colors';

  return (
    <div className="page-enter">
      <PageHeader title={t('employee.add')} />

      <GlassCard hover={false} className="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
              {t('employee.firstName', 'First name')} *
            </label>
            <input
              type="text"
              {...register('firstName')}
              className={inputClassName}
            />
            {errors.firstName && (
              <p className="text-[11px] text-status-red mt-1">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
              {t('employee.lastName', 'Last name')} *
            </label>
            <input
              type="text"
              {...register('lastName')}
              className={inputClassName}
            />
            {errors.lastName && (
              <p className="text-[11px] text-status-red mt-1">{errors.lastName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
              {t('employee.phoneNumber', 'Phone number')}
            </label>
            <input
              type="text"
              {...register('phoneNumber')}
              className={inputClassName}
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
              {t('employee.shift', 'Shift')}
            </label>
            <select
              {...register('shiftPublicId')}
              className={inputClassName}
            >
              <option value="">{t('employee.noShift', 'No shift')}</option>
              {shifts?.map((s) => (
                <option key={s.publicId} value={s.publicId}>
                  {s.name} ({s.startTime} - {s.endTime})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={createEmployee.isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light disabled:opacity-50"
            >
              {createEmployee.isPending ? t('common.loading') : t('common.create')}
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: '/console/employees' })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 cursor-pointer transition-all duration-150 hover:bg-cream-3"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
