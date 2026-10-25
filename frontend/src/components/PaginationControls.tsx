import { Button } from './ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
export default function PaginationControls({
    page,
    total,
    busy,
    onChange,
    label,
    className,
}: {
    page: number;
    total: number;
    busy: boolean;
    onChange: (p: number) => void;
    label: string;
    className?: string;
}) {
    if (total <= 1) return null;
    return (
        <nav
            className={`pagination-controls ${className ?? ''}`}
            aria-label={label}
        >
            <Button
                variant="outline"
                type="button"
                disabled={busy || page === 0}
                onClick={() => onChange(page - 1)}
            >
                <ArrowLeft size={16} aria-hidden="true" />
                Anterior
            </Button>
            <span>
                Página {page + 1} de {total}
            </span>
            <Button
                variant="outline"
                type="button"
                disabled={busy || page + 1 >= total}
                onClick={() => onChange(page + 1)}
            >
                Próxima
                <ArrowRight size={16} aria-hidden="true" />
            </Button>
        </nav>
    );
}
