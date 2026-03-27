import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCreateEmployee } from '@/hooks/queries/useEmployees';
import { useShifts } from '@/hooks/queries/useShifts';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';

export const Route = createFileRoute('/console/employees/new')({
  component: NewEmployeePage,
});

function NewEmployeePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const workspaceId = getWorkspacePublicId() || '';
  const createEmployee = useCreateEmployee(workspaceId);
  const { data: shifts } = useShifts(workspaceId);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [shiftPublicId, setShiftPublicId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEmployee.mutateAsync({
        name,
        phone: phone || undefined,
        shiftPublicId: shiftPublicId || undefined,
      });
      toast.success('Employee created');
      navigate({ to: '/console/employees' });
    } catch {
      toast.error('Failed to create employee');
    }
  };

  return (
    <div className="page-enter">
      <PageHeader title={t('employee.add')} />

      <GlassCard hover={false} className="max-w-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
              {t('employee.name')} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg text-[13.5px] bg-white/62 border border-cream-3 text-text-primary outline-none focus:border-coffee transition-colors"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
              {t('employee.phone')}
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-[13.5px] bg-white/62 border border-cream-3 text-text-primary outline-none focus:border-coffee transition-colors"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
              {t('employee.shift')}
            </label>
            <select
              value={shiftPublicId}
              onChange={(e) => setShiftPublicId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-[13.5px] bg-white/62 border border-cream-3 text-text-primary outline-none focus:border-coffee transition-colors"
            >
              <option value="">No shift</option>
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-white/62 backdrop-blur-sm text-text-primary border border-cream-3 cursor-pointer transition-all duration-150 hover:bg-cream-3"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
