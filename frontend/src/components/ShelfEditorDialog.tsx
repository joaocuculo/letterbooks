import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { useId, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from './ui/dialog';
import type {
    BookshelfSummary,
    SavedShelf,
    ShelfInput,
} from '../services/bookshelfService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';

export default function ShelfEditorDialog({
    shelf,
    onClose,
    onSaved,
    save,
}: {
    save: (data: ShelfInput, id?: number) => Promise<SavedShelf>;
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
    const publicId = useId();
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !busy) onClose();
            }}
        >
            <DialogContent
                showCloseButton={false}
                className="domain-dialog shelf-dialog"
            >
                <DialogTitle>
                    {shelf ? 'Editar estante' : 'Criar estante'}
                </DialogTitle>
                <DialogDescription>
                    Organize seus livros em uma coleção personalizada.
                </DialogDescription>
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
                                await save(
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
                        <Input
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
                        <Textarea
                            value={description}
                            maxLength={1000}
                            disabled={busy}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </label>
                    <div className="shelf-public-field">
                        <label htmlFor={publicId}>Estante pública</label>
                        <Switch
                            id={publicId}
                            checked={isPublicShelf}
                            disabled={busy}
                            onCheckedChange={setPublic}
                        />
                    </div>
                    {error && (
                        <p id={errorId} className="library-danger" role="alert">
                            {error}
                        </p>
                    )}
                    <div className="library-dialog-actions">
                        <Button
                            variant="outline"
                            type="button"
                            disabled={busy}
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            loading={busy}
                            variant="default"
                            type="submit"
                            disabled={busy}
                        >
                            {busy ? 'Salvando...' : 'Salvar estante'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
