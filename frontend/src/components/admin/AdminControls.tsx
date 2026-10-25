import { Feedback } from '../ui/feedback';
import { Button } from '../ui/button';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '../ui/dialog';
export { default as AdminPager } from '../PaginationControls';
export function AdminFailure({
    message,
    retry,
}: {
    message: string;
    retry: () => void;
}) {
    return (
        <Feedback
            kind="error"
            title={message}
            action={
                <Button variant="outline" type="button" onClick={retry}>
                    Tentar novamente
                </Button>
            }
        />
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
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !busy) onClose();
            }}
        >
            <DialogContent
                showCloseButton={false}
                className="domain-dialog domain-admin-dialog"
                finalFocus={finalFocus}
                aria-busy={busy}
            >
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
                {error && (
                    <p className="admin-error" role="alert">
                        {error}
                    </p>
                )}
                <div className="admin-dialog-actions">
                    <Button
                        variant="outline"
                        type="button"
                        disabled={busy}
                        onClick={onClose}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        loading={busy}
                        type="button"
                        disabled={busy}
                        onClick={onConfirm}
                    >
                        {busy ? 'Processando...' : action}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
