import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRoles } from '@/services/role';
import { createColumnHelper } from '@tanstack/table-core';
import { Role } from '@/types/role';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/data-table';
import { RowSelectionState } from '@tanstack/react-table';
import { Control, useFieldArray } from 'react-hook-form';
import { NewRoleDialog } from '@/components/dialog/new-role-dialog';

const columnHelper = createColumnHelper<Role>();
const queryKey = ['daily-brew-roles'];

interface RoleSelectProps {
    control: Control<any>;
    name: string;
    title?: string;
    description?: string;
}

export const RoleSelect: React.FunctionComponent<RoleSelectProps> = ({ control, name, title, description }) => {
    const { fields, replace } = useFieldArray({
        name,
        control,
    });
    const [roles, setRoles] = React.useState<RowSelectionState>(() =>
        fields.reduce<RowSelectionState>((acc, _, currentIndex) => {
            acc[currentIndex] = true;
            return acc;
        }, {}),
    );
    const { data = [] } = useQuery({
        queryKey,
        queryFn: () => fetchRoles(),
    });

    React.useEffect(() => {
        if (data.length > 0) {
            const selectedRows = Object.keys(roles).map((value) => data[Number(value)]);
            replace(selectedRows.map((role) => ({ value: role.id })));
        }
    }, [data, replace, roles]);

    const columns = React.useMemo(
        () => [
            columnHelper.accessor('id', {
                id: 'select',
                header: ({ table }) => (
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
                meta: {
                    style: {
                        textAlign: 'center',
                    },
                },
            }),
            columnHelper.accessor('name', {
                header: 'Role Name',
                cell: (info) => info.getValue(),
                meta: {
                    style: {
                        textAlign: 'center',
                    },
                },
            }),
        ],
        [],
    );

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex flex-row space-x-4">
                {title && <h3 className="text-lg font-semibold">{title}</h3>}
                <NewRoleDialog queryKey={queryKey} />
            </div>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <DataTable data={data} columns={columns} rowSelection={roles} onRowSelectionChange={setRoles} />
        </div>
    );
};

RoleSelect.displayName = 'RoleSelect';
