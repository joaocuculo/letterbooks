import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { TableHead } from './table';
import { Button } from './button';

export function TableSortHead({
    children,
    direction,
    onSort,
}: {
    children: ReactNode;
    direction?: 'asc' | 'desc';
    onSort: () => void;
}) {
    const Icon =
        direction === 'asc'
            ? ArrowUp
            : direction === 'desc'
              ? ArrowDown
              : ArrowUpDown;
    return (
        <TableHead
            aria-sort={
                direction === 'asc'
                    ? 'ascending'
                    : direction === 'desc'
                      ? 'descending'
                      : 'none'
            }
        >
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="table-sort-button"
                onClick={onSort}
                aria-label={`Ordenar por ${children}: ${direction === 'asc' ? 'decrescente' : 'crescente'}`}
            >
                {children}
                <Icon aria-hidden="true" />
            </Button>
        </TableHead>
    );
}
