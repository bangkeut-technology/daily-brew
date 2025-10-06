import '@tanstack/react-table';

declare module '@tanstack/table-core' {
    interface ColumnMeta {
        style: {
            textAlign: 'left' | 'center' | 'right';
        };
    }
}
