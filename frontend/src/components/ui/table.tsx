import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import './table.css';
function Table({ className, children, ...props }: ComponentProps<'table'>) {
    return (
        <div
            className="ui-table-scroll"
            role="region"
            aria-label={props['aria-label'] ?? 'Tabela de dados'}
            tabIndex={0}
        >
            <table
                data-slot="table"
                className={cn('ui-table', className)}
                {...props}
            >
                {children}
            </table>
        </div>
    );
}
function TableHeader(props: ComponentProps<'thead'>) {
    return <thead data-slot="table-header" {...props} />;
}
function TableBody(props: ComponentProps<'tbody'>) {
    return <tbody data-slot="table-body" {...props} />;
}
function TableRow(props: ComponentProps<'tr'>) {
    return <tr data-slot="table-row" {...props} />;
}
function TableHead({ scope = 'col', ...props }: ComponentProps<'th'>) {
    return <th data-slot="table-head" scope={scope} {...props} />;
}
function TableCell(props: ComponentProps<'td'>) {
    return <td data-slot="table-cell" {...props} />;
}
function TableCaption(props: ComponentProps<'caption'>) {
    return <caption data-slot="table-caption" {...props} />;
}
function TableState({
    columns,
    children,
    loading = false,
}: {
    columns: number;
    children: ReactNode;
    loading?: boolean;
}) {
    return (
        <TableRow>
            <TableCell colSpan={columns} className="ui-table-state">
                <div role="status" aria-live="polite" aria-busy={loading}>
                    {children}
                </div>
            </TableCell>
        </TableRow>
    );
}
export {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    TableCaption,
    TableState,
};
