import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { useEmployees } from '@/hooks/queries/useEmployees';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { Avatar } from '@/components/shared/Avatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useState } from 'react';

export const Route = createFileRoute('/console/employees/')({
  component: EmployeeListPage,
});

function EmployeeListPage() {
  const { t } = useTranslation();
  const workspaceId = getWorkspacePublicId() || '';
  const { data: employees, isLoading } = useEmployees(workspaceId);
  const [search, setSearch] = useState('');

  const filtered = employees?.filter((e) => {
    const fullName = `${e.firstName} ${e.lastName}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

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

      <div className="mb-4 relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
        />
        <input
          type="text"
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-3 py-2 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee transition-colors w-64"
        />
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
                  <Link
                    key={employee.publicId}
                    to="/console/employees/$publicId"
                    params={{ publicId: employee.publicId }}
                    className="flex items-center gap-3 px-5 py-3 transition-colors duration-[120ms] hover:bg-cream-3/35 cursor-pointer no-underline"
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
                    <StatusBadge
                      label={employee.active ? t('employee.active') : t('employee.inactive')}
                      variant={employee.active ? 'green' : 'gray'}
                    />
                  </Link>
                );
              })
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
