import '@tanstack/react-table';

declare module '*.png';
declare module '*.svg';
declare module '*.jpeg';
declare module '*.jpg';

declare module '@tanstack/table-core' {
    interface ColumnMeta {
        style: {
            textAlign: 'left' | 'center' | 'right';
        };
    }
}
