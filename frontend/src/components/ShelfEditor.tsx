import { useId, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import {
    saveShelf,
    type BookshelfSummary,
    type SavedShelf,
} from '../services/bookshelfService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';

export default function ShelfEditor({
    shelf,
    onClose,
    onSaved,
}: {
    shelf?: BookshelfSummary;
    onClose: () => void;
    onSaved: (shelf: SavedShelf) => void;
}) {
    const [name, setName] = useState(shelf?.name ?? '');
    const [description, setDescription] = useState(shelf?.description ?? '');
    const [isPublicShelf, setPublic] = useState(shelf?.isPublicShelf ?? false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const errorId = useId();
    return (
        <Dialog.Root
            open
            onOpenChange={(open) => {
                if (!open && !busy) onClose();
            }}
        >
            <Dialog.Portal>
                <Dialog.Backdrop className="library-dialog-overlay" />
                <Dialog.Popup className="landing library-remove-dialog shelf-dialog">
                    <Dialog.Title>
                        {shelf ? 'Editar estante' : 'Criar estante'}
                    </Dialog.Title>
                    <Dialog.Description>
                        Organize seus livros em uma coleção personalizada.
                    </Dialog.Description>
                    <form
                        aria-busy={busy}
                        onSubmit={async (event) => {
                            event.preventDefault();
                            if (busy) return;
                            if (!name.trim()) {
                                setError('Informe o nome da estante.');
                                return;
                            }
                            setBusy(true);
                            setError('');
                            try {
                                onSaved(
                                    await saveShelf(
                                        {
                                            name: name.trim(),
                                            description: description.trim(),
                                            isPublicShelf,
                                        },
                                        shelf?.id
                                    )
                                );
                            } catch (e) {
                                setError(
                                    getApiErrorMessage(
                                        e,
                                        'Não foi possível salvar a estante.'
                                    )
                                );
                            } finally {
                                setBusy(false);
                            }
                        }}
                    >
                        <label>
                            Nome
                            <input
                                autoComplete="off"
                                aria-describedby={error ? errorId : undefined}
                                aria-invalid={Boolean(error && !name.trim())}
                                value={name}
                                maxLength={100}
                                disabled={busy}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </label>
                        <label>
                            Descrição (opcional)
                            <textarea
                                value={description}
                                maxLength={1000}
                                disabled={busy}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </label>
                        <label className="shelf-checkbox">
                            <input
                                type="checkbox"
                                checked={isPublicShelf}
                                disabled={busy}
                                onChange={(e) => setPublic(e.target.checked)}
                            />
                            Estante pública
                        </label>
                        {error && (
                            <p
                                id={errorId}
                                className="library-danger"
                                role="alert"
                            >
                                {error}
                            </p>
                        )}
                        <div className="library-dialog-actions">
                            <button
                                type="button"
                                className="library-secondary"
                                disabled={busy}
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                            <button className="shelf-primary" disabled={busy}>
                                {busy ? 'Salvando...' : 'Salvar estante'}
                            </button>
                        </div>
                    </form>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
