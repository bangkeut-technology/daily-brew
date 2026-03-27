import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useClosures, useCreateClosure, useDeleteClosure } from '@/hooks/queries/useClosures';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { CalendarX2, Trash2 } from 'lucide-react';

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
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClosure.mutateAsync({ name, startDate, endDate });
      toast.success('Closure created');
      setShowForm(false);
      setName('');
      setStartDate('');
      setEndDate('');
    } catch {
      toast.error('Failed to create closure');
    }
  };

  const handleDelete = async (publicId: string) => {
    try {
      await deleteClosure.mutateAsync(publicId);
      toast.success('Closure deleted');
    } catch {
      toast.error('Failed to delete closure');
    }
  };

  return (
    <div className="page-enter">
      <PageHeader
        title={t('nav.closures')}
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light"
          >
            + {t('common.create')}
          </button>
        }
      />

      {showForm && (
        <GlassCard hover={false} className="mb-4 max-w-lg">
          <form onSubmit={handleCreate} className="p-5 space-y-3">
            <input
              type="text"
              placeholder="Closure name (e.g. Khmer New Year)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg text-[13.5px] bg-white/62 border border-cream-3 text-text-primary outline-none focus:border-coffee"
            />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
                  Start date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg text-[13px] bg-white/62 border border-cream-3 text-text-primary outline-none focus:border-coffee"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
                  End date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg text-[13px] bg-white/62 border border-cream-3 text-text-primary outline-none focus:border-coffee"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={createClosure.isPending}
              className="px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50"
            >
              {createClosure.isPending ? t('common.loading') : t('common.create')}
            </button>
          </form>
        </GlassCard>
      )}

      {isLoading ? (
        <p className="text-text-tertiary">{t('common.loading')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {closures?.map((closure) => (
            <GlassCard key={closure.publicId}>
              <GlassCardHeader
                title={closure.name}
                action={
                  <button
                    onClick={() => handleDelete(closure.publicId)}
                    className="text-text-tertiary hover:text-red transition-colors bg-transparent border-none cursor-pointer p-1"
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
