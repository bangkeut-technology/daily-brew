import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Search, Trash2, Link2, Unlink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEmployees, useDeleteEmployee } from '@/hooks/queries/useEmployees';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { Avatar } from '@/components/shared/Avatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { useState } from 'react';

export const Route = createFileRoute('/console/employees/')({
  component: EmployeeListPage,
});

type LinkFilter = '' | 'linked' | 'unlinked';
type StatusFilter = '' | 'active' | 'inactive';

function EmployeeListPage() {
  const { t } = useTranslation();
  const workspaceId = getWorkspacePublicId() || '';
  const { data: employees, isLoading } = useEmployees(workspaceId);
  const deleteEmployee = useDeleteEmployee(workspaceId);
  const [search, setSearch] = useState('');
  const [linkFilter, setLinkFilter] = useState<LinkFilter>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [deleteTarget, setDeleteTarget] = useState<{ publicId: string; name: string } | null>(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEmployee.mutateAsync(deleteTarget.publicId);
      toast.success(t('employee.deleteSuccess', 'Employee deleted'));
    } catch {
      toast.error(t('employee.deleteError', 'Failed to delete employee'));
    }
    setDeleteTarget(null);
  };

  const filtered = employees?.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    if (!fullName.includes(search.toLowerCase())) return false;
    if (linkFilter === 'linked' && !emp.linkedUserEmail) return false;
    if (linkFilter === 'unlinked' && emp.linkedUserEmail) return false;
    if (statusFilter === 'active' && !emp.active) return false;
    return !(statusFilter === 'inactive' && emp.active);

  });

  const linkedCount = employees?.filter((e) => e.linkedUserEmail).length ?? 0;
  const unlinkedCount = employees?.filter((e) => !e.linkedUserEmail).length ?? 0;
  const activeCount = employees?.filter((e) => e.active).length ?? 0;
  const inactiveCount = employees?.filter((e) => !e.active).length ?? 0;

  return (
    <div className="page-enter">
      <PageHeader
        title={t('nav.employees')}
        action={
          <Link
            to="/console/employees/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)] no-underline"
          >
            + {t('employee.add')}
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
          />
          <input
            id="employee-search"
            name="search"
            type="text"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee transition-colors w-56"
          />
        </div>

        {/* Link status filter */}
        <div className="flex gap-1">
          <button
            onClick={() => setLinkFilter(linkFilter === '' ? '' : '')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[12px] font-medium border-none cursor-pointer transition-colors',
              linkFilter === '' ? 'bg-coffee text-white' : 'bg-glass-bg text-text-secondary hover:bg-cream-3',
            )}
          >
            All ({employees?.length ?? 0})
          </button>
          <button
            onClick={() => setLinkFilter(linkFilter === 'linked' ? '' : 'linked')}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium border-none cursor-pointer transition-colors',
              linkFilter === 'linked' ? 'bg-green/15 text-green' : 'bg-glass-bg text-text-secondary hover:bg-cream-3',
            )}
          >
            <Link2 size={11} />
            Linked ({linkedCount})
          </button>
          <button
            onClick={() => setLinkFilter(linkFilter === 'unlinked' ? '' : 'unlinked')}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium border-none cursor-pointer transition-colors',
              linkFilter === 'unlinked' ? 'bg-red/15 text-red' : 'bg-glass-bg text-text-secondary hover:bg-cream-3',
            )}
          >
            <Unlink size={11} />
            Unlinked ({unlinkedCount})
          </button>
        </div>

        {/* Status filter */}
        <div className="flex gap-1">
          <button
            onClick={() => setStatusFilter(statusFilter === 'active' ? '' : 'active')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[12px] font-medium border-none cursor-pointer transition-colors',
              statusFilter === 'active' ? 'bg-green/15 text-green' : 'bg-glass-bg text-text-secondary hover:bg-cream-3',
            )}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === 'inactive' ? '' : 'inactive')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[12px] font-medium border-none cursor-pointer transition-colors',
              statusFilter === 'inactive' ? 'bg-amber/15 text-amber' : 'bg-glass-bg text-text-secondary hover:bg-cream-3',
            )}
          >
            Inactive ({inactiveCount})
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-text-tertiary">{t('common.loading')}</p>
      ) : (
        <GlassCard hover={false}>
          <div>
            {filtered?.length === 0 ? (
              <p className="px-5 py-8 text-center text-[13px] text-text-tertiary">
                {t('common.noResults')}
              </p>
            ) : (
              filtered?.map((employee, i) => {
                const fullName = `${employee.firstName} ${employee.lastName}`;
                return (
                  <div
                    key={employee.publicId}
                    className="flex items-center gap-3 px-5 py-3 transition-colors duration-120 hover:bg-cream-3/35 group"
                  >
                    <Link
                      to="/console/employees/$publicId"
                      params={{ publicId: employee.publicId }}
                      className="flex items-center gap-3 flex-1 min-w-0 no-underline"
                    >
                      <Avatar name={fullName} index={i} size={42} radius="12px" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-medium text-text-primary truncate">
                          {fullName}
                        </div>
                        <div className="text-[11px] text-text-tertiary">
                          {employee.shiftName || t('employee.noShift')}
                          {employee.phoneNumber ? ` \u00b7 ${employee.phoneNumber}` : ''}
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-1.5">
                      {employee.linkedUserEmail ? (
                        <button
                          onClick={() => setLinkFilter(linkFilter === 'linked' ? '' : 'linked')}
                          className="bg-transparent border-none cursor-pointer p-0"
                        >
                          <StatusBadge label="Linked" variant="green" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setLinkFilter(linkFilter === 'unlinked' ? '' : 'unlinked')}
                          className="bg-transparent border-none cursor-pointer p-0"
                        >
                          <StatusBadge label="Unlinked" variant="red" />
                        </button>
                      )}
                      <button
                        onClick={() => setStatusFilter(employee.active ? (statusFilter === 'active' ? '' : 'active') : (statusFilter === 'inactive' ? '' : 'inactive'))}
                        className="bg-transparent border-none cursor-pointer p-0"
                      >
                        <StatusBadge
                          label={employee.active ? t('employee.active') : t('employee.inactive')}
                          variant={employee.active ? 'green' : 'gray'}
                        />
                      </button>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteTarget({ publicId: employee.publicId, name: fullName });
                      }}
                      className="text-text-tertiary hover:text-red bg-transparent border-none cursor-pointer p-1.5 rounded-lg transition-all hover:bg-red/8"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={t('employee.deleteTitle', 'Delete employee')}
        description={t('employee.deleteConfirm', 'Delete {{name}}? This cannot be undone.', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('common.delete', 'Delete')}
        cancelLabel={t('common.cancel', 'Cancel')}
        variant="danger"
        loading={deleteEmployee.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
