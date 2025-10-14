import React from 'react';
import { Role } from '@/types/role';
import { createColumnHelper } from '@tanstack/table-core';
import { useQuery } from '@tanstack/react-query';
import { fetchRoles } from '@/services/role';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NewRoleDialog } from '@/components/dialog/new-role-dialog';
import { DataTable } from '@/components/data-table';
import { RowSelectionState } from '@tanstack/react-table';

const columnHelper = createColumnHelper<Role>();

interface RolesDataTableProps {
    className?: string;
}

export const RolesDataTable: React.FC<RolesDataTableProps> = () => {
    const { t } = useTranslation();
    const [selected, setSelected] = React.useState<RowSelectionState>({});
    const { data = [], isPending } = useQuery({
        queryKey: ['roles'],
        queryFn: () => fetchRoles(),
    });

    const columns = React.useMemo(
        () => [
            columnHelper.accessor('name', {
                header: t('role_name'),
                cell: (info) => info.getValue(),
            }),
            columnHelper.accessor('description', {
                header: t('description'),
                cell: (info) => info.getValue() || '—',
            }),
            columnHelper.display({
                id: 'actions',
                header: t('actions'),
                cell: ({ row }) => (
                    <div className="flex gap-2">
                        <NewRoleDialog role={row.original} title={t('roles.delete.title', { ns: 'glossary' })} />
                        <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4 mr-1" /> {t('delete')}
                        </Button>
                    </div>
                ),
            }),
        ],
        [t],
    );

    return (
        <DataTable
            data={data}
            columns={columns}
            onRowSelectionChange={setSelected}
            rowSelection={selected}
            loading={isPending}
        />
    );
};
