import { useId, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { Feedback } from './ui/feedback';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from './ui/dialog';

export interface ShelfChoice {
    id: number;
    name: string;
    containsBook: boolean;
}
export default function ShelfPickerDialog({
    title,
    children,
    choices,
    selected,
    loading = false,
    busy = false,
    error,
    loadError,
    pagination,
    onToggle,
    onClose,
    onAdd,
    onCreate,
    onRetry,
    onSignIn,
}: {
    title: string;
    children?: ReactNode;
    choices: ShelfChoice[];
    selected: ReadonlySet<number>;
    loading?: boolean;
    busy?: boolean;
    error?: string;
    loadError?: string;
    pagination?: ReactNode;
    onToggle: (id: number, checked: boolean) => void;
    onClose: () => void;
    onAdd: () => void;
    onCreate: () => void;
    onRetry: () => void;
    onSignIn?: () => void;
}) {
    const labelId = useId();
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !busy) onClose();
            }}
        >
            <DialogContent
                showCloseButton={false}
                className="domain-dialog shelf-picker-dialog"
            >
                <div className="shelf-picker-heading">
                    <DialogTitle>Adicionar às estantes</DialogTitle>
                    <DialogDescription title={title}>{title}</DialogDescription>
                </div>
                <div className="shelf-picker-toolbar">
                    <span id={labelId}>Selecione as estantes</span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={busy || Boolean(onSignIn)}
                        onClick={onCreate}
                    >
                        <Plus aria-hidden="true" />
                        Criar estante
                    </Button>
                </div>
                <ScrollArea className="shelf-picker-scroll">
                    <fieldset
                        aria-labelledby={labelId}
                        disabled={busy || loading}
                        className="shelf-picker-options"
                    >
                        {loading && (
                            <Feedback
                                kind="loading"
                                title="Carregando suas estantes..."
                            />
                        )}
                        {loadError && (
                            <Feedback
                                kind="error"
                                title={loadError}
                                action={
                                    <Button
                                        variant="outline"
                                        onClick={onSignIn ?? onRetry}
                                    >
                                        {onSignIn
                                            ? 'Entrar'
                                            : 'Tentar novamente'}
                                    </Button>
                                }
                            />
                        )}
                        {!loading && !loadError && !choices.length && (
                            <Feedback
                                kind="empty"
                                title="Você ainda não tem estantes."
                            />
                        )}
                        {choices.map((choice) => (
                            <label
                                key={choice.id}
                                className="shelf-picker-option"
                            >
                                <Checkbox
                                    checked={
                                        choice.containsBook ||
                                        selected.has(choice.id)
                                    }
                                    disabled={
                                        busy || loading || choice.containsBook
                                    }
                                    onCheckedChange={(checked) =>
                                        onToggle(choice.id, checked)
                                    }
                                />
                                <span>
                                    {choice.name}
                                    {choice.containsBook && (
                                        <small>Já contém este livro</small>
                                    )}
                                </span>
                            </label>
                        ))}
                    </fieldset>
                </ScrollArea>
                {pagination}
                <div className="shelf-picker-links">
                    <Link
                        to="/my-books?view=shelves"
                        onClick={(event) => {
                            if (busy) event.preventDefault();
                        }}
                        aria-disabled={busy || undefined}
                    >
                        Ver minhas estantes
                    </Link>
                    <span>
                        {selected.size}{' '}
                        {selected.size === 1 ? 'selecionada' : 'selecionadas'}
                    </span>
                </div>
                {error && (
                    <p
                        role="alert"
                        className="library-danger shelf-picker-error"
                    >
                        {error}
                    </p>
                )}
                <div className="library-dialog-actions">
                    <Button variant="outline" disabled={busy} onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        disabled={
                            busy || loading || !!loadError || !selected.size
                        }
                        loading={busy}
                        onClick={onAdd}
                    >
                        {busy ? 'Adicionando...' : 'Adicionar livro'}
                    </Button>
                </div>
            </DialogContent>
            {children}
        </Dialog>
    );
}
