import '@tanstack/react-table';

declare module '*.png';

declare module '@tanstack/table-core' {
    interface ColumnMeta {
        style: {
            textAlign: 'left' | 'center' | 'right';
        };
    }
}
