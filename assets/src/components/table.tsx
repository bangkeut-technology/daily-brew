import React from 'react';
import { Table as SDTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

interface TableProps<T> {
    data: T[];
    columns: ColumnDef<T, any>[];
    rowSelection?: RowSelectionState;
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
    columnVisibility?: VisibilityState;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;
    onSortingChange?: OnChangeFn<SortingState>;
    onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
    onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
}

export const Table = <T,>({
    data,
    columns,
    rowSelection,
    sorting,
    columnFilters,
    columnVisibility,
    onRowSelectionChange,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange,
}: TableProps<T>) => {
    const { t } = useTranslation();

    const table = useReactTable({
        data,
        columns,
        onSortingChange,
        onColumnFiltersChange,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
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
        <React.Fragment>
            <div className="rounded-md border">
                <SDTable>
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
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
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
                                    {t('glossary:table.no_data')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </SDTable>
            </div>
            <div className="flex items-center justify-end space-x-2 p-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length}&nbsp;{t('glossary:table.of')}&nbsp;
                    {table.getFilteredRowModel().rows.length}
                    &nbsp;
                    {t('glossary:table.row_selected')}
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        {t('glossary:table.previous')}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        {t('glossary:table.next')}
                    </Button>
                </div>
            </div>
        </React.Fragment>
    );
};
