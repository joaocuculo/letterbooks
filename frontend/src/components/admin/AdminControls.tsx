import { Dialog } from '@base-ui/react/dialog';
import { ArrowLeft, ArrowRight } from 'lucide-react';
export function AdminPager({
    page,
    total,
    busy,
    onChange,
    label,
}: {
    page: number;
    total: number;
    busy: boolean;
    onChange: (p: number) => void;
    label: string;
}) {
    if (total <= 1) return null;
    return (
        <nav className="admin-pager" aria-label={label}>
            <button
                disabled={busy || page === 0}
                onClick={() => onChange(page - 1)}
            >
                <ArrowLeft size={16} aria-hidden="true" />
                Anterior
            </button>
            <span>
                Página {page + 1} de {total}
            </span>
            <button
                disabled={busy || page + 1 >= total}
                onClick={() => onChange(page + 1)}
            >
                Próxima
                <ArrowRight size={16} aria-hidden="true" />
            </button>
        </nav>
    );
}
export function AdminFailure({
    message,
    retry,
}: {
    message: string;
    retry: () => void;
}) {
    return (
        <div className="admin-feedback">
            <p className="admin-error" role="alert">
                {message}
            </p>
            <button onClick={retry}>Tentar novamente</button>
        </div>
    );
}
export function AdminConfirm({
    title,
    description,
    busy,
    error,
    onClose,
    onConfirm,
    action,
    finalFocus,
}: {
    title: string;
    description: string;
    busy: boolean;
    error: string;
    onClose: () => void;
    onConfirm: () => void;
    action: string;
    finalFocus?: React.RefObject<HTMLHeadingElement | null>;
}) {
    return (
        <Dialog.Root
            open
            onOpenChange={(open) => {
                if (!open && !busy) onClose();
            }}
        >
            <Dialog.Portal>
                <Dialog.Backdrop className="admin-overlay" />
                <Dialog.Popup
                    className="admin-dialog"
                    finalFocus={finalFocus}
                    aria-busy={busy}
                >
                    <Dialog.Title>{title}</Dialog.Title>
                    <Dialog.Description>{description}</Dialog.Description>
                    {error && (
                        <p className="admin-error" role="alert">
                            {error}
                        </p>
                    )}
                    <div className="admin-dialog-actions">
                        <button disabled={busy} onClick={onClose}>
                            Cancelar
                        </button>
                        <button
                            className="admin-danger-button"
                            disabled={busy}
                            onClick={onConfirm}
                        >
                            {busy ? 'Processando...' : action}
                        </button>
                    </div>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
