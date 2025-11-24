import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ColumnDef, flexRender, RowSelectionState, useReactTable } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import {
    ColumnFiltersState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    OnChangeFn,
    SortingState,
    VisibilityState,
} from '@tanstack/table-core';
import { Loader2Icon } from 'lucide-react';

interface DataTableProps<T> {
    data: T[];
    loading?: boolean;
    valueProps?: keyof T;
    columns: ColumnDef<T, any>[];
    onRowClick?: (row: T) => void;
    rowSelection: RowSelectionState;
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
    columnVisibility?: VisibilityState;
    onRowSelectionChange: OnChangeFn<RowSelectionState>;
    onSortingChange?: OnChangeFn<SortingState>;
    onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
    onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
}

export const DataTable = <T,>({
    data,
    loading,
    columns,
    rowSelection,
    sorting,
    columnFilters,
    columnVisibility,
    onRowClick,
    onRowSelectionChange,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange,
}: DataTableProps<T>) => {
    const { t } = useTranslation();

    const table = useReactTable({
        data,
        columns,
        onSortingChange,
        onColumnFiltersChange,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: rowSelection ? getFilteredRowModel() : undefined,
        onColumnVisibilityChange,
        onRowSelectionChange,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead className="text-center" key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24">
                                    <div className="flex items-center justify-center space-x-2">
                                        <Loader2Icon className="animate-spin mr-2" />
                                        {t('table.loading', { ns: 'glossary' })}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    onClick={() => onRowClick?.(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} style={cell.column.columnDef.meta?.style}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {t('table.no_data', { ns: 'glossary' })}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 p-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length}&nbsp;{t('table.of', { ns: 'glossary' })}&nbsp;
                    {table.getFilteredRowModel().rows.length}
                    &nbsp;
                    {t('table.row_selected', { ns: 'glossary' })}
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        {t('table.previous', { ns: 'glossary' })}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        {t('table.next', { ns: 'glossary' })}
                    </Button>
                </div>
            </div>
        </div>
    );
};

DataTable.displayName = 'DataTable';
